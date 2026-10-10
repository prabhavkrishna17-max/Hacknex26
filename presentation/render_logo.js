// Rasterises the real HNX brand mark (frontend/public/favicon.svg) to PNG for the deck.
const fs = require("fs")
const path = require("path")
const os = require("os")
const puppeteer = require("puppeteer-core")

;(async () => {
  const svg = fs.readFileSync(path.join(__dirname, "..", "frontend", "public", "favicon.svg"), "utf8")
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
    userDataDir: path.join(os.tmpdir(), "hnx-deck-edge-logo-" + Date.now()),
    defaultViewport: { width: 512, height: 512, deviceScaleFactor: 1 },
  })
  const page = await browser.newPage()
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${svg.replace('width="48" height="48"', 'width="512" height="512"')}</body></html>`
  )
  fs.mkdirSync(path.join(__dirname, "assets"), { recursive: true })
  await page.screenshot({ path: path.join(__dirname, "assets", "hnx_mark.png"), omitBackground: true, clip: { x: 0, y: 0, width: 512, height: 512 } })
  await browser.close()
  console.log("logo ok")
})()
