// Builds presentation/HNX_Legal_Intelligence_Pitch.pptx — HACKNEX 2026 pitch deck.
// Every claim is sourced from the repository, the evaluation artifacts in data/results/, the
// pytest run of 9 Oct 2026 and the live verification in assets/demo_verification.json.
// See README.md for the claim-by-claim verification notes.
//
// Usage (from presentation/):  node build_deck.js
const path = require("path")
const pptxgen = require("pptxgenjs")
// Optional: lib/apply_theme.js (from Anthropic's pptx skill, not redistributed in this repo) writes the
// palette into the deck theme. Without it the deck still builds; scheme colours fall back to Office defaults.
let applyTheme = null
try {
  ;({ applyTheme } = require("./lib/apply_theme.js"))
} catch {
  console.warn("lib/apply_theme.js not found — skipping theme colour step (see README).")
}

const OUT = path.join(__dirname, "HNX_Legal_Intelligence_Pitch.pptx")
const A = (p) => path.join(__dirname, "assets", p)

// ---------------------------------------------------------------------------------------------
// Theme — the product's own identity: midnight navy, warm ivory, restrained brass
// ---------------------------------------------------------------------------------------------
const THEME = {
  name: "HNX Legal Editorial",
  headFontFace: "Georgia",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "080C15", // midnight navy (slide background)
    lt1: "F4F0E8", // warm ivory (primary text on navy, document sheets)
    dk2: "101827", // deep legal navy
    lt2: "AEB6C4", // muted slate (secondary text on navy)
    accent1: "C5A059", // brass
    accent2: "202B3D", // elevated panel
    accent3: "4CB58A", // SUPPORTED
    accent4: "E2A93B", // INSUFFICIENT
    accent5: "9A86D8", // CONFLICTING
    accent6: "D9654E", // risk
    hlink: "DFBE7C",
    folHlink: "9E7D3B",
  },
}
const HEX = {
  navy: "080C15",
  deep: "101827",
  panel: "202B3D",
  panelHi: "273449",
  ivory: "F4F0E8",
  ivoryDim: "E4DDCF",
  slate: "AEB6C4",
  brass: "C5A059",
  brassDark: "8A6A2C",
  line: "33405A",
  green: "4CB58A",
  amber: "E2A93B",
  violet: "9A86D8",
  red: "D9654E",
  ink: "1A2232",
  inkMuted: "4A5468",
}

const pres = new pptxgen()
pres.layout = "LAYOUT_WIDE" // 13.333 x 7.5 in
pres.title = "HNX Legal Intelligence — HACKNEX 2026 pitch"
pres.author = "Team No Sleep Till Deploy"
pres.company = "HNX Legal Intelligence"
pres.subject = "HNX26EPS01 — Agentic Legal Assistant"
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace }
const C = pres.SchemeColor

const W = 13.333
const MX = 0.6
const CW = W - 2 * MX
const MONO = "Consolas"
const SERIF = "Georgia"

// ---------------------------------------------------------------------------------------------
// Layouts (pptxgenjs "slide masters" are slide layouts under one master)
// ---------------------------------------------------------------------------------------------
const FOOTER = "HNX Legal Intelligence   ·   HNX26EPS01 Agentic Legal Assistant   ·   Team No Sleep Till Deploy"

pres.defineSlideMaster({
  title: "HNX_CONTENT",
  background: { color: HEX.navy },
  margin: [0.5, MX, 0.6, MX],
  objects: [
    {
      placeholder: {
        options: { name: "title", type: "title", x: MX, y: 0.62, w: CW, h: 0.8, fontFace: SERIF, fontSize: 32, color: C.background1, valign: "middle", align: "left", margin: 0 },
        text: "",
      },
    },
    { image: { path: A("hnx_mark.png"), x: MX, y: 6.98, w: 0.26, h: 0.26 } },
    { text: { text: FOOTER, options: { x: MX + 0.36, y: 6.97, w: 9, h: 0.28, fontSize: 9, color: C.background2, margin: 0, valign: "middle" } } },
  ],
  slideNumber: { x: W - MX - 0.6, y: 6.97, w: 0.6, h: 0.28, fontSize: 9, color: HEX.slate, align: "right" },
})

pres.defineSlideMaster({
  title: "HNX_COVER",
  background: { color: HEX.navy },
  objects: [
    {
      placeholder: {
        options: { name: "title", type: "title", x: MX, y: 1.95, w: 7.2, h: 2.0, fontFace: SERIF, fontSize: 50, color: C.background1, valign: "top", align: "left", margin: 0 },
        text: "",
      },
    },
  ],
})

pres.defineSlideMaster({
  title: "HNX_CLOSING",
  background: { color: HEX.navy },
  objects: [
    {
      placeholder: {
        options: { name: "title", type: "title", x: MX, y: 1.55, w: 9.4, h: 2.3, fontFace: SERIF, fontSize: 44, color: C.background1, valign: "top", align: "left", margin: 0 },
        text: "",
      },
    },
  ],
})

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------
const tb = (opts) => ({ isTextBox: true, margin: 0, ...opts })

function kicker(slide, text, y = 0.3) {
  slide.addText(text.toUpperCase(), tb({ objectName: "Kicker", x: MX, y, w: CW, h: 0.3, fontSize: 11, bold: true, color: C.accent1, charSpacing: 2.5 }))
}

function panel(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.ShapeType.roundRect, {
    objectName: opts.name || "Panel",
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: opts.fill || HEX.panel },
    line: { color: opts.line || HEX.line, width: opts.lineW || 0.75 },
    shadow: opts.shadow ? { type: "outer", blur: 8, offset: 3, angle: 90, color: "000000", opacity: 0.35 } : undefined,
  })
}

function sheet(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.ShapeType.roundRect, {
    objectName: opts.name || "Evidence sheet",
    x, y, w, h,
    rectRadius: 0.06,
    fill: { color: opts.fill || HEX.ivory },
    line: { color: opts.line || "D8D0BF", width: 0.75 },
    rotate: opts.rotate || 0,
    shadow: { type: "outer", blur: 12, offset: 4, angle: 90, color: "000000", opacity: 0.45 },
  })
}

const STATES = {
  SUPPORTED: { fill: HEX.green, label: "SUPPORTED" },
  INSUFFICIENT: { fill: HEX.amber, label: "INSUFFICIENT" },
  CONFLICTING: { fill: HEX.violet, label: "CONFLICTING" },
  RISK: { fill: HEX.red, label: "" },
}

// Status chip: label text + tinted fill + border, so state never depends on colour alone
function chip(slide, x, y, text, opts = {}) {
  const color = opts.color || HEX.brass
  const w = opts.w || Math.max(0.9, 0.105 * text.length + 0.45)
  slide.addShape(pres.ShapeType.roundRect, {
    objectName: "Chip " + text,
    x, y, w, h: 0.32, rectRadius: 0.16,
    fill: { color, transparency: opts.solid ? 0 : 82 },
    line: { color, width: 1 },
  })
  slide.addText(text, tb({ x, y, w, h: 0.32, fontSize: opts.fontSize || 10.5, bold: true, color: opts.textColor || (opts.solid ? HEX.navy : color), align: "center", valign: "middle", charSpacing: 1 }))
  return w
}

function statusChip(slide, x, y, state, suffix) {
  const s = STATES[state]
  return chip(slide, x, y, suffix ? `${s.label} · ${suffix}` : s.label, { color: s.fill, textColor: opts_textOn(s.fill) })
}
function opts_textOn(fill) {
  return fill === HEX.amber ? "B07A12" : fill === HEX.green ? "2E8A64" : fill
}

function numberDot(slide, x, y, n, opts = {}) {
  slide.addShape(pres.ShapeType.ellipse, {
    objectName: "Step " + n, x, y, w: 0.42, h: 0.42,
    fill: { color: opts.fill || HEX.navy }, line: { color: HEX.brass, width: 1.25 },
  })
  slide.addText(String(n), tb({ x, y, w: 0.42, h: 0.42, fontFace: SERIF, fontSize: 14, color: C.accent1, align: "center", valign: "middle" }))
}

function bulletList(items, opts = {}) {
  return items.map((t, i) => ({
    text: t,
    options: { bullet: { indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: opts.space ?? 8 },
  }))
}

// ---------------------------------------------------------------------------------------------
// Slide 1 — The hook
// ---------------------------------------------------------------------------------------------
pres.addSection({ title: "Opening" })
{
  const s = pres.addSlide({ masterName: "HNX_COVER", sectionTitle: "Opening" })
  s.addImage({ path: A("hnx_mark.png"), x: MX, y: 0.55, w: 0.55, h: 0.55, objectName: "HNX mark" })
  s.addText(
    [
      { text: "HNX Legal Intelligence", options: { fontFace: SERIF, fontSize: 17, color: HEX.ivory, breakLine: true } },
      { text: "EVIDENCE-GROUNDED CONTRACT ANALYSIS", options: { fontSize: 9, color: HEX.brass, charSpacing: 2.5 } },
    ],
    tb({ x: MX + 0.7, y: 0.55, w: 5, h: 0.55, valign: "middle" })
  )
  s.addText("HACKNEX 2026   ·   HNX26EPS01 — AGENTIC LEGAL ASSISTANT", tb({ x: MX, y: 1.5, w: 7.2, h: 0.3, fontSize: 11.5, bold: true, color: C.accent1, charSpacing: 2.5 }))
  s.addText("Legal AI must prove what it says", { placeholder: "title" })
  s.addText(
    "HNX Legal Intelligence — evidence-grounded analysis for complex commercial contracts",
    tb({ x: MX, y: 4.05, w: 6.7, h: 0.85, fontSize: 20, color: C.background2, valign: "top" })
  )
  s.addText("A fluent answer is not the same as a reliable legal answer.", tb({ x: MX, y: 5.05, w: 7, h: 0.45, fontFace: SERIF, italic: true, fontSize: 17, color: C.accent1 }))
  s.addText(
    "Team No Sleep Till Deploy   ·   Karunya Institute of Technology and Sciences, Coimbatore   ·   Theme: AI & Emerging Technologies",
    tb({ x: MX, y: 6.55, w: 11, h: 0.3, fontSize: 11, color: C.background2 })
  )

  // Signature visual: stacked contract sheets, one verbatim span highlighted and traced to its citation
  sheet(s, 8.95, 0.95, 3.45, 4.55, { fill: "B9B2A3", rotate: 7, name: "Sheet back" })
  sheet(s, 8.55, 1.05, 3.45, 4.55, { fill: "D7D0C2", rotate: -4, name: "Sheet middle" })
  sheet(s, 8.2, 1.2, 3.6, 4.75, { name: "Sheet front" })
  s.addText("UNSEEN-LOGISTICS-001", tb({ x: 8.5, y: 1.42, w: 3, h: 0.25, fontFace: MONO, fontSize: 9, color: HEX.inkMuted }))
  s.addText("§ 2.3  Temperature Guarantee", tb({ x: 8.5, y: 1.7, w: 3.1, h: 0.32, fontFace: SERIF, fontSize: 13, color: HEX.ink }))
  const bars = [3.0, 2.7, 2.95, 1.9]
  bars.forEach((bw, i) => s.addShape(pres.ShapeType.rect, { objectName: "Clause line", x: 8.5, y: 2.2 + i * 0.22, w: bw, h: 0.07, fill: { color: "CFC7B6" }, line: { type: "none" } }))
  s.addShape(pres.ShapeType.rect, { objectName: "Highlighted span", x: 8.42, y: 3.13, w: 3.18, h: 0.92, fill: { color: HEX.brass, transparency: 72 }, line: { color: HEX.brass, width: 1 } })
  s.addText(
    "“…shall remain strictly liable for consignment spoilage exceeding four (4) hours… regardless of customs detention.”",
    tb({ x: 8.52, y: 3.16, w: 3.0, h: 0.86, fontSize: 10.5, italic: true, color: HEX.ink, valign: "middle" })
  )
  ;[2.75, 3.0, 2.4, 2.85, 1.6].forEach((bw, i) => s.addShape(pres.ShapeType.rect, { objectName: "Clause line", x: 8.5, y: 4.25 + i * 0.22, w: bw, h: 0.07, fill: { color: "CFC7B6" }, line: { type: "none" } }))
  s.addShape(pres.ShapeType.line, { objectName: "Trace line", x: 11.6, y: 3.6, w: 0.55, h: 1.55, line: { color: HEX.brass, width: 1.25, endArrowType: "oval" } })
  panel(s, 10.35, 5.15, 2.55, 1.15, { fill: HEX.deep, line: HEX.brass, lineW: 1, shadow: true, name: "Citation card" })
  s.addText("VERBATIM QUOTE · CHECKED", tb({ x: 10.5, y: 5.25, w: 2.3, h: 0.25, fontSize: 9, bold: true, color: HEX.brass, charSpacing: 1.5 }))
  s.addText("UNSEEN-LOGISTICS-001#c004", tb({ x: 10.5, y: 5.5, w: 2.35, h: 0.25, fontFace: MONO, fontSize: 9.5, color: HEX.ivory }))
  statusChip(s, 10.5, 5.85, "SUPPORTED")

  s.addNotes(
    [
      "[~20 s]",
      "SAY: We're No Sleep Till Deploy, and this is HNX Legal Intelligence for HNX26EPS01, the Agentic Legal Assistant. Our premise is simple: in legal work, a fluent answer isn't a reliable one. If an AI says who carries liability, it has to show the exact clause — or admit that it doesn't know.",
      "TAKEAWAY: Legal AI must prove what it says.",
      "NEXT: Here's why that matters on a real clause.",
    ].join("\n\n")
  )
}

// ---------------------------------------------------------------------------------------------
// Slide 2 — The problem
// ---------------------------------------------------------------------------------------------
pres.addSection({ title: "Problem" })
{
  const s = pres.addSlide({ masterName: "HNX_CONTENT", sectionTitle: "Problem" })
  kicker(s, "The problem")
  s.addText("A fluent answer is not a verifiable answer", { placeholder: "title" })

  const rows = [
    ["Obligations are scattered", "Duties, carve-outs and schedules sit in different sections."],
    ["Exceptions change the answer", "“Subject to” and “notwithstanding” can reverse a general rule."],
    ["Fluency hides missing support", "A generic model can answer confidently with no source behind it."],
    ["Silence matters", "What the contract does not say is often the key finding."],
  ]
  rows.forEach(([h, d], i) => {
    const y = 1.8 + i * 1.2
    s.addText(String(i + 1).padStart(2, "0"), tb({ x: MX, y, w: 0.7, h: 0.5, fontFace: SERIF, fontSize: 24, color: C.accent1 }))
    s.addText(h, tb({ x: MX + 0.8, y: y + 0.02, w: 4.9, h: 0.36, fontSize: 17, bold: true, color: C.background1 }))
    s.addText(d, tb({ x: MX + 0.8, y: y + 0.4, w: 4.9, h: 0.55, fontSize: 14, color: C.background2, valign: "top" }))
  })

  // Fluent vs verifiable — same question, real contract
  panel(s, 6.75, 1.8, 5.98, 1.75, { name: "Fluent answer card" })
  s.addText("FLUENT ANSWER  ·  ILLUSTRATIVE", tb({ x: 7.05, y: 1.95, w: 5.4, h: 0.28, fontSize: 10, bold: true, color: C.background2, charSpacing: 2 }))
  s.addText("“The provider is not liable for delays caused by customs.”", tb({ x: 7.05, y: 2.27, w: 5.5, h: 0.6, fontFace: SERIF, fontSize: 17, color: C.background1 }))
  let cx = 7.05
  cx += chip(s, cx, 3.0, "NO SOURCE", { color: HEX.red }) + 0.15
  chip(s, cx, 3.0, "EXCEPTION MISSED", { color: HEX.red })

  sheet(s, 6.75, 3.8, 5.98, 2.75, { name: "Verifiable answer sheet" })
  s.addText("VERIFIABLE ANSWER", tb({ x: 7.05, y: 3.98, w: 3, h: 0.28, fontSize: 10, bold: true, color: HEX.brassDark, charSpacing: 2 }))
  s.addText(
    [
      { text: "Not liable for customs-clearance delays ", options: {} },
      { text: "(§2.2)", options: { bold: true } },
      { text: " — except for Temperature Sensitive Goods: strictly liable for spoilage beyond four hours of the delivery window, regardless of customs detention ", options: {} },
      { text: "(§2.3 overrides §2.2).", options: { bold: true } },
    ],
    tb({ x: 7.05, y: 4.3, w: 5.45, h: 1.4, fontSize: 15, color: HEX.ink, valign: "top" })
  )
  cx = 7.05
  cx += chip(s, cx, 5.5, "§2.2 QUOTED", { color: HEX.brassDark }) + 0.12
  cx += chip(s, cx, 5.5, "§2.3 QUOTED", { color: HEX.brassDark }) + 0.12
  statusChip(s, cx, 5.5, "SUPPORTED")
  s.addText("Clauses from UNSEEN-LOGISTICS-001; retrieval and the override link verified live (slide 5).", tb({ x: 7.05, y: 6.0, w: 5.5, h: 0.3, fontSize: 10.5, italic: true, color: HEX.inkMuted }))

  s.addNotes(
    [
      "[~30 s]",
      "SAY: Contracts are hard because the answer is rarely in one place. Obligations are scattered, and words like 'subject to' or 'notwithstanding' can reverse a rule. Take one question from our test contract. The fluent answer says the provider isn't liable for customs delays — that's half true. Section 2.3 overrides 2.2 for temperature-sensitive goods. The verifiable answer quotes both clauses and shows the override.",
      "TAKEAWAY: The missing exception is the dangerous part — and the user must be able to check it.",
      "NOTE: no market statistics are claimed on this slide; none are sourced.",
      "NEXT: So why don't today's approaches solve this?",
    ].join("\n\n")
  )
}

// ---------------------------------------------------------------------------------------------
// Slide 3 — Why existing approaches fall short
// ---------------------------------------------------------------------------------------------
{
  const s = pres.addSlide({ masterName: "HNX_CONTENT", sectionTitle: "Problem" })
  kicker(s, "Why existing approaches fall short")
  s.addText("Three ways to read a contract", { placeholder: "title" })

  const head = (t, hnx) => ({
    text: t,
    options: { bold: true, fontSize: 14, color: hnx ? HEX.navy : HEX.ivory, fill: { color: hnx ? HEX.brass : HEX.panel }, valign: "middle" },
  })
  const crit = (t) => ({ text: t, options: { bold: true, color: HEX.ivory, fontSize: 14 } })
  const cell = (t) => ({ text: t, options: { color: HEX.slate, fontSize: 14 } })
  const hnx = (t) => ({ text: t, options: { color: HEX.ivory, fontSize: 14, fill: { color: "1A2436" } } })
  const rows = [
    [head(""), head("Manual review"), head("Generic LLM document chat"), head("HNX Legal Intelligence", true)],
    [crit("Evidence trail"), cell("Strong, but slow to assemble"), cell("Sources often missing or hard to check"), hnx("Every cited quote is checked against the source text")],
    [crit("Cross-clause links"), cell("Depends on reviewer attention"), cell("Left to the model; not inspectable"), hnx("Follows “subject to”, “notwithstanding”, “defined in”")],
    [crit("Missing evidence"), cell("Reviewer notes the gap"), cell("May fill the gap with plausible text"), hnx("Abstains — no answer, no citations")],
    [crit("Drafting"), cell("Written from scratch"), cell("Facts and allegations can blur"), hnx("Clauses quoted, allegations labelled, gaps left as placeholders")],
    [crit("Lawyer review"), cell("Is the review"), cell("Still required"), hnx("Still required — drafts are labelled for review")],
  ]
  s.addTable(rows, {
    objectName: "Comparison table",
    x: MX, y: 1.75, w: CW,
    colW: [2.35, 2.85, 3.1, 3.83],
    rowH: [0.5, 0.78, 0.78, 0.78, 0.78, 0.78],
    fontFace: "Calibri",
    fill: { color: HEX.deep },
    border: { type: "solid", pt: 0.75, color: HEX.line },
    valign: "middle",
    margin: [0.06, 0.14, 0.06, 0.14],
  })
  s.addText("An answer without supporting evidence is not enough for legal work.", tb({ x: MX, y: 6.38, w: CW, h: 0.4, fontFace: SERIF, italic: true, fontSize: 17, color: C.accent1 }))

  s.addNotes(
    [
      "[~25 s]",
      "SAY: Manual review is trustworthy, but slow to evidence. Generic document chat is fast, but sources are often missing and gaps get filled with plausible text. HNX keeps the speed and adds the evidence: checked quotes, followed cross-references, and an explicit 'not in this contract'. And look at the last row — a lawyer still reviews. We help them verify faster.",
      "TAKEAWAY: An answer without evidence isn't enough for legal work.",
      "NEXT: Here's the workflow.",
    ].join("\n\n")
  )
}

// ---------------------------------------------------------------------------------------------
// Slide 4 — Our solution
// ---------------------------------------------------------------------------------------------
pres.addSection({ title: "Solution" })
{
  const s = pres.addSlide({ masterName: "HNX_CONTENT", sectionTitle: "Solution" })
  kicker(s, "Our solution")
  s.addText("One workflow, from upload to evidence", { placeholder: "title" })

  const steps = [
    ["Upload", "PDF, TXT or Markdown"],
    ["Extract & index", "Section-aware chunks with page and path"],
    ["Retrieve", "Keyword + semantic search, fused"],
    ["Link clauses", "Follow cross-references"],
    ["Validate", "Sufficiency gate + quote check"],
    ["Respond", "Cited answer — or abstain"],
  ]
  const bw = 1.87
  const gap = (CW - 6 * bw) / 5
  steps.forEach(([t, d], i) => {
    const x = MX + i * (bw + gap)
    panel(s, x, 1.75, bw, 1.3, { name: "Workflow step " + (i + 1), fill: i === 5 ? "2A2A22" : HEX.panel, line: i === 5 ? HEX.brass : HEX.line })
    s.addText(String(i + 1).padStart(2, "0"), tb({ x: x + 0.15, y: 1.85, w: 0.6, h: 0.28, fontFace: SERIF, fontSize: 13, color: C.accent1 }))
    s.addText(t, tb({ x: x + 0.15, y: 2.13, w: bw - 0.3, h: 0.32, fontSize: 15, bold: true, color: C.background1 }))
    s.addText(d, tb({ x: x + 0.15, y: 2.45, w: bw - 0.28, h: 0.55, fontSize: 11.5, color: C.background2, valign: "top" }))
    if (i < 5) s.addText("›", tb({ x: x + bw, y: 2.15, w: gap, h: 0.4, fontSize: 20, color: C.accent1, align: "center", valign: "middle" }))
  })

  s.addImage({ path: A("screenshots/03_answer_supported_detail.png"), objectName: "Screenshot contract workspace", x: MX, y: 3.28, w: 5.94, h: 3.34, shadow: { type: "outer", blur: 10, offset: 3, angle: 90, color: "000000", opacity: 0.5 } })
  s.addText("Live product — Contract Workspace, captured 9 Oct 2026", tb({ x: MX, y: 6.66, w: 6.0, h: 0.22, fontSize: 9.5, italic: true, color: C.background2 }))

  const callouts = [
    ["Status in words, not just colour", "“SUPPORTED · Fully Grounded” or “INSUFFICIENT · Evidence Not Established”."],
    ["Exact evidence, with its location", "The quoted span, the document and the section path."],
    ["From finding to draft", "One click opens a notice draft labelled for lawyer review."],
  ]
  callouts.forEach(([h, d], i) => {
    const y = 3.45 + i * 1.12
    numberDot(s, 7.3, y, i + 1)
    s.addText(h, tb({ x: 7.95, y: y - 0.02, w: 4.75, h: 0.34, fontSize: 16, bold: true, color: C.background1 }))
    s.addText(d, tb({ x: 7.95, y: y + 0.34, w: 4.75, h: 0.6, fontSize: 14, color: C.background2, valign: "top" }))
  })

  s.addNotes(
    [
      "[~30 s]",
      "SAY: You upload a PDF, text or Markdown contract. We chunk it by section and keep the section path and page. Each question runs keyword and semantic search, fuses the two, follows cross-references, and then checks two things: is there enough evidence at all, and do the quotes really exist in the source? The output is a cited answer or an explicit abstention. This screenshot is the real product.",
      "TAKEAWAY: Every answer is a claim plus its evidence.",
      "NEXT: Let's prove it on a contract it has never seen.",
    ].join("\n\n")
  )
}

// ---------------------------------------------------------------------------------------------
// Slide 5 — Live demo on an unseen contract
// ---------------------------------------------------------------------------------------------
{
  const s = pres.addSlide({ masterName: "HNX_CONTENT", sectionTitle: "Solution" })
  kicker(s, "Live demo")
  s.addText("A contract it has never seen", { placeholder: "title" })
  s.addText(
    "UNSEEN-LOGISTICS-001  ·  synthetic cold-chain pharmaceutical logistics agreement  ·  uploaded during the demo, questions scoped to this document",
    tb({ x: MX, y: 1.45, w: CW, h: 0.3, fontSize: 13, color: C.background2 })
  )

  // Step 1 — cross-clause question
  sheet(s, MX, 1.95, 7.35, 4.75, { name: "Demo step 1 sheet" })
  s.addText("1 · CROSS-CLAUSE QUESTION", tb({ x: 0.9, y: 2.12, w: 4, h: 0.28, fontSize: 10.5, bold: true, color: HEX.brassDark, charSpacing: 2 }))
  statusChip(s, 6.3, 2.08, "SUPPORTED")
  s.addText(
    "“Is the service provider liable for spoilage of temperature sensitive goods when customs detention delays delivery?”",
    tb({ x: 0.9, y: 2.45, w: 6.75, h: 0.7, fontFace: SERIF, italic: true, fontSize: 15, color: HEX.ink, valign: "top" })
  )
  const quote = (y, sec, text) => {
    s.addShape(pres.ShapeType.roundRect, { objectName: "Quote " + sec, x: 0.9, y, w: 6.75, h: 0.92, rectRadius: 0.05, fill: { color: "EAE4D7" }, line: { color: "D3C9B4", width: 0.75 } })
    s.addText(sec, tb({ x: 1.02, y: y + 0.1, w: 0.62, h: 0.3, fontFace: MONO, fontSize: 12, bold: true, color: HEX.brassDark }))
    s.addText(text, tb({ x: 1.65, y: y + 0.07, w: 5.88, h: 0.8, fontSize: 12.5, color: HEX.ink, valign: "top" }))
  }
  quote(3.22, "§2.2", "“Subject to Section 2.3, Service Provider shall not be liable for delivery delays attributable to port customs clearance operations.”")
  quote(4.22, "§2.3", "“Notwithstanding Section 2.2, … shall remain strictly liable for consignment spoilage exceeding four (4) hours beyond the scheduled delivery window regardless of customs detention.”")
  chip(s, 0.9, 5.3, "DETECTED: §2.3 OVERRIDES §2.2", { color: HEX.brassDark })
  s.addText(
    "Customs delays are excused in general — but not spoilage of temperature-sensitive goods beyond four hours.",
    tb({ x: 0.9, y: 5.75, w: 6.75, h: 0.75, fontSize: 14, bold: true, color: HEX.ink, valign: "top" })
  )

  // Step 2 — abstention
  panel(s, 8.2, 1.95, 4.53, 2.95, { name: "Demo step 2 card" })
  s.addText("2 · OUT-OF-SCOPE QUESTION", tb({ x: 8.45, y: 2.12, w: 4.1, h: 0.28, fontSize: 10.5, bold: true, color: C.accent1, charSpacing: 2 }))
  s.addText(
    "“What are the aircraft hangar maintenance guidelines and hazardous chemical disposal protocols?”",
    tb({ x: 8.45, y: 2.48, w: 4.05, h: 0.95, fontFace: SERIF, italic: true, fontSize: 14, color: C.background1, valign: "top" })
  )
  statusChip(s, 8.45, 3.55, "INSUFFICIENT")
  s.addText("0 citations. The system names the missing subject matter instead of guessing.", tb({ x: 8.45, y: 3.98, w: 4.05, h: 0.7, fontSize: 13, color: C.background2, valign: "top" }))

  // Also verified
  panel(s, 8.2, 5.1, 4.53, 1.6, { name: "Also verified card" })
  s.addText("ALSO VERIFIED", tb({ x: 8.45, y: 5.25, w: 4, h: 0.28, fontSize: 10.5, bold: true, color: C.accent1, charSpacing: 2 }))
  s.addText(
    [
      { text: "Standard delivery window → ", options: { color: HEX.slate } },
      { text: "“forty-eight (48) hours”", options: { color: HEX.ivory, bold: true } },
      { text: "  §2.1, quoted verbatim", options: { color: HEX.slate } },
    ],
    tb({ x: 8.45, y: 5.58, w: 4.05, h: 0.95, fontSize: 13.5, valign: "top" })
  )

  s.addText(
    "Checked against the running system on 9 Oct 2026 (/api/ask, scoped by doc_id). Gemini was unavailable at capture time, so answers came from the extractive path: verbatim source sentences.",
    tb({ x: MX, y: 6.74, w: CW, h: 0.22, fontSize: 9.5, italic: true, color: C.background2 })
  )

  s.addNotes(
    [
      "[~60 s — live demo]",
      "DO (before the pitch): in Contract Workspace click '+ Add document', upload data/demo/demo_contract.md, then select 'Commercial Logistics and Cold-Chain Master Agreement' in the document list.",
      "DO — question 1, type exactly: Is the service provider liable for spoilage of temperature sensitive goods when customs detention delays delivery?",
      "EXPECT (verified 9 Oct): SUPPORTED; evidence sources §2.3, §2 and §5; the quoted §2.3 text 'Notwithstanding Section 2.2 … strictly liable for consignment spoilage exceeding four (4) hours … regardless of customs detention'; the Related provision box linking §2.3 and §2.2.",
      "SAY: Customs delays are excused in general — but not spoilage of temperature-sensitive goods beyond four hours. And you can see exactly which clauses say so.",
      "DO — question 2, type exactly: What are the aircraft hangar maintenance guidelines and hazardous chemical disposal protocols?",
      "EXPECT: INSUFFICIENT, zero citations, and the 'Evidence Not Found — Refusal to Speculate' box naming the missing subject matter.",
      "SAY: Nothing in this contract covers that, so it refuses instead of inventing an answer.",
      "BACKUP: 'What is the standard delivery window for freight consignments?' returns §2.1 'forty-eight (48) hours' verbatim (the extractive path may append neighbouring clauses). Avoid the invoice payment-terms question: on 9 Oct it returned the overdue-interest sentence but missed the 30-day term. If the system is unreachable, use appendix slide A2.",
      "NEXT: Here's what's underneath.",
    ].join("\n\n")
  )
}

// ---------------------------------------------------------------------------------------------
// Slide 6 — What makes it different: evidence-integrity layers
// ---------------------------------------------------------------------------------------------
{
  const s = pres.addSlide({ masterName: "HNX_CONTENT", sectionTitle: "Solution" })
  kicker(s, "What makes it different")
  s.addText("Evidence integrity, layer by layer", { placeholder: "title" })

  const cols = { name: 1.25, what: 4.85, why: 9.15 }
  s.addText("LAYER", tb({ x: cols.name, y: 1.5, w: 3, h: 0.25, fontSize: 10, bold: true, color: C.background2, charSpacing: 2 }))
  s.addText("WHAT IT DOES", tb({ x: cols.what, y: 1.5, w: 3, h: 0.25, fontSize: 10, bold: true, color: C.background2, charSpacing: 2 }))
  s.addText("WHY IT MATTERS", tb({ x: cols.why, y: 1.5, w: 3, h: 0.25, fontSize: 10, bold: true, color: C.background2, charSpacing: 2 }))

  const layers = [
    ["Document-scoped retrieval", "Searches only the selected contract", "Answers aren't borrowed from other files"],
    ["Keyword search (BM25)", "Matches exact terms and section numbers", "Legal wording is precise"],
    ["Semantic search", "Gemini embeddings find passages by meaning", "Catches paraphrased obligations"],
    ["Reciprocal Rank Fusion", "Merges both rankings by rank (k = 60)", "No fragile score calibration"],
    ["Clause-dependency expansion", "Adds up to 2 clauses named by “subject to”, “notwithstanding”, “defined in”", "Exceptions travel with the rule"],
    ["Sufficiency gate + quote check", "Abstains when core terms are absent; cited quotes must match the source exactly", "No evidence → no answer, no citation"],
  ]
  const rh = 0.74
  layers.forEach(([n, what, why], i) => {
    const y = 1.85 + i * (rh + 0.07)
    panel(s, MX, y, CW, rh, { name: "Layer " + (i + 1), fill: i % 2 ? HEX.deep : HEX.panel })
    numberDot(s, MX + 0.14, y + 0.16, i + 1, { fill: i % 2 ? HEX.deep : HEX.panel })
    s.addText(n, tb({ x: cols.name, y, w: 3.45, h: rh, fontSize: 15, bold: true, color: C.background1, valign: "middle" }))
    s.addText(what, tb({ x: cols.what, y, w: 4.1, h: rh, fontSize: 13, color: C.background2, valign: "middle" }))
    s.addText(why, tb({ x: cols.why, y, w: 3.45, h: rh, fontSize: 14, color: i === 5 ? HEX.brass : HEX.ivory, bold: i === 5, valign: "middle" }))
  })

  s.addNotes(
    [
      "[~35 s]",
      "SAY: Six layers, all in the code. Retrieval is scoped to the contract you picked. BM25 — which we wrote ourselves — catches exact legal terms and section numbers; Gemini embeddings catch paraphrases. Reciprocal Rank Fusion merges the two lists by rank. When a clause says 'subject to' or 'notwithstanding', we pull in the clause it points to. Finally, if the question's core terms aren't in the evidence, we abstain before calling the model — and every cited quote must exist verbatim in the source.",
      "IF ASKED: an exact quote proves the text exists, not that the claim built on it is correct. Claim-level entailment is on the roadmap.",
      "NEXT: Here's the stack.",
    ].join("\n\n")
  )
}

// ---------------------------------------------------------------------------------------------
// Slide 7 — Technical architecture
// ---------------------------------------------------------------------------------------------
{
  const s = pres.addSlide({ masterName: "HNX_CONTENT", sectionTitle: "Solution" })
  kicker(s, "Technical architecture")
  s.addText("How a question becomes a cited answer", { placeholder: "title" })

  // Row 1: client, API, data boundaries
  panel(s, MX, 1.75, 3.2, 1.45, { name: "Frontend box" })
  s.addText("Frontend", tb({ x: MX + 0.2, y: 1.85, w: 2.8, h: 0.3, fontSize: 15, bold: true, color: C.background1 }))
  s.addText("React 19 · TypeScript · Vite\nContract Workspace, Legal Drafting, Matters & Tasks", tb({ x: MX + 0.2, y: 2.18, w: 2.85, h: 0.9, fontSize: 12, color: C.background2, valign: "top" }))
  s.addText("HTTP · JSON", tb({ x: 3.82, y: 2.2, w: 0.95, h: 0.3, fontSize: 10, color: C.accent1, align: "center" }))
  s.addShape(pres.ShapeType.line, { objectName: "Arrow UI to API", x: 3.85, y: 2.5, w: 0.9, h: 0, line: { color: HEX.brass, width: 1.25, endArrowType: "triangle", beginArrowType: "triangle" } })
  panel(s, 4.8, 1.75, 3.3, 1.45, { name: "API box" })
  s.addText("FastAPI", tb({ x: 5.0, y: 1.85, w: 2.9, h: 0.3, fontSize: 15, bold: true, color: C.background1 }))
  s.addText("/api/upload   /api/ask\n/api/draft/notice   /api/draft/clauses\n/api/documents", tb({ x: 5.0, y: 2.18, w: 3.0, h: 0.9, fontFace: MONO, fontSize: 10.5, color: C.background2, valign: "top" }))

  panel(s, 8.4, 1.75, 4.33, 1.45, { name: "Data boundaries box", fill: HEX.deep, line: HEX.brass })
  s.addText("DATA BOUNDARIES", tb({ x: 8.6, y: 1.85, w: 3.9, h: 0.28, fontSize: 10, bold: true, color: C.accent1, charSpacing: 2 }))
  s.addText(
    bulletList(["Index held in server memory; uploads are not written to disk", "Contract text is sent to Google's Gemini API when enabled", "Matters & tasks: browser-only metadata"], { space: 3 }),
    tb({ x: 8.6, y: 2.13, w: 4.0, h: 1.0, fontSize: 11.5, color: C.background1, valign: "top" })
  )

  // Row 2: question pipeline
  s.addText("QUESTION PIPELINE  (/api/ask)", tb({ x: MX, y: 3.45, w: 6, h: 0.25, fontSize: 10, bold: true, color: C.background2, charSpacing: 2 }))
  const pipe = [
    ["Parse", "pypdf · text"],
    ["Chunk", "Section-aware, 900 chars"],
    ["Index", "BM25 + Gemini embedding-001"],
    ["Retrieve", "Doc-scoped hybrid, RRF"],
    ["Expand", "Cross-references"],
    ["Gate", "Evidence sufficiency"],
    ["Generate", "Gemini 3.5 Flash JSON"],
    ["Validate", "Exact-quote match"],
  ]
  const pw = 1.38
  const pg = (CW - 8 * pw) / 7
  s.addShape(pres.ShapeType.line, { objectName: "Pipeline spine", x: MX + 0.3, y: 4.3, w: CW - 0.6, h: 0, line: { color: HEX.brass, width: 1.25, endArrowType: "triangle" } })
  pipe.forEach(([t, d], i) => {
    const x = MX + i * (pw + pg)
    panel(s, x, 3.8, pw, 1.0, { name: "Pipeline " + t, fill: i >= 5 ? "2A2A22" : HEX.panel, line: i >= 5 ? HEX.brass : HEX.line })
    s.addText(t, tb({ x: x + 0.1, y: 3.88, w: pw - 0.2, h: 0.3, fontSize: 13.5, bold: true, color: C.background1 }))
    s.addText(d, tb({ x: x + 0.1, y: 4.2, w: pw - 0.18, h: 0.55, fontSize: 10.5, color: C.background2, valign: "top" }))
  })
  s.addText("Fallbacks keep it running: LSA embeddings if the embedding API fails; a verbatim-sentence extractive generator if the LLM fails.", tb({ x: MX, y: 4.9, w: CW, h: 0.28, fontSize: 11.5, italic: true, color: C.background2 }))

  // Row 3: outputs
  panel(s, MX, 5.35, 6.0, 1.2, { name: "Answer output box" })
  s.addText("Answer response", tb({ x: MX + 0.2, y: 5.45, w: 5.6, h: 0.3, fontSize: 14, bold: true, color: C.background1 }))
  s.addText("Answer · evidence state · citations (chunk ID, quote, verified flag) · source passages · clause relationships", tb({ x: MX + 0.2, y: 5.78, w: 5.6, h: 0.9, fontSize: 12, color: C.background2, valign: "top" }))
  panel(s, 6.73, 5.35, 6.0, 1.2, { name: "Drafting output box" })
  s.addText("Drafting path  (/api/draft/notice)", tb({ x: 6.93, y: 5.45, w: 5.6, h: 0.3, fontSize: 14, bold: true, color: C.background1 }))
  s.addText("Retrieve clauses → template notice (no LLM) → contract quotes, labelled allegations, placeholders, “DRAFT — REQUIRES LAWYER REVIEW”", tb({ x: 6.93, y: 5.78, w: 5.6, h: 0.9, fontSize: 12, color: C.background2, valign: "top" }))

  s.addNotes(
    [
      "[~25 s]",
      "SAY: React and TypeScript on the front, FastAPI behind it. A question flows left to right: parse, chunk, index, retrieve, expand, gate, generate with Gemini 3.5 Flash in a strict JSON schema, then validate. If an API fails, we degrade instead of breaking. Drafting is template-based on purpose — no LLM writes the notice. And to be clear: contract text goes to Google's Gemini API when it's enabled; we claim no compliance certifications.",
      "NEXT: So how do we know it works?",
    ].join("\n\n")
  )
}

// ---------------------------------------------------------------------------------------------
// Slide 8 — Evaluation & trust
// ---------------------------------------------------------------------------------------------
pres.addSection({ title: "Evidence" })
{
  const s = pres.addSlide({ masterName: "HNX_CONTENT", sectionTitle: "Evidence" })
  kicker(s, "Evaluation & trust  ·  groundedness  ·  retrieval quality")
  s.addText("Evaluated, not asserted", { placeholder: "title" })

  // Left: real-LLM baseline
  s.addText("Real-LLM baseline · plain hybrid RAG", tb({ x: MX, y: 1.62, w: 5.9, h: 0.32, fontSize: 15, bold: true, color: C.background1 }))
  s.addText("Gemini 3.5 Flash + gemini-embedding-001 · 16 questions (8 answerable, 4 unanswerable, 4 adversarial) · internal technical corpus", tb({ x: MX, y: 1.95, w: 5.9, h: 0.5, fontSize: 11.5, color: C.background2, valign: "top" }))
  const tiles = [
    ["100%", "Recall@4", "right document retrieved"],
    ["15/16", "Abstention decisions", "correct"],
    ["0", "Citations to chunks", "outside the retrieved set"],
    ["25/28", "Cited quotes", "exact match to source"],
  ]
  tiles.forEach(([v, l1, l2], i) => {
    const x = MX + (i % 2) * 3.0
    const y = 2.55 + Math.floor(i / 2) * 1.55
    panel(s, x, y, 2.85, 1.4, { name: "Stat " + l1 })
    s.addText(v, tb({ x: x + 0.2, y: y + 0.12, w: 2.5, h: 0.65, fontFace: SERIF, fontSize: 34, color: C.accent1 }))
    s.addText([{ text: l1, options: { bold: true, color: HEX.ivory, breakLine: true } }, { text: l2, options: { color: HEX.slate } }], tb({ x: x + 0.2, y: y + 0.78, w: 2.55, h: 0.55, fontSize: 12, valign: "top" }))
  })

  // Right: adversarial stress test chart
  s.addText("Adversarial legal stress test · 25 cases", tb({ x: 6.85, y: 1.62, w: 5.88, h: 0.32, fontSize: 15, bold: true, color: C.background1 }))
  s.addText("Baseline RAG vs JC-PAR (jurisdiction routing + clause expansion + sufficiency gate)", tb({ x: 6.85, y: 1.95, w: 5.88, h: 0.5, fontSize: 11.5, color: C.background2, valign: "top" }))
  s.addChart(
    pres.ChartType.bar,
    [
      { name: "Baseline", labels: ["Failure ↓", "Supported ↑", "Contradicted ↓", "Recall@5 ↑", "Abstention ↑"], values: [80, 32, 12, 68.2, 0] },
      { name: "JC-PAR", labels: ["Failure ↓", "Supported ↑", "Contradicted ↓", "Recall@5 ↑", "Abstention ↑"], values: [72, 44, 4, 54.5, 100] },
    ],
    {
      objectName: "Stress test chart",
      x: 6.75, y: 2.4, w: 5.98, h: 3.12,
      barDir: "col",
      barGrouping: "clustered",
      barGapWidthPct: 60,
      chartColors: ["6B7A90", HEX.brass],
      showValue: true,
      dataLabelPosition: "outEnd",
      dataLabelFormatCode: '0.0"%"',
      dataLabelColor: HEX.ivory,
      dataLabelFontSize: 10,
      dataLabelFontFace: "+mn-lt",
      catAxisLabelColor: HEX.slate,
      catAxisLabelFontSize: 10.5,
      catAxisLabelFontFace: "+mn-lt",
      catAxisLabelRotate: 0,
      catAxisLineShow: false,
      valAxisHidden: true,
      valAxisMinVal: 0,
      valAxisMaxVal: 115,
      valGridLine: { style: "none" },
      catGridLine: { style: "none" },
      showLegend: true,
      legendPos: "t",
      legendColor: HEX.slate,
      legendFontSize: 11,
      legendFontFace: "+mn-lt",
    }
  )
  s.addText(
    "↓ lower is better · ↑ higher is better. Supported = strictly supported answers; abstention = correct on 3 unanswerable cases (0/3 → 3/3). Extractive generator, 8 Oct code snapshot. Recall@5 fell — an open problem we report, not hide.",
    tb({ x: 6.85, y: 5.55, w: 5.88, h: 0.7, fontSize: 10.5, italic: true, color: C.background2, valign: "top" })
  )

  // Bottom strip: tests + not yet measured
  panel(s, MX, 5.75, 5.85, 1.05, { name: "Tests strip", fill: HEX.deep, line: HEX.brass })
  s.addText(
    [
      { text: "34 / 34 automated tests pass ", options: { bold: true, color: HEX.ivory } },
      { text: "(9 Oct) — including 10 unseen-contract scenarios: verbatim spans, §2.3↔§2.2 links, abstention, document isolation, injected-instruction text.", options: { color: HEX.slate } },
    ],
    tb({ x: MX + 0.2, y: 5.83, w: 5.5, h: 0.9, fontSize: 11.5, valign: "middle" })
  )
  s.addText(
    [
      { text: "Not yet measured: ", options: { bold: true, color: HEX.amber } },
      { text: "claim-level entailment · lawyer-rated usefulness · real-LLM run on the legal stress set", options: { color: HEX.slate } },
    ],
    tb({ x: 6.85, y: 6.33, w: 5.88, h: 0.5, fontSize: 11, valign: "top" })
  )

  s.addNotes(
    [
      "[~40 s]",
      "SAY: We measured. On the left, plain hybrid RAG with real Gemini on 16 questions: the right document every time, 15 of 16 abstention calls correct, no citation outside the evidence, and 25 of 28 quotes exact. It's a small, technical set, and recall is document-level. On the right is our research: 25 adversarial legal cases broke the baseline 80% of the time. JC-PAR took correct abstention from zero of three to three of three and cut contradictions from 12 to 4 percent — but Recall@5 fell from 68 to 55. We show that rather than hide it. All 34 automated tests pass.",
      "IF ASKED: the stress-test runs used the extractive generator on the 8 Oct code; details are in appendix A1.",
      "TAKEAWAY: Every number comes with its caveat.",
      "NEXT: So what is it good for today?",
    ].join("\n\n")
  )
}

// ---------------------------------------------------------------------------------------------
// Slide 9 — Usefulness, limitations & next steps
// ---------------------------------------------------------------------------------------------
pres.addSection({ title: "Outlook" })
{
  const s = pres.addSlide({ masterName: "HNX_CONTENT", sectionTitle: "Outlook" })
  kicker(s, "Usefulness, limitations & next steps")
  s.addText("Useful today, honest about its limits", { placeholder: "title" })

  const colW = (CW - 2 * 0.3) / 3
  const cols = [
    {
      title: "INTENDED VALUE",
      sub: "Design goals — not yet measured with lawyers",
      color: HEX.brass,
      items: ["Jump to the clause that answers the question", "Trace each statement to a quoted source", "See exceptions next to the rule they modify", "Know when the contract is silent", "Start notices from a lawyer-review draft"],
    },
    {
      title: "LIMITATIONS",
      sub: "What we tell users up front",
      color: HEX.amber,
      items: ["A lawyer must still review every output", "An exact quote isn't proof the claim is right", "Conflict flags rely on the model's classification", "Clause expansion lowered Recall@5 (68% → 55%)", "PDF, TXT and Markdown only — no DOCX or OCR yet"],
    },
  ]
  cols.forEach((c, i) => {
    const x = MX + i * (colW + 0.3)
    panel(s, x, 1.7, colW, 4.45, { name: c.title })
    s.addText(c.title, tb({ x: x + 0.25, y: 1.88, w: colW - 0.5, h: 0.3, fontSize: 12, bold: true, color: c.color, charSpacing: 2 }))
    s.addText(c.sub, tb({ x: x + 0.25, y: 2.2, w: colW - 0.5, h: 0.3, fontSize: 11, italic: true, color: C.background2 }))
    s.addText(bulletList(c.items, { space: 10 }), tb({ x: x + 0.25, y: 2.65, w: colW - 0.45, h: 3.4, fontSize: 14, color: C.background1, valign: "top" }))
  })

  const x3 = MX + 2 * (colW + 0.3)
  panel(s, x3, 1.7, colW, 4.45, { name: "Roadmap", fill: HEX.deep, line: HEX.brass })
  s.addText("ROADMAP", tb({ x: x3 + 0.25, y: 1.88, w: colW - 0.5, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 2 }))
  s.addText("BUILT", tb({ x: x3 + 0.25, y: 2.28, w: 2, h: 0.25, fontSize: 10, bold: true, color: HEX.green, charSpacing: 2 }))
  s.addText("Hybrid RRF retrieval · clause expansion · sufficiency gate · quote validation · template drafting · matters & tasks prototype", tb({ x: x3 + 0.25, y: 2.55, w: colW - 0.45, h: 1.15, fontSize: 13, color: C.background2, valign: "top" }))
  s.addText("NEXT", tb({ x: x3 + 0.25, y: 3.8, w: 2, h: 0.25, fontSize: 10, bold: true, color: C.accent1, charSpacing: 2 }))
  s.addText(
    bulletList(["Claim-level entailment checks", "Rule-based conflict flag in every answer", "Fix the expansion recall penalty", "DOCX and OCR ingestion", "Evaluation with practising lawyers"], { space: 6 }),
    tb({ x: x3 + 0.25, y: 4.08, w: colW - 0.45, h: 2.0, fontSize: 14, color: C.background1, valign: "top" })
  )

  s.addText("Built to help lawyers verify faster — not to replace their judgment.", tb({ x: MX, y: 6.35, w: CW, h: 0.4, fontFace: SERIF, italic: true, fontSize: 17, color: C.accent1 }))

  s.addNotes(
    [
      "[~25 s]",
      "SAY: It's built to get lawyers to the right clause, with its evidence and its exceptions, and to say when the contract is silent. Those are design goals — we haven't measured them with lawyers yet. Limits we state up front: review is still required, a quote isn't proof, conflict flags rely on the model, and we don't read Word files or scans yet. Next: claim-level entailment, rule-based conflict flags, fixing the recall penalty, and evaluation with practising lawyers.",
      "NEXT: To close —",
    ].join("\n\n")
  )
}

// ---------------------------------------------------------------------------------------------
// Slide 10 — Closing
// ---------------------------------------------------------------------------------------------
{
  const s = pres.addSlide({ masterName: "HNX_CLOSING", sectionTitle: "Outlook" })
  s.addText("CLOSING", tb({ x: MX, y: 1.1, w: 4, h: 0.3, fontSize: 11.5, bold: true, color: C.accent1, charSpacing: 2.5 }))
  s.addText("Don't just generate an answer. Show why it deserves to be trusted.", { placeholder: "title" })
  s.addText(
    "HNX treats every legal answer as a claim that must carry its evidence — or say plainly that the evidence isn't there.",
    tb({ x: MX, y: 4.0, w: 8.6, h: 0.9, fontSize: 19, color: C.background2, valign: "top" })
  )
  panel(s, MX, 5.1, 7.35, 0.75, { name: "Invitation", fill: HEX.deep, line: HEX.brass })
  s.addText("Ask us anything about the unseen contract — then inspect the evidence trail.", tb({ x: MX + 0.25, y: 5.1, w: 7.0, h: 0.75, fontSize: 15, bold: true, color: C.accent1, valign: "middle" }))

  s.addImage({ path: A("hnx_mark.png"), x: 10.55, y: 1.6, w: 2.1, h: 2.1, objectName: "HNX mark large" })
  s.addText(
    [
      { text: "HNX Legal Intelligence", options: { fontFace: SERIF, fontSize: 18, color: HEX.ivory, breakLine: true } },
      { text: "Team No Sleep Till Deploy", options: { fontSize: 13, color: HEX.slate, breakLine: true } },
      { text: "HACKNEX 2026 · HNX26EPS01", options: { fontSize: 11, color: HEX.brass, charSpacing: 2 } },
    ],
    tb({ x: 9.6, y: 3.95, w: 3.13, h: 1.1, align: "center", valign: "top" })
  )

  s.addNotes(
    [
      "[~15 s]",
      "SAY: HNX treats every legal answer as a claim that must carry its evidence — or say plainly that the evidence isn't there. Don't just generate an answer. Show why it deserves to be trusted. Ask us anything about the unseen contract, and inspect the evidence trail yourself. Thank you.",
    ].join("\n\n")
  )
}

// ---------------------------------------------------------------------------------------------
// Appendix A1 — evaluation runs and caveats
// ---------------------------------------------------------------------------------------------
pres.addSection({ title: "Appendix" })
{
  const s = pres.addSlide({ masterName: "HNX_CONTENT", sectionTitle: "Appendix" })
  kicker(s, "Appendix A1 · for questions")
  s.addText("Evaluation runs and their caveats", { placeholder: "title" })
  const h = (t) => ({ text: t, options: { bold: true, color: HEX.navy, fill: { color: HEX.brass }, fontSize: 11.5 } })
  const c = (t, o = {}) => ({ text: t, options: { color: o.c || HEX.ivory, fontSize: 11, bold: !!o.b } })
  const rows = [
    [h("Run"), h("What ran"), h("Data"), h("Headline results"), h("Caveats")],
    [c("Real-LLM baseline · 8 Oct", { b: true }), c("Plain hybrid RAG, top-4; Gemini 3.5 Flash; gemini-embedding-001 (3072-d)"), c("16 questions; 9 internal technical documents, 52 chunks"), c("Recall@4 100% · groundedness 100%* · usefulness 85%* · abstention 15/16 · out-of-set citations 0"), c("*lexical heuristics, not entailment; document-level recall; 3/28 quotes not exact; false-premise QA-015 wrongly abstained", { c: HEX.slate })],
    [c("Adversarial stress test · 8 Oct", { b: true }), c("Baseline vs JC-PAR (JARF + CPDE + ESV); extractive generator"), c("25 legal cases (3 unanswerable, 5 jurisdiction)"), c("Failure 80% → 72% · abstention 0/3 → 3/3 · contradictions 3 → 1 · Recall@5 68.2% → 54.5%"), c("No LLM; earlier code snapshot; jurisdiction accuracy 2/5 for every variant", { c: HEX.slate })],
    [c("Automated tests · 9 Oct", { b: true }), c("pytest, 9 test files"), c("34 tests incl. 10 unseen-contract scenarios"), c("34 passed in 13.8 s"), c("Most unseen-contract tests use the extractive path; the conflict test accepts several states", { c: HEX.slate })],
    [c("Live demo check · 9 Oct", { b: true }), c("/api/ask on UNSEEN-LOGISTICS-001, scoped by doc_id"), c("4 questions"), c("3 answered with verbatim quotes (status SUPPORTED) · 1 correct abstention, 0 citations"), c("Gemini unavailable → extractive path; payment-terms answer missed the 30-day term", { c: HEX.slate })],
  ]
  s.addTable(rows, {
    objectName: "Evaluation runs table",
    x: MX, y: 1.7, w: CW,
    colW: [2.0, 2.65, 2.25, 2.75, 2.48],
    rowH: [0.42, 1.12, 1.0, 0.85, 0.95],
    fontFace: "Calibri",
    fill: { color: HEX.deep },
    border: { type: "solid", pt: 0.75, color: HEX.line },
    valign: "middle",
    margin: [0.06, 0.1, 0.06, 0.1],
  })
  s.addText("Sources: data/results/baseline_gemini_hybrid_rrf.json · data/results/ablation/*.json · pytest run of 9 Oct 2026 · presentation/assets/demo_verification.json", tb({ x: MX, y: 6.5, w: CW, h: 0.3, fontSize: 10, italic: true, color: C.background2 }))
  s.addNotes("Appendix — use only if judges ask about methodology. Every number here comes from a file in the repository; see presentation/README.md for the full verification notes.")
}

// Appendix A2 — demo backup (real screenshots, in case the live demo is unavailable)
{
  const s = pres.addSlide({ masterName: "HNX_CONTENT", sectionTitle: "Appendix" })
  kicker(s, "Appendix A2 · demo backup")
  s.addText("If the live demo is unavailable", { placeholder: "title" })
  const shot = (x, file, cap) => {
    s.addImage({ path: A("screenshots/" + file), objectName: "Screenshot " + file, x, y: 1.75, w: 5.94, h: 3.34, shadow: { type: "outer", blur: 10, offset: 3, angle: 90, color: "000000", opacity: 0.5 } })
    s.addText(cap, tb({ x, y: 5.22, w: 5.94, h: 0.8, fontSize: 13, color: C.background2, valign: "top" }))
  }
  shot(MX, "06_unseen_cross_clause.png", "Contract Workspace on UNSEEN-LOGISTICS-001: the cross-clause question returns SUPPORTED with §2.3, §2 and §5 as evidence sources.")
  shot(6.79, "05_drafting_output.png", "Legal Drafting: notice generated from retrieved clauses, with the DRAFT — REQUIRES LAWYER REVIEW banner and a separate contract-evidence panel.")
  s.addText("Captured from the running product on 9 Oct 2026 (headless Edge, 1600 × 900).", tb({ x: MX, y: 6.4, w: CW, h: 0.3, fontSize: 10, italic: true, color: C.background2 }))
  s.addNotes("Backup only. If the live system is unreachable, walk through these two real captures instead: the cross-clause answer with its evidence sources, and the drafting desk with the lawyer-review banner and separate evidence panel. Say clearly that these are screenshots, not a live run.")
}

;(async () => {
  await pres.writeFile({ fileName: OUT })
  if (applyTheme) await applyTheme(OUT, THEME)
  console.log("Wrote", OUT)
})()
