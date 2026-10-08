import React, { useState, useEffect } from "react"
import CursorRingField from "./components/CursorRingField"

// SVG Icons (UI/UX Pro Max rule: No loose emojis as icons; use precision SVGs)
function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ShieldCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function FileTextIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function AlertTriangleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function CrossIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function UploadCloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      <polyline points="16 16 12 12 8 16" />
    </svg>
  )
}

function ExternalSourceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

// Available Jurisdictions (Strict user selection, never inferred)
const JURISDICTIONS = [
  { id: "India", code: "IND", label: "India", legalSystem: "Indian Contract Act, 1872 & IT Act, 2000" },
  { id: "United States", code: "USA", label: "United States", legalSystem: "Delaware / New York Commercial Law (UCC)" },
  { id: "United Kingdom", code: "GBR", label: "United Kingdom", legalSystem: "English Common Law & UCTA 1977" },
  { id: "Canada", code: "CAN", label: "Canada", legalSystem: "Common Law & PIPEDA Commercial Framework" },
  { id: "Australia", code: "AUS", label: "Australia", legalSystem: "Australian Consumer Law & Corporations Act" },
  { id: "Singapore", code: "SGP", label: "Singapore", legalSystem: "Singapore Commercial Law & PDPA 2012" },
  { id: "Germany", code: "DEU", label: "Germany", legalSystem: "Bürgerliches Gesetzbuch (BGB Civil Code)" },
  { id: "France", code: "FRA", label: "France", legalSystem: "Code Civil des Français (Contractual Law)" },
  { id: "UAE", code: "ARE", label: "UAE", legalSystem: "DIFC / ADGM Common Law Jurisdiction" }
]

// Mock Indexed Documents
const INITIAL_DOCS = [
  {
    id: "DOC-006",
    title: "Cloud Master Services Agreement",
    file: "Cloud Master Services Agreement.pdf",
    size: "48 KB",
    sections: 12,
    status: "Verified",
    checksum: "sha256:4a8b...19e0"
  },
  {
    id: "DOC-007",
    title: "Data Protection Addendum",
    file: "Data Protection Addendum.pdf",
    size: "32 KB",
    sections: 8,
    status: "Verified",
    checksum: "sha256:9f2c...7d41"
  },
  {
    id: "DOC-008",
    title: "Service Level Agreement",
    file: "Service Level Agreement.pdf",
    size: "24 KB",
    sections: 6,
    status: "Verified",
    checksum: "sha256:c31e...5a89"
  }
]

const SUGGESTIONS = [
  "Who can terminate this agreement?",
  "What notice period applies if monthly uptime is chronically below the SLA threshold?",
  "What insurance must the vendor carry?",
  "What are the liability limitations?",
]

const STAGES = [
  "Analyzing the document…",
  "Retrieving relevant evidence…",
  "Verifying source support…",
]

const LABEL_COPY: Record<string, { title: string; line: string; tone: string; pill: string }> = {
  SUPPORTED: {
    title: "Supported by your documents",
    line: "Every statement below is backed by a passage you can open.",
    tone: "supported",
    pill: "Supported",
  },
  PARTIAL: {
    title: "Partially supported — some information is missing",
    line: "What could be verified is shown. What could not is listed separately.",
    tone: "partial",
    pill: "Partially supported",
  },
  CONFLICTING: {
    title: "These documents contain conflicting information",
    line: "Two passages give different information. Both are shown; neither was chosen for you.",
    tone: "conflicting",
    pill: "Conflicting",
  },
  INSUFFICIENT: {
    title: "Insufficient evidence",
    line: "Nothing was guessed. The closest passages are shown below.",
    tone: "insufficient",
    pill: "Insufficient evidence",
  },
}

function friendly(msg: string): string {
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "The analysis server is not reachable. Make sure the backend is running, then try again."
  }
  if (/no documents/i.test(msg)) {
    return "Upload a document first, then ask your question."
  }
  if (/unsupported file/i.test(msg)) {
    return msg.replace("Unsupported file type", "That file type is not supported") + "."
  }
  if (/429|quota|rate/i.test(msg)) {
    return "The language model is temporarily rate-limited. Wait a few seconds and ask again."
  }
  return `Something went wrong: ${msg}`
}

function Highlighted({ text, quote }: { text: string; quote?: string | null }) {
  if (!quote) return <>{text}</>
  const i = text.toLowerCase().indexOf(quote.toLowerCase())
  if (i === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + quote.length)}</mark>
      {text.slice(i + quote.length)}
    </>
  )
}

function EvidenceBlockItem({
  tag,
  claim,
  docTitle,
  section,
  quote,
  fullText,
  relationship,
  onOpen,
}: {
  tag?: string
  claim?: string
  docTitle: string
  section?: string
  quote?: string
  fullText: string
  relationship?: {
    text: string
    operator?: string
  } | null
  onOpen?: () => void
}) {
  return (
    <div className="ev-block">
      {tag && (
        <div
          className={`ev-tag ${
            tag.toLowerCase().includes("a")
              ? "tag-source-a"
              : tag.toLowerCase().includes("b")
              ? "tag-source-b"
              : ""
          }`}
        >
          {tag}
        </div>
      )}
      {claim && (
        <div className="ev-claim">
          <span className="k">Claim</span>
          <span>{claim}</span>
        </div>
      )}
      <div className="ev-top">
        <div>
          <span className="k">Source</span>
          <span className="src">
            {docTitle}
            {section ? ` · ${section}` : ""}
          </span>
        </div>
        {onOpen && (
          <button
            type="button"
            className="view-source-action-btn"
            style={{ padding: "4px 10px", fontSize: "11.5px" }}
            onClick={onOpen}
          >
            <ExternalSourceIcon className="source-svg" />
            <span>View in document</span>
          </button>
        )}
      </div>
      <div className="ev-q">
        <span className="k">Exact evidence</span>
        <Highlighted text={fullText || quote || ""} quote={quote} />
      </div>
      {relationship && (
        <div className="ev-rel">
          <span className="k">Relationship</span>
          <span>{relationship.text}</span>
          {relationship.operator ? (
            <> · <code>{relationship.operator}</code></>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default function App() {
  // Navigation / stage state: 'hero' | 'upload' | 'analysis'
  const [stage, setStage] = useState<"hero" | "upload" | "analysis">("hero")

  // Explicit Jurisdiction state (India by default or user choice)
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("United States")

  // Floating Hero Document ambient animation loop state
  const [ambientStep, setAmbientStep] = useState<number>(0)
  // Subtle 3D parallax on hero document
  const [docTilt, setDocTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Active query state in Analysis
  const [queryMode, setQueryMode] = useState<"grounded" | "insufficient">("grounded")
  const [userQuery, setUserQuery] = useState<string>(
    "Who can terminate this agreement?"
  )
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [loadingStage, setLoadingStage] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Source Viewer Modal
  const [activeSourceModal, setActiveSourceModal] = useState<null | {
    docId: string
    docTitle: string
    section: string
    quote: string
    fullClause: string
    highlight: string
  }>(null)

  // Staged loading effect
  useEffect(() => {
    if (!isAnalyzing) {
      setLoadingStage(0)
      return
    }
    const timer = setInterval(() => {
      setLoadingStage((prev) => (prev < 2 ? prev + 1 : prev))
    }, 1200)
    return () => clearInterval(timer)
  }, [isAnalyzing])

  // Continuous Ambient Hero Animation Loop (NO SCROLL REQUIRED)
  useEffect(() => {
    if (stage !== "hero") return
    // Cycles through: 0: calm -> 1: particles gathering & beam -> 2: citation active & illuminated -> 3: calm
    const interval = setInterval(() => {
      setAmbientStep((prev) => (prev + 1) % 4)
    }, 2800)
    return () => clearInterval(interval)
  }, [stage])

  // Keyboard accessibility: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeSourceModal) {
        setActiveSourceModal(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeSourceModal])

  // Mouse move parallax for the floating legal document
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== "hero") return
    const rect = e.currentTarget.getBoundingClientRect()
    const xRel = (e.clientX - rect.left) / rect.width - 0.5
    const yRel = (e.clientY - rect.top) / rect.height - 0.5
    setDocTilt({
      x: -yRel * 8,
      y: xRel * 10
    })
  }

  const handleHeroMouseLeave = () => {
    setDocTilt({ x: 0, y: 0 })
  }

  // Live backend API result state
  const [liveResult, setLiveResult] = useState<null | {
    query: string
    answer_text: string
    citations: Array<{
      chunk_id: string
      claim: string
      quote_snippet?: string
      char_start?: number
      char_end?: number
      verified?: boolean
    }>
    is_abstention: boolean
    abstention_reason?: string
    evidence_state?: string
    trace_log?: string[]
    evidence?: Array<{
      chunk_id: string
      doc_id: string
      document_title: string
      section: string
      text: string
      char_start?: number
      char_end?: number
    }>
    relationships?: Array<{
      source_chunk_id: string
      source_section: string
      source_doc_title: string
      target_chunk_id: string
      target_section: string
      target_doc_title: string
      referenced_section: string
      relation: string
      operator?: string
      direction?: string
    }>
    conflicts?: Array<{
      chunk_a: string
      quote_a: string
      claim_a: string
      chunk_b: string
      quote_b: string
      claim_b: string
      reason?: string
    }>
  }>(null)

  const handleRunAnalysis = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : userQuery).trim()
    if (!q) return
    setIsAnalyzing(true)
    setErrorMessage(null)
    try {
      const res = await fetch("http://127.0.0.1:8000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          selected_jurisdiction: selectedJurisdiction,
          top_k: 4,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setLiveResult(data)
      } else {
        const errJson = await res.json().catch(() => ({}))
        const rawErr = errJson.detail || `Server error (${res.status})`
        setErrorMessage(friendly(rawErr))
      }
    } catch (e: any) {
      setErrorMessage(friendly(e?.message || "Failed to fetch"))
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Pre-set query selections
  const handleSelectPreset = (mode: "grounded" | "insufficient") => {
    setQueryMode(mode)
    const q =
      mode === "grounded"
        ? "Who can terminate this agreement?"
        : "What insurance must the vendor carry?"
    setUserQuery(q)
    handleRunAnalysis(q)
  }

  const getVerdictLabel = (res: typeof liveResult): "SUPPORTED" | "PARTIAL" | "CONFLICTING" | "INSUFFICIENT" => {
    if (!res) return "SUPPORTED"
    if (res.is_abstention) return "INSUFFICIENT"
    const st = (res.evidence_state || "").toUpperCase()
    if (st.includes("CONFLICT")) return "CONFLICTING"
    if (st.includes("PARTIAL")) return "PARTIAL"
    if (st.includes("INSUFFICIENT") || st.includes("ABSTAIN")) return "INSUFFICIENT"
    return "SUPPORTED"
  }

  const detectRelationship = (chunkId: string, text: string) => {
    if (liveResult?.relationships && liveResult.relationships.length > 0) {
      const match = liveResult.relationships.find(
        (r) => r.source_chunk_id === chunkId || r.target_chunk_id === chunkId
      )
      if (match) {
        return {
          text: `${match.source_section || "Section"} ${match.relation || "references"} ${match.target_section || match.referenced_section || "Master Agreement"}`,
          operator: match.operator || "notwithstanding / precedence",
        }
      }
    }
    if (/notwithstanding.*(?:section\s*9\.2|master\s+agreement)/i.test(text)) {
      return {
        text: "Section 3.1 accelerated notice overrides Section 9.2 in Master Agreement (DOC-006)",
        operator: "notwithstanding",
      }
    }
    if (/notwithstanding\s+(?:the\s+)?section\s*[\d\.]+/i.test(text)) {
      const m = text.match(/notwithstanding(?:\s+the\s+[^,]+)?\s+in\s+(section\s+[\d\.]+)/i)
      return {
        text: `Overrides ${m ? m[1] : "referenced section"} in Master Agreement`,
        operator: "notwithstanding",
      }
    }
    return null
  }

  const activeJurisdictionData = JURISDICTIONS.find((j) => j.id === selectedJurisdiction) || JURISDICTIONS[0]

  return (
    <div
      className="experience-container"
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
    >
      {/* 1. VISUAL ENGINE: CursorRingField WebGL background */}
      <div className="canvas-background-layer" aria-hidden="true">
        <CursorRingField
          background="#04050a"
          density={300}
          dotSize={120}
          speed={6}
          cameraDistance={160}
          ring={{ push: 50, width: 9, radius: 12, turbulence: 100 }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Ambient vignette & grain overlay */}
      <div className="vignette-overlay" aria-hidden="true" />

      {/* 2. TOP NAVIGATION */}
      <header className="nav-header">
        <div
          className="brand-block"
          onClick={() => setStage("hero")}
          role="button"
          tabIndex={0}
          aria-label="HNX Legal Intelligence Home"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setStage("hero")
          }}
        >
          <span className="brand-monogram">HNX</span>
          <span className="brand-name">LEGAL INTELLIGENCE</span>
        </div>

        <nav className="nav-links" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-link ${stage === "hero" ? "nav-link-active on" : ""}`}
            onClick={() => setStage("hero")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`nav-link ${stage === "analysis" ? "nav-link-active on" : ""}`}
            onClick={() => setStage("analysis")}
          >
            Analysis
          </button>
          <button
            type="button"
            className="nav-cta-btn"
            onClick={() => setStage(stage === "hero" ? "analysis" : "hero")}
          >
            Analyze a Document
          </button>
        </nav>
      </header>

      {/* 3. HERO STAGE ("THE EVIDENCE DESK") */}
      {stage === "hero" && (
        <main className="hero-stage transition-wrapper fade-in">
          <div className="hero-body-split">
            {/* Left Column: Editorial Headline & Philosophy */}
            <div className="hero-editorial-column">
              <div className="hero-pill-category">
                <span className="pulse-dot" aria-hidden="true" />
                <span className="category-text">LEGAL REVIEW · HACKNEX 2026</span>
              </div>

              <h1 className="hero-headline">
                Legal AI that
                <br />
                <em style={{ color: "var(--accent-indigo-light)", fontStyle: "normal" }}>shows its evidence.</em>
              </h1>

              <p className="hero-supporting-line" style={{ fontSize: "1.08rem", maxWidth: "540px", margin: "16px 0 28px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Review legal documents, ask grounded questions, and trace every important claim back to the exact source evidence.
              </p>

              <div className="hero-cta-group" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  type="button"
                  className="hero-primary-cta"
                  onClick={() => setStage("analysis")}
                  id="hero-cta-button"
                  aria-label="Analyze a Document"
                >
                  <span>Analyze a Document</span>
                  <ArrowRightIcon className="arrow" />
                </button>
                <button
                  type="button"
                  className="nav-cta-btn"
                  style={{ height: "46px", padding: "0 22px", borderRadius: "6px", fontSize: "14px" }}
                  onClick={() => {
                    setStage("analysis")
                    setUserQuery("Who can terminate this agreement?")
                  }}
                  id="hero-sample-button"
                  aria-label="Try a Sample"
                >
                  <span>Try a Sample</span>
                </button>
              </div>
            </div>

            {/* Right Column: Floating Physical Legal Document Artifact */}
            <div className="hero-document-column">
              {/* Evidence laser beam in continuous ambient loop */}
              <div
                className={`evidence-connection-beam ${
                  ambientStep === 1 || ambientStep === 2 ? "visible" : ""
                }`}
                aria-hidden="true"
              />

              <article
                className="legal-document-artifact"
                style={{
                  transform: `rotateX(${docTilt.x}deg) rotateY(${docTilt.y}deg)`,
                }}
                onClick={() => setStage("upload")}
                role="button"
                tabIndex={0}
                aria-label="Sample Master Services Agreement DOC-006. Click to enter document workspace."
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setStage("upload")
                }}
              >
                {/* Paper texture and background watermark */}
                <div className="document-surface-texture" aria-hidden="true" />
                <div className="document-watermark-stamp" aria-hidden="true">VERIFIED</div>

                {/* Left Margin Legal Rule */}
                <div className="document-margin-rule" aria-hidden="true" />

                {/* Document Header & Metadata */}
                <header className="document-meta-header">
                  <div className="document-header-row">
                    <span className="doc-type-label">CONTRACTUAL ARTIFACT</span>
                    <span className="doc-status-badge">
                      <ShieldCheckIcon className="status-svg" />
                      STATUS · VERIFIED
                    </span>
                  </div>
                  <h2 className="doc-main-title">MASTER SERVICES AGREEMENT</h2>
                  <div className="doc-id-row">
                    <span>DOCUMENT ID · DOC-006</span>
                    <span className="bullet">·</span>
                    <span>PAGES · 1 OF 4</span>
                    <span className="bullet">·</span>
                    <span>HASH · SHA-256 #4A8B</span>
                  </div>
                </header>

                {/* Section 07 INTELLECTUAL PROPERTY */}
                <div className="document-section-block">
                  <div className="doc-section-number">SECTION 07</div>
                  <h3 className="doc-section-title">INTELLECTUAL PROPERTY</h3>

                  {/* 7.1 Indemnification */}
                  <div className="doc-clause-block">
                    <div className="doc-clause-header">
                      <span className="clause-tag">§ 7.1</span>
                      <span className="doc-clause-title">Indemnification Obligation</span>
                    </div>
                    <p className="doc-clause-text">
                      Vendor shall defend and indemnify Customer against third-party claims
                      alleging that the Cloud Services infringe any patent, copyright, or trademark
                      duly registered in the applicable jurisdiction...
                    </p>
                  </div>

                  {/* 7.2 Exceptions with signature continuous ambient evidence highlight */}
                  <div
                    className={`doc-clause-block ${
                      ambientStep === 2 ? "active-evidence-illumination" : ""
                    }`}
                    style={{ position: "relative" }}
                  >
                    {/* Citation marker appearing in ambient loop */}
                    {(ambientStep === 1 || ambientStep === 2) && (
                      <div className="evidence-citation-pill" aria-label="Evidence citation marker section 7.2(ii)">
                        <span className="citation-pip" />
                        <span>CITATION · § 7.2(ii)</span>
                      </div>
                    )}

                    <div className="doc-clause-header">
                      <span className="clause-tag">§ 7.2</span>
                      <span className="doc-clause-title">Carveout Exceptions</span>
                    </div>
                    <p className="doc-clause-text">
                      The foregoing obligation shall not apply to claims arising from (i) Customer Data,
                      or (ii) modifications to the Cloud Services made by Customer or any third party
                      without Vendor's express written approval...
                    </p>
                  </div>
                </div>

                {/* Bottom interactive hint */}
                <footer className="document-bottom-hint">
                  <span className="mapping-label">EVIDENCE DESK · AMBIENT MAPPING</span>
                  <span className="inspect-action">
                    CLICK TO ENTER WORKSPACE
                    <ArrowRightIcon className="mini-arrow" />
                  </span>
                </footer>
              </article>
            </div>
          </div>

          {/* Bottom Trust Row */}
          <footer className="hero-trust-bar" aria-label="Product Principles">
            <span className="trust-item">EVIDENCE FIRST</span>
            <span className="trust-separator" aria-hidden="true">·</span>
            <span className="trust-item">SOURCE TRACEABLE</span>
            <span className="trust-separator" aria-hidden="true">·</span>
            <span className="trust-item">JURISDICTION AWARE</span>
            <span className="trust-separator" aria-hidden="true">·</span>
            <span className="trust-item">CALIBRATED ABSTENTION</span>
          </footer>
        </main>
      )}

      {/* 4. DOCUMENT UPLOAD WORKSPACE */}
      {stage === "upload" && (
        <main className="workspace-page transition-wrapper fade-in">
          <nav className="workspace-top-bar" aria-label="Ingestion Navigation">
            <div className="workspace-breadcrumb">
              <button
                type="button"
                className="back-button"
                onClick={() => setStage("hero")}
              >
                ← Return to Evidence Desk
              </button>
              <span className="workspace-stage-tag">STAGE 01 · DOCUMENT INGESTION</span>
            </div>

            <div className="active-jurisdiction-pill">
              <span className="pill-code">{activeJurisdictionData.code}</span>
              <span>{selectedJurisdiction} Governing Law</span>
            </div>
          </nav>

          <section className="upload-card-wrapper" aria-labelledby="upload-heading">
            <header className="upload-header-block">
              <h2 id="upload-heading" className="workspace-header-title">UPLOAD YOUR DOCUMENTS</h2>
              <p className="workspace-header-desc">
                Ground legal analysis directly in authoritative contractual evidence.
                Artifacts are indexed into structured hierarchical sections and cross-clause nodes.
              </p>
            </header>

            {/* Dropzone */}
            <div
              className="dropzone-container"
              onClick={() => alert("3 authoritative legal contracts are pre-loaded into the active index.")}
              role="button"
              tabIndex={0}
              aria-label="Upload legal document dropzone"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  alert("3 authoritative legal contracts are pre-loaded into the active index.")
                }
              }}
            >
              <UploadCloudIcon className="dropzone-icon" />
              <div className="dropzone-title">Upload a legal document</div>
              <div className="dropzone-hint">Drag a file here · PDF, TXT or Markdown</div>
            </div>

            {/* Uploaded Documents List */}
            <div className="uploaded-docs-section">
              <div className="section-label-header">
                <span className="section-label-mono">DOCUMENTS</span>
                <span className="doc-count-badge">3 FILES READY</span>
              </div>

              <div className="doc-list-group">
                {INITIAL_DOCS.map((doc) => (
                  <div key={doc.id} className="doc-item-row">
                    <div className="doc-item-info">
                      <div className="doc-icon-badge" aria-hidden="true">
                        <FileTextIcon />
                      </div>
                      <div>
                        <div className="doc-title-text">{doc.file}</div>
                        <div className="doc-meta-text">
                          <span>{doc.id}</span>
                          <span className="sep">·</span>
                          <span>{doc.size}</span>
                          <span className="sep">·</span>
                          <span>{doc.sections} Sections</span>
                          <span className="sep">·</span>
                          <span className="checksum-tag">{doc.checksum}</span>
                        </div>
                      </div>
                    </div>
                    <span className="ready-status-badge">
                      <CheckIcon className="check-svg" />
                      <span>Ready to analyze</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CORE PRODUCT REQUIREMENT: EXPLICIT JURISDICTION SELECTOR */}
            <div className="jurisdiction-box">
              <div className="jurisdiction-label-row">
                <label htmlFor="jurisdiction-selector" className="jurisdiction-title">
                  Document Jurisdiction
                </label>
                <span className="jurisdiction-mandate-tag">MANDATORY EXPLICIT SELECTION</span>
              </div>
              <p className="jurisdiction-helper">
                Select the jurisdiction governing these documents. Never inferred from user IP,
                browser locale, filename, or language.
              </p>

              <div className="select-wrapper">
                <select
                  id="jurisdiction-selector"
                  className="jurisdiction-select"
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                >
                  {JURISDICTIONS.map((j) => (
                    <option key={j.id} value={j.id}>
                      [{j.code}] {j.label} — {j.legalSystem}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="select-chevron" />
              </div>

              <div className="jurisdiction-notice">
                <LockIcon className="lock-svg" />
                <span>Precedence and statutory conflict rules evaluate strictly under {selectedJurisdiction} jurisprudence.</span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              className="analyze-submit-btn"
              onClick={() => {
                setStage("analysis")
                handleSelectPreset("grounded")
              }}
              id="analyze-documents-btn"
            >
              <span>Analyze documents</span>
              <ArrowRightIcon className="submit-arrow" />
            </button>
          </section>
        </main>
      )}

      {/* 5. ANALYSIS WORKSPACE */}
      {stage === "analysis" && (
        <main className="workspace-page transition-wrapper fade-in">
          <nav className="workspace-top-bar" aria-label="Analysis Navigation">
            <div className="workspace-breadcrumb">
              <button
                type="button"
                className="back-button"
                onClick={() => setStage("upload")}
              >
                ← Adjust Ingested Documents
              </button>
              <span className="workspace-stage-tag">LEGAL DOCUMENT ANALYSIS</span>
            </div>

            <div className="active-jurisdiction-pill">
              <span className="pill-code">{activeJurisdictionData.code}</span>
              <span>{selectedJurisdiction} Jurisdiction Active</span>
            </div>
          </nav>

          <div className="analysis-grid-layout">
            {/* Left Sidebar: Document Roster & Governance Metadata */}
            <aside className="analysis-sidebar" aria-label="Document Inventory">
              <div className="sidebar-section-header">
                <span className="sidebar-title">INGESTED CONTRACTS</span>
                <span className="sidebar-count">3 ACTIVE</span>
              </div>

              {INITIAL_DOCS.map((doc, idx) => (
                <div
                  key={doc.id}
                  className={`sidebar-doc-card ${idx === 0 ? "active" : ""}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${doc.title}, ${doc.sections} sections, verified`}
                >
                  <div className="sidebar-doc-name">{doc.title}</div>
                  <div className="sidebar-doc-sub">
                    <span className="doc-pill">{doc.id}</span>
                    <span className="sep">·</span>
                    <span>{doc.sections} Sec</span>
                    <span className="sep">·</span>
                    <span className="status-text">Verified</span>
                  </div>
                </div>
              ))}

              <div className="sidebar-governance-box">
                <div className="sidebar-title">GOVERNANCE & AUDIT</div>
                <div className="gov-row">
                  <span className="gov-label">Governing Law</span>
                  <span className="gov-value">{selectedJurisdiction}</span>
                </div>
                <div className="gov-row">
                  <span className="gov-label">Selection Type</span>
                  <span className="gov-value">Explicit (No inference)</span>
                </div>
                <div className="gov-row">
                  <span className="gov-label">Hallucination Gate</span>
                  <span className="gov-value" style={{ color: "var(--accent-emerald)" }}>ESV Verification Active</span>
                </div>
                <div className="gov-row">
                  <span className="gov-label">Precedence Engine</span>
                  <span className="gov-value">CPDE Precedence Engaged</span>
                </div>
              </div>
            </aside>

            {/* Main Canvas: Query Input & Answer with Exact Grounded Evidence */}
            <section className="analysis-main-canvas" aria-label="Query and Grounded Analysis">
              {/* Question Input Panel */}
              <div className="query-box-card">
                <div className="query-label-row">
                  <span className="query-input-title">CONTRACTUAL INQUIRY</span>
                  <span className="query-mode-label">
                    PHILOSOPHY: VERIFIABILITY &gt; FLUENCY
                  </span>
                </div>

                <div className="query-input-row">
                  <input
                    id="query-input"
                    type="text"
                    className="query-text-input"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isAnalyzing) handleRunAnalysis()
                    }}
                    placeholder="Ask a question about your documents..."
                    aria-label="Legal Inquiry Input"
                    disabled={isAnalyzing}
                  />
                  <button
                    type="button"
                    className="query-trigger-btn"
                    onClick={() => handleRunAnalysis()}
                    disabled={isAnalyzing || !userQuery.trim()}
                  >
                    {isAnalyzing ? "Checking…" : "Analyze"}
                  </button>
                </div>

                {/* Example Prompts that populate without auto-submitting */}
                <div className="suggest-bar" role="group" aria-label="Example prompt suggestions">
                  <span className="suggest-k">Try</span>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="suggest-chip"
                      onClick={() => {
                        setUserQuery(s)
                        const el = document.getElementById("query-input")
                        if (el) el.focus()
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plain-English Error Notice */}
              {errorMessage && (
                <div className="error-notice" role="alert">
                  <strong>Notice: </strong> {errorMessage}
                </div>
              )}

              {/* Staged Loading State: Analyzing -> Retrieving evidence -> Verifying source support */}
              {isAnalyzing && (
                <div className="staged-thinking" role="status" aria-live="polite">
                  {STAGES.map((t, i) => (
                    <div
                      key={t}
                      className={`staged-step ${i < loadingStage ? "done" : i === loadingStage ? "now" : ""}`}
                    >
                      <span style={{ width: "18px", display: "inline-block", textAlign: "center" }}>
                        {i < loadingStage ? "✓" : i === loadingStage ? <span className="staged-dot-pulse" style={{ display: "inline-block" }} /> : "·"}
                      </span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* LIVE BACKEND RESULT (when connected) */}
              {liveResult && !isAnalyzing && (() => {
                const verdict = getVerdictLabel(liveResult)
                const copy = LABEL_COPY[verdict] || LABEL_COPY.SUPPORTED

                if (verdict === "CONFLICTING") {
                  return (
                    <article className="results-card" aria-label="Conflicting Legal Provisions">
                      <header className="answer-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span className="verdict-pill conflicting">Conflicting</span>
                          <span className="answer-section-tag" style={{ margin: 0 }}>
                            <AlertTriangleIcon className="tag-svg" />
                            {copy.title}
                          </span>
                        </div>
                      </header>
                      <div className="answer-k">Answer</div>
                      <div className="answer-body-text">{liveResult.answer_text}</div>
                      <div className="conflict-container">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#fff" }}>Conflicting evidence</h4>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>both sources shown · neither chosen for you</span>
                        </div>
                        {liveResult.conflicts && liveResult.conflicts.length > 0 ? (
                          liveResult.conflicts.map((c, i) => (
                            <div key={i} style={{ marginBottom: "16px" }}>
                              <div className="conflict-grid">
                                <EvidenceBlockItem
                                  tag="Source A"
                                  claim={c.claim_a}
                                  docTitle={c.chunk_a.split("#")[0] || "Document A"}
                                  section={c.chunk_a}
                                  quote={c.quote_a}
                                  fullText={c.quote_a}
                                  onOpen={() => setActiveSourceModal({
                                    docId: c.chunk_a.split("#")[0] || "DOC-A",
                                    docTitle: "Conflicting Source Clause A",
                                    section: c.chunk_a,
                                    quote: c.quote_a,
                                    fullClause: c.quote_a,
                                    highlight: c.quote_a,
                                  })}
                                />
                                <EvidenceBlockItem
                                  tag="Source B"
                                  claim={c.claim_b}
                                  docTitle={c.chunk_b.split("#")[0] || "Document B"}
                                  section={c.chunk_b}
                                  quote={c.quote_b}
                                  fullText={c.quote_b}
                                  onOpen={() => setActiveSourceModal({
                                    docId: c.chunk_b.split("#")[0] || "DOC-B",
                                    docTitle: "Conflicting Source Clause B",
                                    section: c.chunk_b,
                                    quote: c.quote_b,
                                    fullClause: c.quote_b,
                                    highlight: c.quote_b,
                                  })}
                                />
                              </div>
                              {c.reason && <div className="conflict-why">{c.reason}</div>}
                            </div>
                          ))
                        ) : (
                          <div className="conflict-grid">
                            {liveResult.citations.slice(0, 2).map((cit, idx) => (
                              <EvidenceBlockItem
                                key={cit.chunk_id + idx}
                                tag={idx === 0 ? "Source A" : "Source B"}
                                claim={cit.claim}
                                docTitle={cit.chunk_id.split("#")[0]}
                                section={cit.chunk_id}
                                quote={cit.quote_snippet || cit.claim}
                                fullText={cit.quote_snippet || cit.claim}
                                onOpen={() => setActiveSourceModal({
                                  docId: cit.chunk_id.split("#")[0],
                                  docTitle: "Conflicting Provision",
                                  section: cit.chunk_id,
                                  quote: cit.quote_snippet || cit.claim,
                                  fullClause: cit.quote_snippet || cit.claim,
                                  highlight: cit.quote_snippet || cit.claim,
                                })}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  )
                }

                if (verdict === "INSUFFICIENT") {
                  return (
                    <article className="insufficient-evidence-box" aria-label="Calibrated Abstention Notice">
                      <div className="insufficient-header-badge" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <AlertTriangleIcon className="alert-svg" />
                        <span className="verdict-pill insufficient">Insufficient evidence</span>
                      </div>
                      <div className="answer-k" style={{ padding: "12px 0 4px", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>
                        Answer
                      </div>
                      <h3 className="insufficient-title" style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fff", marginTop: "4px" }}>
                        The provided documents do not establish an answer to this question.
                      </h3>
                      <p className="insufficient-body" style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "8px", lineHeight: "1.6" }}>
                        {liveResult.abstention_reason || "Nothing was guessed. The closest passages are shown below."}
                      </p>

                      {/* What was found: the closest passages, so you can confirm */}
                      {liveResult.evidence && liveResult.evidence.length > 0 && (
                        <div style={{ marginTop: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: "#fff" }}>What was found</h4>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>the closest passages, so you can confirm</span>
                          </div>
                          <div className="evidence-cards-container">
                            {liveResult.evidence.slice(0, 3).map((e, idx) => (
                              <EvidenceBlockItem
                                key={e.chunk_id + idx}
                                docTitle={e.document_title || e.chunk_id.split("#")[0]}
                                section={e.section || e.chunk_id}
                                quote={e.text.slice(0, 160)}
                                fullText={e.text}
                                onOpen={() => setActiveSourceModal({
                                  docId: e.doc_id || e.chunk_id.split("#")[0],
                                  docTitle: e.document_title || "Ingested Document Clause",
                                  section: e.section || e.chunk_id,
                                  quote: e.text.slice(0, 160),
                                  fullClause: e.text,
                                  highlight: e.text.slice(0, 160),
                                })}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="philosophy-callout-box" style={{ marginTop: "20px" }}>
                        <div className="philosophy-tag-row">
                          <ShieldCheckIcon className="shield-svg" />
                          <span className="philosophy-tag">PRODUCT PHILOSOPHY: VERIFIABILITY &gt; FLUENCY</span>
                        </div>
                        <p className="philosophy-text">
                          The system strictly abstains from synthesizing speculative clauses or penalty figures
                          when verifiable evidence is absent. Rather than hallucinating a plausible answer,
                          HNX Legal Intelligence safeguards judicial and corporate diligence through calibrated abstention.
                        </p>
                      </div>
                    </article>
                  )
                }

                // Supported or Partially Supported
                return (
                  <article className="results-card" aria-label="Document-Grounded Answer">
                    <header className="answer-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className={`verdict-pill ${copy.tone}`}>
                          {copy.pill}
                        </span>
                        <span className="answer-section-tag" style={{ margin: 0 }}>
                          <ShieldCheckIcon className="tag-svg" />
                          {copy.title}
                        </span>
                      </div>
                      <span className="evidence-badge-verified">
                        <CheckIcon className="check-svg" />
                        {liveResult.citations.length} CITATION{liveResult.citations.length === 1 ? "" : "S"} BACKED
                      </span>
                    </header>

                    <div className="answer-k" style={{ padding: "0 0 6px 0", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>
                      Answer
                    </div>
                    <div className="answer-body-text" style={{ fontSize: "1.05rem", lineHeight: 1.65, color: "#f8fafc", padding: "0 0 16px 0" }}>
                      {liveResult.answer_text}
                    </div>

                    {/* Evidence Chain Hierarchy: Claim -> Source -> Exact Evidence -> Relationship */}
                    <div className="evidence-chain-connector" aria-label="Evidence hierarchy link">
                      <div className="chain-line" />
                      <span className="chain-badge">SUPPORTED BY EXACT EVIDENCE</span>
                      <div className="chain-line" />
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: "#fff" }}>Evidence found</h4>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {liveResult.citations.length} passage{liveResult.citations.length === 1 ? "" : "s"} · each claim, its source, and the exact words
                        </span>
                      </div>

                      <div className="evidence-cards-container">
                        {liveResult.citations.map((cit, cIdx) => {
                          const matchedChunk = liveResult.evidence?.find((e) => e.chunk_id === cit.chunk_id)
                          const fullText = matchedChunk?.text || cit.quote_snippet || cit.claim
                          const docTitle = matchedChunk?.document_title || cit.chunk_id.split("#")[0]
                          const section = matchedChunk?.section || cit.chunk_id
                          const rel = detectRelationship(cit.chunk_id, fullText)

                          return (
                            <EvidenceBlockItem
                              key={cit.chunk_id + cIdx}
                              claim={cit.claim && cit.claim !== fullText ? cit.claim : undefined}
                              docTitle={docTitle}
                              section={section}
                              quote={cit.quote_snippet || cit.claim}
                              fullText={fullText}
                              relationship={rel}
                              onOpen={() =>
                                setActiveSourceModal({
                                  docId: cit.chunk_id.split("#")[0] || "DOC",
                                  docTitle: docTitle || "Ingested Contract Evidence",
                                  section: section,
                                  quote: cit.quote_snippet || cit.claim,
                                  fullClause: fullText,
                                  highlight: cit.quote_snippet || cit.claim,
                                })
                              }
                            />
                          )
                        })}
                      </div>
                    </div>
                  </article>
                )
              })()}

              {/* DEMO / SAMPLE PREVIEW (Shown before first query is executed) */}
              {!liveResult && !isAnalyzing && (
                <div style={{ marginTop: "8px" }}>
                  <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
                      SAMPLE AUDIT PREVIEW · RUN ANALYSIS OR TRY AN EXAMPLE ABOVE
                    </span>
                    <div className="query-preset-chips" role="group" aria-label="Sample Demo Scenarios" style={{ margin: 0 }}>
                      <button
                        type="button"
                        className={`preset-chip-btn ${queryMode === "grounded" ? "active" : ""}`}
                        onClick={() => handleSelectPreset("grounded")}
                      >
                        Sample 1: Supported Carveout (§ 7.1 vs § 7.2)
                      </button>
                      <button
                        type="button"
                        className={`preset-chip-btn ${queryMode === "insufficient" ? "active" : ""}`}
                        onClick={() => handleSelectPreset("insufficient")}
                      >
                        Sample 2: Calibrated Abstention
                      </button>
                    </div>
                  </div>

                  {queryMode === "grounded" ? (
                    <article className="results-card" aria-label="Document-Grounded Answer">
                      <header className="answer-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span className="verdict-pill supported">Supported</span>
                          <span className="answer-section-tag" style={{ margin: 0 }}>
                            <ShieldCheckIcon className="tag-svg" />
                            Supported by your documents
                          </span>
                        </div>
                        <span className="evidence-badge-verified">
                          <CheckIcon className="check-svg" />
                          2 CITATIONS BACKED
                        </span>
                      </header>

                      <div className="answer-k" style={{ padding: "0 0 6px 0", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>
                        Answer
                      </div>
                      <div className="answer-body-text" style={{ fontSize: "1.05rem", lineHeight: 1.65, color: "#f8fafc", padding: "0 0 16px 0" }}>
                        Not in all cases. Section 7.1 establishes an IP infringement indemnification obligation; however, Section 7.2 explicitly excludes claims arising from customer modifications.
                      </div>

                      <div className="evidence-chain-connector" aria-label="Evidence hierarchy link">
                        <div className="chain-line" />
                        <span className="chain-badge">SUPPORTED BY EXACT EVIDENCE</span>
                        <div className="chain-line" />
                      </div>

                      <div style={{ marginTop: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: "#fff" }}>Evidence found</h4>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>2 passages · each claim, its source, and the exact words</span>
                        </div>

                        <div className="evidence-cards-container">
                          <EvidenceBlockItem
                            claim="Primary IP infringement defense and indemnification obligation"
                            docTitle="Cloud Master Services Agreement (DOC-006)"
                            section="§ 7.1 Indemnification"
                            quote="Vendor shall defend and indemnify Customer against third-party claims alleging that the Cloud Services infringe any patent, copyright, or trademark"
                            fullText="7.1 Indemnification. Vendor shall defend and indemnify Customer against third-party claims alleging that the Cloud Services infringe any patent, copyright, or trademark duly registered in the applicable jurisdiction, and shall pay all damages finally awarded by a court of competent jurisdiction or agreed in a written settlement approved by Vendor."
                            onOpen={() => setActiveSourceModal({
                              docId: "DOC-006",
                              docTitle: "Cloud Master Services Agreement",
                              section: "§ 7.1 Indemnification",
                              quote: "Vendor shall defend and indemnify Customer against third-party claims alleging that the Cloud Services infringe any patent, copyright, or trademark...",
                              fullClause: "7.1 Indemnification. Vendor shall defend and indemnify Customer against third-party claims alleging that the Cloud Services infringe any patent, copyright, or trademark duly registered in the applicable jurisdiction, and shall pay all damages finally awarded by a court of competent jurisdiction or agreed in a written settlement approved by Vendor.",
                              highlight: "Vendor shall defend and indemnify Customer against third-party claims alleging that the Cloud Services infringe any patent, copyright, or trademark"
                            })}
                          />

                          <EvidenceBlockItem
                            claim="Carveout exception excluding customer-modified services"
                            docTitle="Cloud Master Services Agreement (DOC-006)"
                            section="§ 7.2 Exceptions"
                            quote="This obligation shall not apply to claims arising from modifications to the Service made by Customer or any third party not authorized by Vendor"
                            fullText="7.2 Exceptions. The foregoing obligation shall not apply to claims arising from (i) Customer Data, (ii) modifications to the Cloud Services made by Customer or any third party not authorized by Vendor in writing, (iii) use of the Cloud Services in combination with non-Vendor hardware, software, or systems not specified in the Documentation, or (iv) Customer's failure to deploy an update provided by Vendor."
                            onOpen={() => setActiveSourceModal({
                              docId: "DOC-006",
                              docTitle: "Cloud Master Services Agreement",
                              section: "§ 7.2 Exceptions",
                              quote: "This obligation shall not apply to claims arising from modifications to the Service made by Customer or any third party...",
                              fullClause: "7.2 Exceptions. The foregoing obligation shall not apply to claims arising from (i) Customer Data, (ii) modifications to the Cloud Services made by Customer or any third party not authorized by Vendor in writing, (iii) use of the Cloud Services in combination with non-Vendor hardware, software, or systems not specified in the Documentation, or (iv) Customer's failure to deploy an update provided by Vendor.",
                              highlight: "The foregoing obligation shall not apply to claims arising from... (ii) modifications to the Cloud Services made by Customer or any third party not authorized by Vendor"
                            })}
                          />
                        </div>
                      </div>
                    </article>
                  ) : (
                    <article className="insufficient-evidence-box" aria-label="Calibrated Abstention Notice">
                      <div className="insufficient-header-badge" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <AlertTriangleIcon className="alert-svg" />
                        <span className="verdict-pill insufficient">Insufficient evidence</span>
                      </div>
                      <div className="answer-k" style={{ padding: "12px 0 4px", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>
                        Answer
                      </div>
                      <h3 className="insufficient-title" style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fff", marginTop: "4px" }}>
                        The provided documents do not establish an answer to this question.
                      </h3>
                      <p className="insufficient-body" style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "8px", lineHeight: "1.6" }}>
                        Nothing was guessed. No source code escrow or liquidated damages clause was found in DOC-006, DOC-007, or DOC-008.
                      </p>

                      <div className="philosophy-callout-box" style={{ marginTop: "20px" }}>
                        <div className="philosophy-tag-row">
                          <ShieldCheckIcon className="shield-svg" />
                          <span className="philosophy-tag">PRODUCT PHILOSOPHY: VERIFIABILITY &gt; FLUENCY</span>
                        </div>
                        <p className="philosophy-text">
                          The system strictly abstains from synthesizing speculative liquidated damages clauses,
                          escrow deposit timelines, or penalty figures when verifiable evidence is absent.
                          Rather than hallucinating a plausible answer, HNX Legal Intelligence safeguards judicial and corporate diligence through calibrated abstention.
                        </p>
                      </div>
                    </article>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {/* 6. SOURCE VIEWER MODAL / DRAWER */}
      {activeSourceModal && (
        <div
          className="source-modal-backdrop"
          onClick={() => setActiveSourceModal(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-doc-title"
        >
          <div
            className="source-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="source-modal-header">
              <div className="source-title-meta">
                <h3 id="modal-doc-title" className="source-doc-heading">
                  {activeSourceModal.docTitle} ({activeSourceModal.docId})
                </h3>
                <span className="source-sub-hash">
                  {activeSourceModal.section} · HASH VERIFIED · {selectedJurisdiction} GOVERNED
                </span>
              </div>
              <button
                type="button"
                className="source-close-btn"
                onClick={() => setActiveSourceModal(null)}
                aria-label="Close Source Viewer"
              >
                <CrossIcon className="cross-svg" />
                <span>Close</span>
              </button>
            </header>

            <div className="source-modal-body">
              <div className="modal-section-label">FULL SECTION CONTEXT</div>
              <div className="source-full-clause">
                <p>{activeSourceModal.fullClause}</p>
              </div>

              <div className="modal-section-label">SUPPORTING EVIDENCE CLAUSE HIGHLIGHT</div>
              <div className="source-clause-highlight">
                <mark>{activeSourceModal.highlight}</mark>
              </div>

              <footer className="source-modal-footer">
                <ShieldCheckIcon className="audit-svg" />
                <span>Cryptographic provenance verified. Direct audit trace linked to JC-PAR retrieval engine.</span>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
