// Captures the unseen-contract demo (UNSEEN-LOGISTICS-001) from the running app.
// Prerequisite: the contract has been uploaded to the backend (python verify_demo.py does this).
const fs = require("fs")
const path = require("path")
const os = require("os")
const puppeteer = require("puppeteer-core")

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
const OUT = path.join(__dirname, "assets", "screenshots")
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function ask(page, q) {
  const input = await page.$(".question-input-field")
  await input.click({ clickCount: 3 })
  await page.keyboard.press("Backspace")
  await input.type(q, { delay: 5 })
  await page.keyboard.press("Enter")
  const start = Date.now()
  await sleep(800)
  while (Date.now() - start < 90000) {
    const t = await page.evaluate(() => document.querySelector("main")?.innerText || "")
    if (/(SUPPORTED|PARTIAL|CONFLICTING|INSUFFICIENT) ·/.test(t) && !/Analyzing|Retrieving|Verifying/.test(t)) return t
    await sleep(500)
  }
  throw new Error("answer timeout")
}

async function scrollToAnswer(page) {
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("main *")].find((e) => e.childElementCount === 0 && /^Answer$/.test(e.textContent.trim()))
    el?.scrollIntoView({ block: "start" })
    window.scrollBy(0, -90)
  })
  await sleep(500)
}

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    userDataDir: path.join(os.tmpdir(), "hnx-deck-edge-demo-" + Date.now()),
    defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 1.5 },
    args: ["--no-first-run", "--no-default-browser-check"],
  })
  const page = await browser.newPage()
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" })
  await sleep(1200)
  await page.click("#nav-tab-workspace")
  await sleep(800)
  // Select the uploaded unseen contract in the document list
  const picked = await page.evaluate(() => {
    const el = [...document.querySelectorAll("button, li, div[role=button], [class*=doc]")].find(
      (e) => /Commercial Logistics/.test(e.textContent) && e.textContent.length < 200
    )
    if (!el) return false
    el.click()
    return true
  })
  if (!picked) throw new Error("UNSEEN-LOGISTICS-001 not in document list — run verify_demo.py first")
  await sleep(1000)
  const log = {}
  log.crossClause = (await ask(page, "Is the service provider liable for spoilage of temperature sensitive goods when customs detention delays delivery?")).slice(0, 1500)
  await scrollToAnswer(page)
  await page.screenshot({ path: path.join(OUT, "06_unseen_cross_clause.png") })
  log.abstain = (await ask(page, "What are the aircraft hangar maintenance guidelines and hazardous chemical disposal protocols?")).slice(0, 800)
  await scrollToAnswer(page)
  await page.screenshot({ path: path.join(OUT, "07_unseen_abstention.png") })
  fs.writeFileSync(path.join(OUT, "capture_demo_log.json"), JSON.stringify(log, null, 2))
  await browser.close()
  console.log("ok")
})().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
