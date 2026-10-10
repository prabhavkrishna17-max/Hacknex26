// Captures real screenshots of the running HNX Legal Intelligence app for the pitch deck.
// Requires: frontend on http://localhost:3000 and backend on http://127.0.0.1:8000.
// Usage: node capture_screenshots.js
const fs = require("fs")
const path = require("path")
const puppeteer = require("puppeteer-core")

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
const OUT = path.join(__dirname, "assets", "screenshots")
const APP = "http://localhost:3000/"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForText(page, regex, timeoutMs = 90000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const text = await page.evaluate(() => document.querySelector("main")?.innerText || "")
    if (regex.test(text)) return text
    await sleep(500)
  }
  throw new Error(`Timed out waiting for ${regex}`)
}

async function clickButtonByText(page, text) {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.innerText.trim().includes(t))
    if (!b) return false
    b.click()
    return true
  }, text)
  if (!ok) throw new Error(`Button not found: ${text}`)
}

async function ask(page, question) {
  const input = await page.$(".question-input-field")
  await input.click({ clickCount: 3 })
  await page.keyboard.press("Backspace")
  await input.type(question, { delay: 5 })
  await page.keyboard.press("Enter")
  await sleep(800)
  return waitForText(page, /(SUPPORTED|PARTIAL|CONFLICTING|INSUFFICIENT) ·/)
}

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 1.5 },
    userDataDir: path.join(require("os").tmpdir(), "hnx-deck-edge-profile-" + Date.now()),
    args: ["--force-prefers-reduced-motion", "--no-first-run", "--no-default-browser-check"],
  })
  const page = await browser.newPage()
  const log = {}
  await page.goto(APP, { waitUntil: "networkidle2" })
  await sleep(1500)
  await page.screenshot({ path: path.join(OUT, "01_landing.png") })

  // Evidence-backed answer on the sample agreement (DOC-006)
  await page.click("#global-try-sample-btn")
  await sleep(800)
  const supported = await ask(page, "Who can terminate this agreement?")
  log.supported = supported.slice(supported.indexOf("Answer"), supported.indexOf("Answer") + 600)
  await sleep(800)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: path.join(OUT, "02_answer_supported.png") })
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("main *")].find((e) => e.childElementCount === 0 && /^Answer$/.test(e.textContent.trim()))
    el?.scrollIntoView({ block: "start" })
    window.scrollBy(0, -90)
  })
  await sleep(500)
  await page.screenshot({ path: path.join(OUT, "03_answer_supported_detail.png") })

  // Safe abstention
  await page.evaluate(() => window.scrollTo(0, 0))
  const abstain = await ask(page, "What is the per-node monthly enterprise license fee?")
  log.abstain = abstain.slice(abstain.indexOf("Answer"), abstain.indexOf("Answer") + 500)
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("main *")].find((e) => e.childElementCount === 0 && /^Answer$/.test(e.textContent.trim()))
    el?.scrollIntoView({ block: "start" })
    window.scrollBy(0, -90)
  })
  await sleep(500)
  await page.screenshot({ path: path.join(OUT, "04_abstention.png") })

  // Legal drafting desk with a generated notice
  await page.click("#nav-tab-drafting")
  await sleep(1500)
  await clickButtonByText(page, "Fill SLA/Spoilage Preset")
  await sleep(300)
  await clickButtonByText(page, "Generate Evidence-Backed Draft")
  await page.waitForSelector(".draft-output-card textarea", { timeout: 90000 })
  await sleep(800)
  log.draft = await page.evaluate(() => document.querySelector(".draft-output-card textarea").value.slice(0, 400))
  await page.evaluate(() => {
    document.querySelector(".draft-output-card").scrollIntoView({ block: "start" })
    window.scrollBy(0, -80)
  })
  await sleep(500)
  await page.screenshot({ path: path.join(OUT, "05_drafting_output.png") })

  fs.writeFileSync(path.join(OUT, "capture_log.json"), JSON.stringify(log, null, 2))
  await browser.close()
  console.log("captured", fs.readdirSync(OUT))
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
