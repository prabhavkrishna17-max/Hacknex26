import React, { useState, useEffect } from "react"
import CursorRingField from "./components/CursorRingField"

// Available Jurisdictions (Strict user selection, never inferred)
const JURISDICTIONS = [
  { id: "India", label: "India", flag: "🇮🇳", legalSystem: "Indian Contract Act & IT Act" },
  { id: "United States", label: "United States", flag: "🇺🇸", legalSystem: "Delaware / New York Commercial Law" },
  { id: "United Kingdom", label: "United Kingdom", flag: "🇬🇧", legalSystem: "English Common Law & UCTA" },
  { id: "Canada", label: "Canada", flag: "🇨🇦", legalSystem: "Common Law & PIPEDA" },
  { id: "Australia", label: "Australia", flag: "🇦🇺", legalSystem: "Australian Consumer Law" },
  { id: "Singapore", label: "Singapore", flag: "🇸🇬", legalSystem: "Singapore Law & PDPA" },
  { id: "Germany", label: "Germany", flag: "🇩🇪", legalSystem: "Bürgerliches Gesetzbuch (BGB)" },
  { id: "France", label: "France", flag: "🇫🇷", legalSystem: "Code Civil des Français" },
  { id: "UAE", label: "UAE", flag: "🇦🇪", legalSystem: "DIFC / ADGM Commercial Regulations" }
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

export default function App() {
  // Navigation / stage state: 'hero' | 'upload' | 'analysis'
  const [stage, setStage] = useState<"hero" | "upload" | "analysis">("hero")

  // Explicit Jurisdiction state (India by default or user choice)
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("India")

  // Floating Hero Document ambient animation loop state
  const [ambientStep, setAmbientStep] = useState<number>(0)
  // Subtle 3D parallax on hero document
  const [docTilt, setDocTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Active query state in Analysis
  const [queryMode, setQueryMode] = useState<"grounded" | "insufficient">("grounded")
  const [userQuery, setUserQuery] = useState<string>(
    "Is the vendor required to defend the customer against patent infringement claims?"
  )
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)

  // Source Viewer Modal
  const [activeSourceModal, setActiveSourceModal] = useState<null | {
    docId: string
    docTitle: string
    section: string
    quote: string
    fullClause: string
    highlight: string
  }>(null)

  // Continuous Ambient Hero Animation Loop (NO SCROLL REQUIRED)
  useEffect(() => {
    if (stage !== "hero") return
    // Cycles through: 0: calm -> 1: particles gathering & beam -> 2: citation active & illuminated -> 3: calm
    const interval = setInterval(() => {
      setAmbientStep((prev) => (prev + 1) % 4)
    }, 2800)
    return () => clearInterval(interval)
  }, [stage])

  // Mouse move parallax for the floating legal document
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== "hero") return
    const rect = e.currentTarget.getBoundingClientRect()
    const xRel = (e.clientX - rect.left) / rect.width - 0.5
    const yRel = (e.clientY - rect.top) / rect.height - 0.5
    setDocTilt({
      x: -yRel * 10,
      y: xRel * 12
    })
  }

  const handleHeroMouseLeave = () => {
    setDocTilt({ x: 0, y: 0 })
  }

  // Pre-set query selections
  const handleSelectPreset = (mode: "grounded" | "insufficient") => {
    setQueryMode(mode)
    setIsAnalyzing(true)
    if (mode === "grounded") {
      setUserQuery("Is the vendor required to defend the customer against patent infringement claims?")
    } else {
      setUserQuery("What liquidated damages must the vendor pay if source code is not deposited into escrow within sixty days?")
    }
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 400)
  }

  const activeJurisdictionData = JURISDICTIONS.find((j) => j.id === selectedJurisdiction) || JURISDICTIONS[0]

  return (
    <div
      className="experience-container"
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
    >
      {/* 1. VISUAL ENGINE: CursorRingField WebGL background */}
      <div className="canvas-background-layer">
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

      {/* Ambient vignette & grain */}
      <div className="vignette-overlay" />

      {/* 2. TOP NAVIGATION */}
      <header className="nav-header">
        <div className="brand-block" onClick={() => setStage("hero")}>
          <span className="brand-monogram">HNX</span>
          <span className="brand-name">LEGAL INTELLIGENCE</span>
        </div>

        <nav className="nav-links">
          <button className="nav-link" onClick={() => setStage("hero")}>
            PRODUCT
          </button>
          <button
            className="nav-link"
            onClick={() => {
              setStage("analysis")
              handleSelectPreset("grounded")
            }}
          >
            HOW IT WORKS
          </button>
          <button
            className="nav-cta-btn"
            onClick={() => setStage(stage === "hero" ? "upload" : "hero")}
          >
            {stage === "hero" ? "START ANALYSIS" : "THE EVIDENCE DESK"}
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
                <span className="pulse-dot" />
                VERIFIABILITY &gt; FLUENCY
              </div>

              <h1 className="hero-headline">
                THE DOCUMENT
                <br />
                IS THE SOURCE
                <br />
                OF TRUTH.
              </h1>

              <div className="hero-subheadline">
                Ask anything.
                <br />
                See exactly why.
              </div>

              <p className="hero-supporting-line">
                Legal intelligence grounded in the evidence you provide. Every conclusion
                is strictly traceable to an authoritative contractual clause with zero hallucination.
              </p>

              <div className="hero-cta-group">
                <button
                  className="hero-primary-cta"
                  onClick={() => setStage("upload")}
                  id="hero-cta-button"
                >
                  <span>Start with your documents</span>
                  <span className="arrow">→</span>
                </button>
                <div className="hero-format-pill">PDF · DOCX · TXT</div>
              </div>
            </div>

            {/* Right Column: Floating Physical Legal Document Artifact */}
            <div className="hero-document-column">
              {/* Evidence laser beam in continuous ambient loop */}
              <div
                className={`evidence-connection-beam ${
                  ambientStep === 1 || ambientStep === 2 ? "visible" : ""
                }`}
              />

              <div
                className="legal-document-artifact"
                style={{
                  transform: `rotateX(${docTilt.x}deg) rotateY(${docTilt.y}deg)`,
                }}
                onClick={() => setStage("upload")}
                title="Click to inspect and begin document upload"
              >
                {/* Paper texture and background watermark */}
                <div className="document-surface-texture" />
                <div className="document-watermark-stamp">VERIFIED</div>

                {/* Document Header & Metadata */}
                <div className="document-meta-header">
                  <div className="document-header-row">
                    <span className="doc-type-label">CONTRACTUAL ARTIFACT</span>
                    <span className="doc-status-badge">
                      <span className="pip" />
                      STATUS · VERIFIED
                    </span>
                  </div>
                  <h2 className="doc-main-title">MASTER SERVICES AGREEMENT</h2>
                  <div className="doc-id-row">
                    <span>DOCUMENT ID · DOC-006</span>
                    <span>·</span>
                    <span>HASH · SHA-256 #4A8B</span>
                  </div>
                </div>

                {/* Section 07 INTELLECTUAL PROPERTY */}
                <div className="document-section-block">
                  <div className="doc-section-number">SECTION 07</div>
                  <div className="doc-section-title">INTELLECTUAL PROPERTY</div>

                  {/* 7.1 Indemnification */}
                  <div className="doc-clause-block">
                    <div className="doc-clause-title">7.1 Indemnification</div>
                    <div className="doc-clause-text">
                      Vendor shall defend and indemnify Customer against third-party claims
                      alleging that the Cloud Services infringe any patent, copyright, or trademark
                      duly registered in the applicable jurisdiction...
                    </div>
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
                      <div className="evidence-citation-pill">
                        <span>●</span> CITATION · § 7.2(ii)
                      </div>
                    )}

                    <div className="doc-clause-title">7.2 Exceptions</div>
                    <div className="doc-clause-text">
                      The foregoing obligation shall not apply to claims arising from (i) Customer Data,
                      or (ii) modifications to the Cloud Services made by Customer or any third party
                      without Vendor's express written approval...
                    </div>
                  </div>
                </div>

                {/* Bottom interactive hint */}
                <div className="document-bottom-hint">
                  <span>EVIDENCE DESK · CONTINUOUS MAPPING</span>
                  <span className="inspect-action">
                    CLICK TO ENTER WORKSPACE →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Row */}
          <footer className="hero-trust-bar">
            <span className="trust-item">EVIDENCE FIRST</span>
            <span className="trust-separator">·</span>
            <span className="trust-item">SOURCE TRACEABLE</span>
            <span className="trust-separator">·</span>
            <span className="trust-item">JURISDICTION AWARE</span>
            <span className="trust-separator">·</span>
            <span className="trust-item">CALIBRATED ABSTENTION</span>
          </footer>
        </main>
      )}

      {/* 4. DOCUMENT UPLOAD WORKSPACE */}
      {stage === "upload" && (
        <main className="workspace-page transition-wrapper fade-in">
          <div className="workspace-top-bar">
            <div className="workspace-breadcrumb">
              <button className="back-button" onClick={() => setStage("hero")}>
                ← Return to Evidence Desk
              </button>
              <span className="workspace-stage-tag">STAGE 01 · DOCUMENT INGESTION</span>
            </div>

            <div className="active-jurisdiction-pill">
              <span>{activeJurisdictionData.flag}</span>
              <span>{selectedJurisdiction} Governing Law</span>
            </div>
          </div>

          <div className="upload-card-wrapper">
            <h2 className="workspace-header-title">UPLOAD YOUR DOCUMENTS</h2>
            <p className="workspace-header-desc">
              Ground your legal inquiry directly in authoritative contractual evidence.
              Uploaded files are indexed with strict structural section headers and clause identifiers.
            </p>

            {/* Dropzone */}
            <div
              className="dropzone-container"
              onClick={() => alert("Mock upload: Contract files already pre-loaded into local index.")}
            >
              <svg
                className="dropzone-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 16.5V7.5M12 7.5L8.5 11M12 7.5L15.5 11" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 16.5C20 18.9853 17.9853 21 15.5 21H8.5C6.01472 21 4 18.9853 4 16.5C4 14.3644 5.48974 12.5768 7.5 12.1132C7.5 7.6322 11.1322 4 15.6132 4C18.6653 4 21.3129 5.8675 22.4571 8.5441C23.4475 9.4206 24 10.7188 24 12.1648C24 14.3644 22.4897 16.152 20.4795 16.6156" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="dropzone-title">Drop PDF / DOCX / TXT here</div>
              <div className="dropzone-hint">Or click to select contractual artifacts from disk</div>
            </div>

            {/* Uploaded Documents List */}
            <div className="uploaded-docs-section">
              <span className="section-label-mono">INDEXED CONTRACTUAL ARTIFACTS (3 FILES)</span>
              <div className="doc-list-group">
                {INITIAL_DOCS.map((doc) => (
                  <div key={doc.id} className="doc-item-row">
                    <div className="doc-item-info">
                      <span className="doc-icon-badge">{doc.id}</span>
                      <div>
                        <div className="doc-title-text">{doc.file}</div>
                        <div className="doc-meta-text">{doc.size} · {doc.sections} Sections · {doc.checksum}</div>
                      </div>
                    </div>
                    <span className="doc-status-verified">✓ {doc.status}</span>
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
                Select the jurisdiction governing these documents. Never inferred from user location,
                browser locale, filename, or language.
              </p>

              <select
                id="jurisdiction-selector"
                className="jurisdiction-select"
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value)}
              >
                {JURISDICTIONS.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.flag} {j.label} — {j.legalSystem}
                  </option>
                ))}
              </select>

              <div className="jurisdiction-notice">
                <span>🔒</span>
                <span>Precedence & statutory conflict rules will evaluate strictly under {selectedJurisdiction} jurisdiction.</span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              className="analyze-submit-btn"
              onClick={() => {
                setStage("analysis")
                handleSelectPreset("grounded")
              }}
              id="analyze-documents-btn"
            >
              <span>Analyze documents →</span>
            </button>
          </div>
        </main>
      )}

      {/* 5. ANALYSIS WORKSPACE */}
      {stage === "analysis" && (
        <main className="workspace-page transition-wrapper fade-in">
          <div className="workspace-top-bar">
            <div className="workspace-breadcrumb">
              <button className="back-button" onClick={() => setStage("upload")}>
                ← Adjust Ingested Documents
              </button>
              <span className="workspace-stage-tag">LEGAL DOCUMENT ANALYSIS</span>
            </div>

            <div className="active-jurisdiction-pill">
              <span>{activeJurisdictionData.flag}</span>
              <span>{selectedJurisdiction} Jurisdiction Active</span>
            </div>
          </div>

          <div className="analysis-grid-layout">
            {/* Left Sidebar: Document Roster & Governance Metadata */}
            <aside className="analysis-sidebar">
              <div className="sidebar-title">INGESTED CONTRACTS (3)</div>
              {INITIAL_DOCS.map((doc, idx) => (
                <div
                  key={doc.id}
                  className={`sidebar-doc-card ${idx === 0 ? "active" : ""}`}
                >
                  <div className="sidebar-doc-name">{doc.title}</div>
                  <div className="sidebar-doc-sub">
                    {doc.id} · {doc.sections} Sections · {doc.status}
                  </div>
                </div>
              ))}

              <div className="sidebar-governance-box">
                <div className="sidebar-title">GOVERNANCE & AUDIT</div>
                <div className="gov-row">
                  <span className="gov-label">Jurisdiction</span>
                  <span className="gov-value">{selectedJurisdiction}</span>
                </div>
                <div className="gov-row">
                  <span className="gov-label">Governing Rule</span>
                  <span className="gov-value">Explicitly selected</span>
                </div>
                <div className="gov-row">
                  <span className="gov-label">Hallucination Gate</span>
                  <span className="gov-value" style={{ color: "var(--accent-emerald)" }}>ESV Enforced</span>
                </div>
                <div className="gov-row">
                  <span className="gov-label">Precedence Engine</span>
                  <span className="gov-value">CPDE Active</span>
                </div>
              </div>
            </aside>

            {/* Main Canvas: Query Input & Answer with Exact Grounded Evidence */}
            <section className="analysis-main-canvas">
              {/* Question Input Panel */}
              <div className="query-box-card">
                <div className="query-label-row">
                  <span className="query-input-title">INQUIRY ON INGESTED EVIDENCE</span>
                  <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    Verifiability &gt; Fluency
                  </span>
                </div>

                {/* Preset Chips for the 2 Demo Scenarios */}
                <div className="query-preset-chips">
                  <button
                    className={`preset-chip-btn ${queryMode === "grounded" ? "active" : ""}`}
                    onClick={() => handleSelectPreset("grounded")}
                  >
                    Demo 1: Patent Infringement Carveout (§ 7.1 vs § 7.2)
                  </button>
                  <button
                    className={`preset-chip-btn ${queryMode === "insufficient" ? "active" : ""}`}
                    onClick={() => handleSelectPreset("insufficient")}
                  >
                    Demo 2: Escrow Liquidated Damages (Insufficient Evidence)
                  </button>
                </div>

                <div className="query-input-row">
                  <input
                    type="text"
                    className="query-text-input"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Ask a question about your documents..."
                  />
                  <button
                    className="query-trigger-btn"
                    onClick={() => {
                      setIsAnalyzing(true)
                      setTimeout(() => setIsAnalyzing(false), 300)
                    }}
                  >
                    {isAnalyzing ? "Verifying..." : "Analyze"}
                  </button>
                </div>
              </div>

              {/* DEMO STATE 1: Grounded Answer with Exact Traceable Evidence */}
              {queryMode === "grounded" && !isAnalyzing && (
                <div className="results-card">
                  <div className="answer-header-row">
                    <span className="answer-section-tag">
                      <span>✓</span> DOCUMENT-GROUNDED ANSWER
                    </span>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--accent-emerald)" }}>
                      100% EVIDENCE SUPPORTED
                    </span>
                  </div>

                  <h3 className="grounded-verdict-text">
                    Not in all cases.
                  </h3>

                  <div className="grounded-explanation-text">
                    Section 7.1 establishes an IP infringement indemnification obligation. However,
                    Section 7.2 excludes claims arising from modifications made by the customer.
                    <br /><br />
                    Based on the provided documents, the obligation does not extend to infringement
                    claims caused by customer modifications.
                  </div>

                  {/* VISUAL HIERARCHY: ANSWER ↓ SUPPORTED BY ↓ EXACT EVIDENCE */}
                  <div className="evidence-chain-connector">
                    <div className="chain-line" />
                    <span className="chain-badge">SUPPORTED BY EXACT EVIDENCE</span>
                    <div className="chain-line" />
                  </div>

                  {/* Evidence Cards */}
                  <div className="evidence-cards-container">
                    {/* Evidence Card 1 */}
                    <div className="evidence-card">
                      <div className="evidence-meta-row">
                        <span className="evidence-doc-pill">
                          <span>DOC-006</span>
                          <span>·</span>
                          <span>Cloud Master Services Agreement</span>
                          <span>·</span>
                          <span className="evidence-clause-tag">§ 7.1</span>
                        </span>
                        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                          Primary Indemnification
                        </span>
                      </div>
                      <blockquote className="evidence-excerpt-quote">
                        "Vendor shall defend and indemnify Customer against third-party claims alleging
                        that the Cloud Services infringe any patent, copyright, or trademark..."
                      </blockquote>
                      <button
                        className="view-source-action-btn"
                        onClick={() =>
                          setActiveSourceModal({
                            docId: "DOC-006",
                            docTitle: "Cloud Master Services Agreement",
                            section: "§ 7.1 Indemnification",
                            quote: "Vendor shall defend and indemnify Customer against third-party claims alleging that the Cloud Services infringe any patent, copyright, or trademark...",
                            fullClause:
                              "7.1 Indemnification. Vendor shall defend and indemnify Customer against third-party claims alleging that the Cloud Services infringe any patent, copyright, or trademark duly registered in the applicable jurisdiction, and shall pay all damages finally awarded by a court of competent jurisdiction or agreed in a written settlement approved by Vendor.",
                            highlight:
                              "Vendor shall defend and indemnify Customer against third-party claims alleging that the Cloud Services infringe any patent, copyright, or trademark"
                          })
                        }
                      >
                        <span>[ View source ]</span>
                      </button>
                    </div>

                    {/* Evidence Card 2 */}
                    <div className="evidence-card">
                      <div className="evidence-meta-row">
                        <span className="evidence-doc-pill">
                          <span>DOC-006</span>
                          <span>·</span>
                          <span>Cloud Master Services Agreement</span>
                          <span>·</span>
                          <span className="evidence-clause-tag">§ 7.2(ii)</span>
                        </span>
                        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                          Carveout Exception
                        </span>
                      </div>
                      <blockquote className="evidence-excerpt-quote">
                        "This obligation shall not apply to claims arising from modifications to the Service
                        made by Customer or any third party not authorized by Vendor..."
                      </blockquote>
                      <button
                        className="view-source-action-btn"
                        onClick={() =>
                          setActiveSourceModal({
                            docId: "DOC-006",
                            docTitle: "Cloud Master Services Agreement",
                            section: "§ 7.2 Exceptions",
                            quote: "This obligation shall not apply to claims arising from modifications to the Service made by Customer or any third party...",
                            fullClause:
                              "7.2 Exceptions. The foregoing obligation shall not apply to claims arising from (i) Customer Data, (ii) modifications to the Cloud Services made by Customer or any third party not authorized by Vendor in writing, (iii) use of the Cloud Services in combination with non-Vendor hardware, software, or systems not specified in the Documentation, or (iv) Customer's failure to deploy an update provided by Vendor.",
                            highlight:
                              "The foregoing obligation shall not apply to claims arising from... (ii) modifications to the Cloud Services made by Customer or any third party not authorized by Vendor"
                          })
                        }
                      >
                        <span>[ View source ]</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DEMO STATE 2: Insufficient Evidence Demonstration State */}
              {queryMode === "insufficient" && !isAnalyzing && (
                <div className="insufficient-evidence-box">
                  <div className="insufficient-header-badge">
                    <span>⚠</span> INSUFFICIENT EVIDENCE
                  </div>
                  <h3 className="insufficient-title">
                    The provided documents do not contain enough information to determine this.
                  </h3>
                  <p className="insufficient-body">
                    No supporting clause was found in the provided documents.
                  </p>

                  <div className="philosophy-callout-box">
                    <span className="philosophy-tag">PRODUCT PRINCIPLE: VERIFIABILITY &gt; FLUENCY</span>
                    <p className="philosophy-text">
                      The system strictly abstains from fabricating liquidated damages percentages, escrow
                      deposit penalties, or statutory terms when contractual evidence is absent.
                      <br /><br />
                      No escrow liquidated damages covenant exists within DOC-006 (Cloud MSA), DOC-007 (DPA),
                      or DOC-008 (SLA). Rather than hallucinating a plausible answer, HNX Legal Intelligence
                      safeguards legal integrity through calibrated abstention.
                    </p>
                  </div>
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
        >
          <div
            className="source-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="source-modal-header">
              <div className="source-title-meta">
                <h3 className="source-doc-heading">
                  {activeSourceModal.docTitle} ({activeSourceModal.docId})
                </h3>
                <span className="source-sub-hash">
                  {activeSourceModal.section} · HASH VERIFIED · {selectedJurisdiction} GOVERNED
                </span>
              </div>
              <button
                className="source-close-btn"
                onClick={() => setActiveSourceModal(null)}
              >
                Close ✕
              </button>
            </div>

            <div className="source-modal-body">
              <div className="sidebar-title">FULL SECTION CONTENT</div>
              <div className="source-full-clause">
                <p>{activeSourceModal.fullClause}</p>
              </div>

              <div className="sidebar-title">SUPPORTING EVIDENCE CLAUSE HIGHLIGHT</div>
              <div className="source-clause-highlight">
                <mark>{activeSourceModal.highlight}</mark>
              </div>

              <div style={{ marginTop: "24px", fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                Direct cryptographic trace linked to query grounding audit log.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
