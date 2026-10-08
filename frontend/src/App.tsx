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
    }, 350)
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
            className={`nav-link ${stage === "hero" ? "nav-link-active" : ""}`}
            onClick={() => setStage("hero")}
          >
            THE EVIDENCE DESK
          </button>
          <button
            type="button"
            className={`nav-link ${stage === "analysis" ? "nav-link-active" : ""}`}
            onClick={() => {
              setStage("analysis")
              handleSelectPreset("grounded")
            }}
          >
            ANALYSIS ENGINE
          </button>
          <button
            type="button"
            className="nav-cta-btn"
            onClick={() => setStage(stage === "hero" ? "upload" : "hero")}
          >
            {stage === "hero" ? "START ANALYSIS" : "RETURN TO DESK"}
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
                <span className="category-text">VERIFIABILITY &gt; FLUENCY</span>
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
                Legal intelligence strictly grounded in authoritative contractual evidence.
                Every conclusion traces directly to a verified clause — calibrated to abstain
                when evidence is insufficient.
              </p>

              <div className="hero-cta-group">
                <button
                  type="button"
                  className="hero-primary-cta"
                  onClick={() => setStage("upload")}
                  id="hero-cta-button"
                  aria-label="Start with your documents"
                >
                  <span>Start with your documents</span>
                  <ArrowRightIcon className="arrow" />
                </button>
                <div className="hero-format-pill">
                  <span>ACCEPTED FORMATS</span>
                  <span className="formats">PDF · DOCX · TXT</span>
                </div>
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
              onClick={() => alert("Verification Demonstration: 3 authoritative legal contracts are already pre-loaded into the active index.")}
              role="button"
              tabIndex={0}
              aria-label="Upload document dropzone"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  alert("Verification Demonstration: 3 authoritative legal contracts are already pre-loaded into the active index.")
                }
              }}
            >
              <UploadCloudIcon className="dropzone-icon" />
              <div className="dropzone-title">Drop PDF / DOCX / TXT here</div>
              <div className="dropzone-hint">Or click to inspect and append contractual files from storage</div>
            </div>

            {/* Uploaded Documents List */}
            <div className="uploaded-docs-section">
              <div className="section-label-header">
                <span className="section-label-mono">INDEXED CONTRACTUAL ARTIFACTS</span>
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
                    <span className="doc-status-verified">
                      <CheckIcon className="check-svg" />
                      <span>{doc.status}</span>
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

                {/* Preset Chips for the 2 Demo Scenarios */}
                <div className="query-preset-chips" role="group" aria-label="Test Demo Inquiries">
                  <button
                    type="button"
                    className={`preset-chip-btn ${queryMode === "grounded" ? "active" : ""}`}
                    onClick={() => handleSelectPreset("grounded")}
                  >
                    Demo 1: Patent Infringement Carveout (§ 7.1 vs § 7.2)
                  </button>
                  <button
                    type="button"
                    className={`preset-chip-btn ${queryMode === "insufficient" ? "active" : ""}`}
                    onClick={() => handleSelectPreset("insufficient")}
                  >
                    Demo 2: Escrow Liquidated Damages (Calibrated Abstention)
                  </button>
                </div>

                <div className="query-input-row">
                  <input
                    type="text"
                    className="query-text-input"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    aria-label="Legal Inquiry Input"
                  />
                  <button
                    type="button"
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
                <article className="results-card" aria-label="Document-Grounded Answer">
                  <header className="answer-header-row">
                    <span className="answer-section-tag">
                      <ShieldCheckIcon className="tag-svg" />
                      DOCUMENT-GROUNDED ANSWER
                    </span>
                    <span className="evidence-badge-verified">
                      <CheckIcon className="check-svg" />
                      100% EVIDENCE SUPPORTED
                    </span>
                  </header>

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
                  <div className="evidence-chain-connector" aria-label="Evidence hierarchy link">
                    <div className="chain-line" />
                    <span className="chain-badge">SUPPORTED BY EXACT EVIDENCE</span>
                    <div className="chain-line" />
                  </div>

                  {/* Evidence Cards */}
                  <div className="evidence-cards-container">
                    {/* Evidence Card 1 */}
                    <div className="evidence-card">
                      <div className="evidence-meta-row">
                        <div className="evidence-doc-pill">
                          <span className="doc-num">DOC-006</span>
                          <span className="sep">·</span>
                          <span className="doc-title-part">Cloud Master Services Agreement</span>
                          <span className="sep">·</span>
                          <span className="evidence-clause-tag">§ 7.1</span>
                        </div>
                        <span className="evidence-type-badge">Primary Indemnification</span>
                      </div>
                      <blockquote className="evidence-excerpt-quote">
                        "Vendor shall defend and indemnify Customer against third-party claims alleging
                        that the Cloud Services infringe any patent, copyright, or trademark..."
                      </blockquote>
                      <button
                        type="button"
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
                        <ExternalSourceIcon className="source-svg" />
                        <span>View source clause</span>
                      </button>
                    </div>

                    {/* Evidence Card 2 */}
                    <div className="evidence-card">
                      <div className="evidence-meta-row">
                        <div className="evidence-doc-pill">
                          <span className="doc-num">DOC-006</span>
                          <span className="sep">·</span>
                          <span className="doc-title-part">Cloud Master Services Agreement</span>
                          <span className="sep">·</span>
                          <span className="evidence-clause-tag">§ 7.2(ii)</span>
                        </div>
                        <span className="evidence-type-badge carveout">Carveout Exception</span>
                      </div>
                      <blockquote className="evidence-excerpt-quote">
                        "This obligation shall not apply to claims arising from modifications to the Service
                        made by Customer or any third party not authorized by Vendor..."
                      </blockquote>
                      <button
                        type="button"
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
                        <ExternalSourceIcon className="source-svg" />
                        <span>View source clause</span>
                      </button>
                    </div>
                  </div>
                </article>
              )}

              {/* DEMO STATE 2: Insufficient Evidence Demonstration State */}
              {queryMode === "insufficient" && !isAnalyzing && (
                <article className="insufficient-evidence-box" aria-label="Calibrated Abstention Notice">
                  <div className="insufficient-header-badge">
                    <AlertTriangleIcon className="alert-svg" />
                    <span>INSUFFICIENT EVIDENCE</span>
                  </div>
                  <h3 className="insufficient-title">
                    The provided documents do not contain enough information to determine this.
                  </h3>
                  <p className="insufficient-body">
                    No supporting clause was found in the provided documents.
                  </p>

                  <div className="philosophy-callout-box">
                    <div className="philosophy-tag-row">
                      <ShieldCheckIcon className="shield-svg" />
                      <span className="philosophy-tag">PRODUCT PHILOSOPHY: VERIFIABILITY &gt; FLUENCY</span>
                    </div>
                    <p className="philosophy-text">
                      The system strictly abstains from synthesizing speculative liquidated damages clauses,
                      escrow deposit timelines, or penalty figures when verifiable evidence is absent.
                      <br /><br />
                      No source code escrow covenant exists within DOC-006 (Cloud MSA), DOC-007 (DPA),
                      or DOC-008 (SLA). Rather than hallucinating a plausible answer, HNX Legal Intelligence
                      safeguards judicial and corporate diligence through calibrated abstention.
                    </p>
                  </div>
                </article>
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
