// Rehearses the live debate poll on this laptop: AnyCable, the Netlify functions and three scripted phones.
// Fails unless the projector, a tab opened after vote #1 and a brand-new tab all show the same counts.
// Needs anycable-go (brew install anycable-go), Google Chrome and internet (the voting page loads from a CDN).
// Usage: npm run rehearse:poll
import { spawn, execFileSync } from 'node:child_process'
import { chromium } from 'playwright'

const site = 'http://localhost:8888/'
const wsUrl = 'ws://localhost:8080/cable'
// A fresh group each run, so votes saved by an earlier run don't count.
const group = `rehearsal-${Date.now()}`

execFileSync('npx', ['slidev', 'build', '--out', 'dist-rehearsal'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_SLIDE_QUIZ_WS_URL: wsUrl, VITE_SLIDE_QUIZ_GROUP_ID: group },
})

const children = []
const start = (cmd, args, opts = {}) => {
  // Own process group, so stopping it also stops what netlify dev starts.
  const child = spawn(cmd, args, { detached: true, stdio: 'ignore', ...opts })
  children.push(child)
}
const stopAll = () => children.forEach(c => { try { process.kill(-c.pid) } catch {} })
process.on('exit', stopAll)

// The broker gives presence: without it phones never learn the question.
start('anycable-go', ['--public', '--broadcast_adapter', 'http', '--broker', 'memory'])
start('npx', ['-y', 'netlify-cli@23.15.1', 'dev', '--offline', '--framework', '#static',
  '--dir', 'slides/dist-rehearsal', '--functions', 'slides/netlify/functions', '--port', '8888', '--no-open'],
{ cwd: '..', env: { ...process.env, NETLIFY_TELEMETRY_DISABLED: '1', BROWSER: 'none' } })

const waitFor = async (url) => {
  for (let i = 0; i < 120; i++) {
    if (await fetch(url).then(r => r.ok, () => false)) return
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error(`${url} did not come up`)
}
await waitFor('http://localhost:8080/health')
await waitFor(site + '.netlify/functions/quiz-votes?quizGroupId=' + group)

const browser = await chromium.launch({ channel: 'chrome' })
const open = async (url) => {
  const page = await (await browser.newContext()).newPage()
  await page.goto(url)
  await page.waitForTimeout(2500)
  return page
}
const counts = async (page, slide) => {
  const columns = page.locator(`.slidev-page-${slide} .sq-results`)
  const out = []
  for (let i = 0; i < await columns.count(); i++)
    out.push((await columns.nth(i).locator('.sq-result-bar__count').allInnerTexts()).join(','))
  return out.join(' | ')
}
const vote = async (phones, quizId, answers) => {
  for (const [i, answer] of answers.entries())
    await phones[i].locator(`[data-quiz-id="${quizId}"] button[data-answer="${answer}"]`).click()
  await phones[0].waitForTimeout(2500)
}
const next = async (page) => {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(2000)
}

let failed = false
const check = (label, actual, expected) => {
  const ok = actual === expected
  failed ||= !ok
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}: ${actual}${ok ? '' : ` (expected ${expected})`}`)
}

try {
  // Slide numbers follow slides.md: 3 vote #1, 4 its results, 5 vote #2, 6 before and after.
  const projector = await open(site + '3')
  const phones = []
  for (let i = 0; i < 3; i++) phones.push(await open(`${site}quiz.html?wsUrl=${wsUrl}&quizGroupId=${group}`))

  await vote(phones, 'debate-1', ['A', 'B', 'B'])
  await next(projector)
  check('vote #1, projector', await counts(projector, 4), '1,2,0')
  check('vote #1, tab opened after voting', await counts(await open(site + '4'), 4), '1,2,0')

  await next(projector)
  await vote(phones, 'debate-2', ['C', 'C', 'A'])
  await next(projector)
  check('before and after, projector', await counts(projector, 6), '1,2,0 | 1,0,2')
  check('before and after, brand-new tab', await counts(await open(site + '6'), 6), '1,2,0 | 1,0,2')
}
finally {
  await browser.close()
  stopAll()
}
process.exit(failed ? 1 : 0)
