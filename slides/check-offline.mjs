// Fails if the built deck requests anything outside localhost, so it can be presented with Wi-Fi off.
// Usage: npm run build && npm run check:offline
import { preview } from 'vite'
import { chromium } from 'playwright'

const server = await preview({ preview: { port: 4790, strictPort: true }, build: { outDir: 'dist' } })
const base = server.resolvedUrls.local[0]
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
const external = new Set()
await page.route('**/*', route => {
  const { hostname } = new URL(route.request().url())
  if (hostname === 'localhost' || hostname === '127.0.0.1') return route.continue()
  external.add(route.request().url())
  return route.abort()
})

// Slides load lazily; the overview renders all of them, the presenter view adds the notes.
const views = ['1', 'overview', 'presenter/1']
let total = 0
let pollErrors = 0
for (const view of views) {
  await page.goto(base + view, { waitUntil: 'networkidle' })
  if (view === 'overview') {
    total = await page.locator('.slidev-page').count()
    // Without the live config the poll slides must fall back to their own content, not slide-quiz's error box.
    pollErrors = await page.locator('.sq-error').count()
  }
}

await browser.close()
await server.close()
if (external.size) {
  console.error(`The deck requests ${external.size} external URL(s):\n${[...external].join('\n')}`)
  process.exit(1)
}
if (pollErrors) {
  console.error(`${pollErrors} poll slide(s) show a slide-quiz error instead of their static content.`)
  process.exit(1)
}
console.log(`OK: ${views.join(', ')} (${total} slides in the overview) load without leaving localhost.`)
