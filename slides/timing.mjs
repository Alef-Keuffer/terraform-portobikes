// Estimates speaking time per section from the speaker notes in slides.md.
// Sections start at the `<!-- ===== Name. ~N min ===== -->` markers.
// Spoken words: notes minus [stage directions] and paragraphs that are instructions to the speaker.
// Backup slides (shown only if something fails or someone asks) don't count.
// Slides timed by the clock instead of by words (demo, debate, votes) use FIXED below.
import { load } from '@slidev/parser/fs'

const WPM = 130 // a calm presentation pace for non-native speakers
const FIXED = {
  '→ LIVE DEMO': [4, 'six demo steps with narration; the recording alone runs 1:20'],
  'PortoBikes must decide. What should it do?': [1, 'vote #1: QR code, phones, bars settle'],
  'Three options, 90 seconds each': [5, '3 × 90 s, kept by the timekeeper, plus the Crossplane line'],
  "You've heard all three sides. What should PortoBikes do?": [1, 'vote #2'],
  '→ LIVE: `tofu plan`': [1.5, 'tofu init, plan, destroy with narration'],
}
const INSTRUCTION = /^(If |After the talk|Detail if|Be honest if|Demo-day|Then switch|Press play|- |[A-Z][A-Z' -]{3,}[.:(])/

const { slides } = await load(import.meta.dirname, import.meta.dirname + '/slides.md')
const sections = []
for (const s of slides) {
  const marker = s.content.match(/<!-- ===== (.+?)\. ~([\d.]+) min ===== -->/)
  if (marker) sections.push({ name: marker[1], budget: +marker[2], words: 0, fixed: 0, notes: [] })
  const sec = sections.at(-1)
  const note = s.note ?? ''
  if (/^Backup:/.test(s.title ?? '') || /^(BACKUP SLIDE|ONLY IF)/.test(note)) continue
  const fixed = FIXED[s.title]
  if (fixed) { sec.fixed += fixed[0]; sec.notes.push(`${s.title}: ${fixed[0]} min, ${fixed[1]}`); continue }
  sec.words += note
    .split(/\n\s*\n/)
    .filter((p) => !INSTRUCTION.test(p.trim()))
    .join(' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

const fmt = (n) => n.toFixed(1).padStart(5)
let total = 0, budget = 0
console.log(`At ${WPM} words per minute:\n`)
console.log('budget  words  speech  fixed  total  section')
for (const sec of sections) {
  const t = sec.words / WPM + sec.fixed
  total += t; budget += sec.budget
  console.log(`${fmt(sec.budget)}  ${String(sec.words).padStart(5)}  ${fmt(sec.words / WPM)}  ${fmt(sec.fixed)}  ${fmt(t)}  ${sec.name}${t > sec.budget + 0.5 ? '  ← over' : ''}`)
}
console.log(`${fmt(budget)}                       ${fmt(total)}  whole talk\n`)
for (const sec of sections) for (const n of sec.notes) console.log(`fixed: ${n}`)
