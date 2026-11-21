// Builds an AI-narrated video of the deck: slide frames + narration.md read aloud by VoiceStudio.
// Usage: npm run narrate   (needs ffmpeg and VoiceStudio's backend on VOICESTUDIO_URL)
//   npm run narrate:preview             slides 1–3 only (about a minute) → .narration/preview.mp4, to check the voice
//   NARRATE_TTS=say npm run narrate     quick draft with the macOS voice instead
//   NARRATE_MODEL / NARRATE_VOICE       VoiceStudio engine and voice; default: Kokoro preset am_michael
//                                       fallback narrator: NARRATE_MODEL=omnivoice NARRATE_VOICE='Demo Voice'
//   NARRATE_INSTRUCT                    style instruction (OmniVoice: voice-design tags)
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const WORK = '.narration'
const PREVIEW = process.argv.includes('--preview')
const OUT = join(WORK, PREVIEW ? 'preview.mp4' : 'presentation.mp4')
const URL = process.env.VOICESTUDIO_URL ?? 'http://127.0.0.1:3900'
// One narrator for every shot: a Kokoro preset is always the same speaker (OmniVoice's 'default' is not).
const MODEL = process.env.NARRATE_MODEL ?? 'mlx-audio' // VoiceStudio's engine that runs Kokoro
const VOICE = process.env.NARRATE_VOICE ?? 'am_michael'
const INSTRUCT = process.env.NARRATE_INSTRUCT
const GAP = 0.6 // seconds of silence after each shot
const PAUSE = 1 // seconds per [pause]
const VF = 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:white,fps=30,format=yuv420p'
const AENC = ['-c:a', 'aac', '-ar', '48000', '-ac', '1']
const VENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20']

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'inherit'] }).toString()
const ff = (...args) => run('ffmpeg', ['-y', '-loglevel', 'error', ...args])
const duration = f => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))

// narration.md → [{ head: '004-02' | 'video recording.mp4 0 30', text }]
const shots = readFileSync('narration.md', 'utf8')
  .replace(/^<!--[\s\S]*?-->/, '')
  .split(/^## /m).slice(1)
  .map(b => { const [head, ...rest] = b.split('\n'); return { head: head.trim(), text: rest.join(' ').trim() } })
  .filter(({ head }) => !PREVIEW || /^00[1-3]-/.test(head))

mkdirSync(join(WORK, 'tts'), { recursive: true })
run('npx', ['slidev', 'export', '--format', 'png', '--with-clicks', '--output', join(WORK, 'frames'), '--timeout', '60000', ...(PREVIEW ? ['--range', '1-3'] : [])])
for (const { head } of shots) {
  if (!head.startsWith('video ') && !existsSync(join(WORK, 'frames', `${head}.png`))) throw new Error(`narration.md: no exported frame ${head}.png`)
}

async function tts(text) {
  // Cached by content, so re-running after editing one block only re-voices that block.
  const file = join(WORK, 'tts', createHash('sha1').update([process.env.NARRATE_TTS, MODEL, VOICE, INSTRUCT, text].join('\0')).digest('hex') + '.wav')
  if (existsSync(file)) return file
  if (process.env.NARRATE_TTS === 'say') {
    run('say', ['-o', file, '--data-format=LEI16@24000', text])
    return file
  }
  // VoiceStudio sometimes drops the connection mid-response; retry those.
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(`${URL}/v1/audio/speech`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: MODEL, input: text, voice: VOICE, instructions: INSTRUCT, response_format: 'wav' }),
      })
      if (!res.ok) throw new Error(`VoiceStudio ${res.status}: ${await res.text()}`)
      writeFileSync(file, Buffer.from(await res.arrayBuffer()))
      return file
    } catch (err) {
      if (attempt >= 3 || err.message.startsWith('VoiceStudio ')) throw err
      console.warn(`retrying TTS (${err.cause?.code ?? err.message})`)
    }
  }
}

// One audio file per shot: the spoken parts, with [pause] as silence, then GAP.
async function voice(text, i) {
  const parts = text.split('[pause]').map(t => t.trim())
  const inputs = [], labels = []
  for (const [k, part] of parts.entries()) {
    if (k > 0) { inputs.push('-f', 'lavfi', '-t', `${PAUSE}`, '-i', 'anullsrc=r=24000:cl=mono'); labels.push(`[${labels.length}:a]`) }
    if (part) { inputs.push('-i', await tts(part)); labels.push(`[${labels.length}:a]`) }
  }
  const file = join(WORK, `shot-${i}.wav`)
  ff(...inputs, '-filter_complex', `${labels.join('')}concat=n=${labels.length}:v=0:a=1,aresample=24000,apad=pad_dur=${GAP}`, file)
  return file
}

const list = []
for (const [i, { head, text }] of shots.entries()) {
  const audio = await voice(text, i)
  const len = duration(audio)
  const out = join(WORK, `shot-${i}.mp4`)
  if (head.startsWith('video ')) {
    const [, src, from, to] = head.split(/\s+/)
    const clip = Number(to) - Number(from)
    // Freeze the last frame if the narration outlasts the clip.
    ff('-ss', from, '-t', `${clip}`, '-i', join('public', src), '-i', audio,
      '-map', '0:v', '-map', '1:a', '-vf', `${VF},tpad=stop_mode=clone:stop_duration=${Math.max(0, len - clip)}`,
      '-af', `apad`, '-t', `${Math.max(clip, len)}`, ...VENC, ...AENC, out)
  } else {
    ff('-loop', '1', '-i', join(WORK, 'frames', `${head}.png`), '-i', audio, '-vf', VF, '-t', `${len}`, ...VENC, '-tune', 'stillimage', ...AENC, out)
  }
  list.push(`file 'shot-${i}.mp4'`)
  console.log(`${i + 1}/${shots.length} ${head} (${len.toFixed(1)} s)`)
}
writeFileSync(join(WORK, 'shots.txt'), list.join('\n'))
ff('-f', 'concat', '-safe', '0', '-i', join(WORK, 'shots.txt'), '-c', 'copy', '-movflags', '+faststart', OUT)
console.log(`→ ${OUT} (${(duration(OUT) / 60).toFixed(1)} min)`)
