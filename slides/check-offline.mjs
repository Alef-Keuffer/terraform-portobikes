// Fails if the built deck requests anything outside localhost, so it can be presented with Wi-Fi off,
// or if the backup demo recording doesn't load.
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
for (const view of views) {
  await page.goto(base + view, { waitUntil: 'networkidle' })
  if (view === 'overview') {
    total = await page.locator('.slidev-page').count()
    // The backup demo recording must actually load, not just avoid the network.
    await page.waitForFunction(() => {
      const videos = [...document.querySelectorAll('video')]
      return videos.length > 0 && videos.every(v => v.readyState >= 1)
    }, null, { timeout: 15000 })
  }
}

await browser.close()
await server.close()
if (external.size) {
  console.error(`The deck requests ${external.size} external URL(s):\n${[...external].join('\n')}`)
  process.exit(1)
}
console.log(`OK: ${views.join(', ')} (${total} slides in the overview) load without leaving localhost; the backup recording loads.`)
