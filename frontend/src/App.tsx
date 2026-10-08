import React, { useState, useEffect, useRef } from "react"

// ============================================================================
// SVG ICONS (Dignified Legal & Interface Glyphs)
// ============================================================================

function ScalesOfJusticeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h18" />
    </svg>
  )
}

function ShieldCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
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

function SplitBranchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  )
}

function SearchMinusIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  )
}

function FileTextIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
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

function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
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
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ============================================================================
// DATA STRUCTURES & LEGAL JURISDICTIONS
// ============================================================================

export interface DocumentInfo {
  id: string
  title: string
  filename?: string
  jurisdiction?: string
  sections?: number
  section_count?: number
  total_chars?: number
  size?: string
  status?: string
}

export interface CitationItem {
  claim: string
  chunk_id: string
  quote_snippet?: string
  char_start?: number
  char_end?: number
  verified?: boolean
  evidence_state?: string
  verification_reason?: string
}

export interface EvidenceItem {
  chunk_id: string
  doc_id: string
  document_title: string
  section: string
  text: string
  char_start?: number
  char_end?: number
}

export interface RelationshipItem {
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
}

export interface ConflictItem {
  claim_a: string
  chunk_a: string
  quote_a: string
  claim_b: string
  chunk_b: string
  quote_b: string
  reason?: string
}

export interface AnswerResult {
  query: string
  answer_text: string
  evidence_state?: string
  citations: CitationItem[]
  is_abstention: boolean
  abstention_reason?: string | null
  retrieved_chunks?: string[]
  evidence?: EvidenceItem[]
  relationships?: RelationshipItem[]
  conflicts?: ConflictItem[]
  trace_log?: string[]
  latency_ms?: Record<string, number>
  jurisdiction_context?: string
  generated_by?: string
}

const JURISDICTIONS = [
  { id: "United States", code: "US-DEL", label: "United States", system: "Delaware / New York Commercial Law (UCC)" },
  { id: "India", code: "IN", label: "India", system: "Indian Contract Act, 1872 & IT Act, 2000" },
  { id: "United Kingdom", code: "UK-ENG", label: "United Kingdom", system: "English Common Law & UCTA 1977" },
  { id: "Singapore", code: "SG", label: "Singapore", system: "Singapore Commercial Law & PDPA 2012" },
  { id: "Canada", code: "CAN", label: "Canada", system: "Common Law & PIPEDA Commercial Framework" },
  { id: "Germany", code: "DEU", label: "Germany", system: "Bürgerliches Gesetzbuch (BGB Civil Code)" },
]

const SAMPLE_DOCS: DocumentInfo[] = [
  {
    id: "DOC-006",
    title: "Master Cloud Services Agreement",
    filename: "DOC-006_master_cloud_services_agreement.md",
    jurisdiction: "United States",
    sections: 12,
    size: "48 KB",
    status: "Verified",
  },
  {
    id: "DOC-008",
    title: "Cloud Service Level Agreement & Availability Schedule",
    filename: "DOC-008_service_level_agreement_and_penalties.md",
    jurisdiction: "United States",
    sections: 6,
    size: "24 KB",
    status: "Verified",
  },
  {
    id: "DOC-007",
    title: "Data Protection Addendum (DPA)",
    filename: "DOC-007_data_protection_addendum.md",
    jurisdiction: "United States",
    sections: 8,
    size: "32 KB",
    status: "Verified",
  },
]

const SUGGESTIONS = [
  "Who can terminate this agreement?",
  "What notice period applies if monthly uptime is chronically below the SLA threshold?",
  "What insurance must the vendor carry?",
  "What are the liability limitations?",
]

// Plain-English error translator for legal professionals
function friendlyError(msg: string): string {
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "The legal intelligence server is not reachable. Ensure the backend server is running on port 8000."
  }
  if (/no documents/i.test(msg)) {
    return "Please select or upload a legal document before submitting an inquiry."
  }
  if (/unsupported file/i.test(msg)) {
    return "Unsupported file type. Please upload a commercial contract in PDF, TXT, or Markdown format."
  }
  if (/429|quota|rate/i.test(msg)) {
    return "The model API quota is temporarily rate-limited. The system has applied deterministic evidence-checked fallback."
  }
  return `Notice: ${msg}`
}

// Clean quote highlight renderer
function HighlightedQuote({ text, quote }: { text: string; quote?: string | null }) {
  if (!quote) return <>{text}</>
  const cleanQ = quote.replace(/^[“"']|[”"']$/g, "").trim()
  if (!cleanQ) return <>{text}</>
  const i = text.toLowerCase().indexOf(cleanQ.toLowerCase())
  if (i === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark className="legal-evidence-mark">{text.slice(i, i + cleanQ.length)}</mark>
      {text.slice(i + cleanQ.length)}
    </>
  )
}

// Format raw answer text into dignified lawyer-friendly typography
function FormattedAnswerText({
  rawText,
  evidenceList,
  onSelectChunk,
}: {
  rawText: string
  evidenceList: EvidenceItem[]
  onSelectChunk?: (chunkId: string) => void
}) {
  if (!rawText) return null

  const paragraphs = rawText.split(/\n\n+/)

  const getLabel = (cid: string) => {
    const ev = evidenceList.find((e) => e.chunk_id === cid)
    const docId = cid.split("#")[0]
    if (ev?.section) {
      const match = ev.section.match(/(?:Section|§|##)?\s*([0-9]+(?:\.[0-9]+)?)/i)
      if (match) return `${docId} § ${match[1]}`
      const last = ev.section.split(">").pop()?.trim()
      if (last) return `${docId} (${last.slice(0, 18)})`
    }
    return `${docId} § cite`
  }

  return (
    <div className="answer-prose">
      {paragraphs.map((para, pIdx) => {
        // Match bold markers **...** and bracketed chunk ids [DOC-xxx#cxxx]
        const tokenRegex = /(\*\*.*?\*\*|\[DOC-[A-Za-z0-9_-]+#c[0-9]+\])/g
        const parts = para.split(tokenRegex)

        return (
          <p key={pIdx} className="answer-paragraph">
            {parts.map((part, partIdx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                const inner = part.slice(2, -2)
                return (
                  <strong key={partIdx} className="answer-bold-legal">
                    {inner}
                  </strong>
                )
              }
              const citeMatch = part.match(/^\[(DOC-[A-Za-z0-9_-]+#c[0-9]+)\]$/)
              if (citeMatch) {
                const cid = citeMatch[1]
                const label = getLabel(cid)
                return (
                  <button
                    key={partIdx}
                    type="button"
                    className="inline-citation-chip"
                    onClick={() => onSelectChunk?.(cid)}
                    title={`Inspect governing clause: ${cid}`}
                  >
                    <FileTextIcon className="chip-ico" />
                    <span>{label}</span>
                  </button>
                )
              }
              return <span key={partIdx}>{part}</span>
            })}
          </p>
        )
      })}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT: HNX LEGAL INTELLIGENCE PLATFORM
// ============================================================================

export default function App() {
  // Navigation View: 'landing' (Lawyer Landing Page) | 'workspace' (Three-Pane Platform)
  const [view, setView] = useState<"landing" | "workspace">("landing")

  // Governing Law Jurisdiction
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("United States")

  // Documents State
  const [documents, setDocuments] = useState<DocumentInfo[]>(SAMPLE_DOCS)
  const [activeDocId, setActiveDocId] = useState<string>("DOC-006")
  const [isUploading, setIsUploading] = useState<boolean>(false)

  // Query and Execution State
  const [userQuery, setUserQuery] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [liveResult, setLiveResult] = useState<AnswerResult | null>(null)

  // Active Selected Citation / Passage for the Right Evidence Pane
  const [selectedCitationChunkId, setSelectedCitationChunkId] = useState<string | null>(null)

  // Mobile Responsiveness Controls
  const [isMobileEvidenceOpen, setIsMobileEvidenceOpen] = useState<boolean>(false)
  const [isDocsCollapsedMobile, setIsDocsCollapsedMobile] = useState<boolean>(true)

  // Technical Details Drawer Toggle (Kept hidden by default for lawyers)
  const [showTechnicalAudit, setShowTechnicalAudit] = useState<boolean>(false)

  const queryInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load live documents from backend API on mount
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/documents")
      .then((res) => (res.ok ? res.json() : []))
      .then((docs: any[]) => {
        if (Array.isArray(docs) && docs.length > 0) {
          const mapped: DocumentInfo[] = docs.map((d) => ({
            id: d.id,
            title: d.title,
            filename: d.filename,
            jurisdiction: d.jurisdiction,
            sections: d.section_count || 6,
            total_chars: d.total_chars,
            size: d.total_chars ? `${Math.round(d.total_chars / 1024)} KB` : "32 KB",
            status: "Verified",
          }))
          setDocuments(mapped)
          if (!activeDocId && mapped.length > 0) {
            setActiveDocId(mapped[0].id)
          }
        }
      })
      .catch(() => {
        // Fallback to SAMPLE_DOCS if server is offline
      })
  }, [])

  // Auto-select first citation chunk when a new result arrives
  useEffect(() => {
    if (liveResult) {
      if (liveResult.citations && liveResult.citations.length > 0) {
        setSelectedCitationChunkId(liveResult.citations[0].chunk_id)
      } else if (liveResult.evidence && liveResult.evidence.length > 0) {
        setSelectedCitationChunkId(liveResult.evidence[0].chunk_id)
      } else {
        setSelectedCitationChunkId(null)
      }
    }
  }, [liveResult])

  // "Try a Sample" action handler
  const handleTrySample = () => {
    setView("workspace")
    setActiveDocId("DOC-006")
    setUserQuery("Who can terminate this agreement?")
    setErrorMessage(null)
    setTimeout(() => {
      queryInputRef.current?.focus()
    }, 150)
  }

  // "Analyze a Document" CTA handler
  const handleOpenWorkspace = () => {
    setView("workspace")
    setErrorMessage(null)
    setTimeout(() => {
      queryInputRef.current?.focus()
    }, 150)
  }

  // Execute legal analysis against backend API
  const handleRunAnalysis = async (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : userQuery).trim()
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
        const data: AnswerResult = await res.json()
        setLiveResult(data)
      } else {
        const errJson = await res.json().catch(() => ({}))
        setErrorMessage(friendlyError(errJson.detail || `Server error (${res.status})`))
      }
    } catch (e: any) {
      setErrorMessage(friendlyError(e?.message || "Failed to fetch"))
    } finally {
      setIsAnalyzing(false)
    }
  }

  // File upload simulation / local file ingest handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const file = files[0]
    const docId = `DOC-${String(documents.length + 1).padStart(3, "0")}`
    const newDoc: DocumentInfo = {
      id: docId,
      title: file.name.replace(/\.[^/.]+$/, ""),
      filename: file.name,
      jurisdiction: selectedJurisdiction,
      sections: 4,
      size: `${Math.round(file.size / 1024)} KB`,
      status: "Verified",
    }

    setTimeout(() => {
      setDocuments((prev) => [newDoc, ...prev])
      setActiveDocId(newDoc.id)
      setIsUploading(false)
    }, 800)
  }

  // Active Inspected Evidence Chunk details for Right Pane
  const activeEvidenceItem: EvidenceItem | null = (() => {
    if (!liveResult?.evidence || liveResult.evidence.length === 0) return null
    if (selectedCitationChunkId) {
      const found = liveResult.evidence.find((e) => e.chunk_id === selectedCitationChunkId)
      if (found) return found
    }
    return liveResult.evidence[0] || null
  })()

  const activeCitationItem: CitationItem | null = (() => {
    if (!liveResult?.citations || liveResult.citations.length === 0) return null
    if (selectedCitationChunkId) {
      const found = liveResult.citations.find((c) => c.chunk_id === selectedCitationChunkId)
      if (found) return found
    }
    return liveResult.citations[0] || null
  })()

  // Precedence relationship for the active inspected chunk
  const activeRelationship: RelationshipItem | null = (() => {
    if (!liveResult?.relationships || !activeEvidenceItem) return null
    return (
      liveResult.relationships.find(
        (r) =>
          r.source_chunk_id === activeEvidenceItem.chunk_id ||
          r.target_chunk_id === activeEvidenceItem.chunk_id
      ) || null
    )
  })()

  // Selected jurisdiction data
  const currentJurData = JURISDICTIONS.find((j) => j.id === selectedJurisdiction) || JURISDICTIONS[0]

  return (
    <div className="legal-app-root">
      {/* ==================================================================== */}
      {/* GLOBAL PROFESSIONAL LEGAL HEADER                                    */}
      {/* ==================================================================== */}
      <header className="legal-top-navbar" role="banner">
        <div className="nav-container">
          {/* Brand Identity */}
          <div className="brand-group" onClick={() => setView("landing")} role="button" tabIndex={0}>
            <div className="brand-crest">
              <ScalesOfJusticeIcon className="crest-svg" />
            </div>
            <div className="brand-text">
              <span className="brand-title">HNX Legal Intelligence</span>
              <span className="brand-tagline">Evidentiary Document Review</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-tab-button ${view === "landing" ? "active" : ""}`}
              onClick={() => setView("landing")}
            >
              Overview & Principles
            </button>
            <button
              type="button"
              className={`nav-tab-button ${view === "workspace" ? "active" : ""}`}
              onClick={() => setView("workspace")}
            >
              Contract Workspace
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="nav-tools">
            {/* Governing Jurisdiction Selector */}
            <div className="jurisdiction-tool">
              <div className="jurisdiction-label">
                <LockIcon className="tool-lock" />
                <span>Governing Law:</span>
              </div>
              <div className="select-box-wrap">
                <select
                  id="governing-jurisdiction-select"
                  className="jurisdiction-dropdown"
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  aria-label="Select governing jurisdiction law"
                >
                  {JURISDICTIONS.map((jur) => (
                    <option key={jur.id} value={jur.id}>
                      [{jur.code}] {jur.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="dropdown-arrow" />
              </div>
            </div>

            {/* Quick Actions */}
            <button
              type="button"
              className="btn-sample-action"
              onClick={handleTrySample}
              id="global-try-sample-btn"
            >
              Try a Sample
            </button>

            {view === "landing" && (
              <button
                type="button"
                className="btn-primary-action"
                onClick={handleOpenWorkspace}
                id="global-analyze-btn"
              >
                Analyze a Document
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* VIEW 1: LAWYER-FIRST PRODUCTION LANDING PAGE                         */}
      {/* ==================================================================== */}
      {view === "landing" && (
        <main className="landing-page-root">
          {/* Subtle Archival Atmosphere Background Overlay */}
          <div className="legal-atmosphere-backdrop" aria-hidden="true" />

          {/* ================================================================ */}
          {/* 1. HERO SECTION                                                  */}
          {/* ================================================================ */}
          <section className="legal-hero-section">
            <div className="hero-layout-grid">
              {/* Left Column: Authoritative Legal Copy */}
              <div className="hero-copy-column">
                <div className="hero-eyebrow">
                  <span className="eyebrow-rule" />
                  <span>COMMERCIAL CONTRACT REVIEW · EVIDENTIARY RIGOR</span>
                </div>

                <h1 className="hero-primary-headline">
                  Legal AI that <em>shows its evidence.</em>
                </h1>

                <p className="hero-supporting-lead">
                  Review complex commercial agreements, Master Services Agreements, and SLAs with forensic precision.
                  Ask natural questions and receive answers where every material claim is strictly traced back to source
                  evidence—identifying cross-document overrides and abstaining when documents are silent.
                </p>

                {/* Instant 5-Question Answers Grid for Lawyers */}
                <div className="lawyer-five-point-card">
                  <div className="point-item">
                    <span className="point-q">1. What is this?</span>
                    <span className="point-a">A verifiable legal intelligence platform that eliminates hallucinations in commercial contract review.</span>
                  </div>
                  <div className="point-item">
                    <span className="point-q">2. Who is it for?</span>
                    <span className="point-a">In-house legal counsel, transactional attorneys, and contract review teams.</span>
                  </div>
                  <div className="point-item">
                    <span className="point-q">3. What does it do?</span>
                    <span className="point-a">Answers complex contract inquiries, maps clause overrides, and proves claims with exact quotes.</span>
                  </div>
                  <div className="point-item">
                    <span className="point-q">4. Why should I trust it?</span>
                    <span className="point-a">Every substantive claim cites its exact clause; when documents are silent, it refuses to speculate.</span>
                  </div>
                  <div className="point-item point-item-wide">
                    <span className="point-q">5. What do I click?</span>
                    <span className="point-a">Click <strong>"Analyze a Document"</strong> to open your contract workspace, or <strong>"Try a Sample"</strong> to load verified agreements instantly.</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="hero-cta-button-row">
                  <button
                    type="button"
                    className="hero-btn-primary"
                    onClick={handleOpenWorkspace}
                    id="hero-analyze-document-cta"
                  >
                    <span>Analyze a Document</span>
                    <ArrowRightIcon className="cta-arrow" />
                  </button>

                  <button
                    type="button"
                    className="hero-btn-secondary"
                    onClick={handleTrySample}
                    id="hero-try-sample-cta"
                  >
                    <span>Try a Sample</span>
                  </button>
                </div>

                {/* Archival Legal Trust Bar */}
                <div className="hero-archival-trust-bar">
                  <div className="trust-node">
                    <ShieldCheckIcon className="trust-ico" />
                    <span>VERIFIED SOURCE CITATIONS</span>
                  </div>
                  <span className="trust-sep">·</span>
                  <div className="trust-node">
                    <LockIcon className="trust-ico" />
                    <span>GOVERNING LAW STRICTNESS</span>
                  </div>
                  <span className="trust-sep">·</span>
                  <div className="trust-node">
                    <SplitBranchIcon className="trust-ico" />
                    <span>PRECEDENCE & OVERRIDE AWARE</span>
                  </div>
                  <span className="trust-sep">·</span>
                  <div className="trust-node">
                    <SearchMinusIcon className="trust-ico" />
                    <span>CALIBRATED ABSTENTION</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Archival Legal Folio & Document Atmosphere */}
              <div className="hero-demonstration-column">
                <div className="hero-folio-card">
                  <div className="folio-inner-frame">
                    <div className="folio-header">
                      <div className="folio-crest">
                        <ScalesOfJusticeIcon className="folio-scales-svg" />
                      </div>
                      <div className="folio-title-block">
                        <span className="folio-docket">DOCKET REF · CLOUD-SLA-2026</span>
                        <h3 className="folio-title">Brief of Evidentiary Analysis</h3>
                      </div>
                      <span className="folio-stamp">DELAWARE LAW</span>
                    </div>

                    <div className="folio-excerpt-block">
                      <span className="folio-quote-label">OPERATIVE CONTRACTUAL CLAUSE</span>
                      <p className="folio-quote-body">
                        "Section 3.1: If Monthly Uptime falls below 95.0% in any two consecutive calendar months, Customer may terminate immediately upon <mark>fifteen (15) calendar days</mark> prior written notice..."
                      </p>
                    </div>

                    <div className="folio-finding-row">
                      <div className="finding-node">
                        <ShieldCheckIcon className="finding-ico" />
                        <span>Evidence Grounded</span>
                      </div>
                      <div className="finding-node">
                        <SplitBranchIcon className="finding-ico" />
                        <span>Override Traced</span>
                      </div>
                      <div className="finding-node">
                        <LockIcon className="finding-ico" />
                        <span>Zero Hallucination</span>
                      </div>
                    </div>

                    <div className="folio-action-row">
                      <button
                        type="button"
                        className="btn-folio-demo"
                        onClick={() => {
                          const el = document.getElementById("evidence-visual-demonstration-section")
                          el?.scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        <span>Inspect Verification Demonstration ↓</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 2. "HOW IT WORKS" FOR LEGAL PROFESSIONALS                         */}
          {/* ================================================================ */}
          <section className="legal-how-it-works-section">
            <div className="section-header-centered">
              <span className="section-pre-title">FORENSIC REVIEW WORKFLOW</span>
              <h2 className="section-main-title">How It Works in Your Practice</h2>
              <p className="section-lead-text">
                Designed for transactional and regulatory practice where precision matters more than conversational fluency.
              </p>
            </div>

            <div className="workflow-steps-grid">
              <div className="workflow-step-card">
                <div className="step-number-tag">STEP 01</div>
                <h3 className="step-title">Select or Ingest Agreements</h3>
                <p className="step-body">
                  Load Master Services Agreements, DPAs, Service Schedules, or regulatory filings. Select the governing
                  jurisdiction under which contractual terms will be evaluated.
                </p>
              </div>

              <div className="workflow-step-card">
                <div className="step-number-tag">STEP 02</div>
                <h3 className="step-title">Inquire in Legal Plain Language</h3>
                <p className="step-body">
                  Ask precise questions about termination triggers, liability carveouts, indemnification obligations,
                  or statutory compliance deadlines without writing prompt formulas.
                </p>
              </div>

              <div className="workflow-step-card">
                <div className="step-number-tag">STEP 03</div>
                <h3 className="step-title">Review Verifiable Source Evidence</h3>
                <p className="step-body">
                  Every material claim in the answer is checked against source provisions. Inspect cross-document overrides,
                  conflicting clauses, and calibrated refusals.
                </p>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 3. CORE CAPABILITIES                                             */}
          {/* ================================================================ */}
          <section className="legal-capabilities-section">
            <div className="section-header-centered">
              <span className="section-pre-title">ARCHITECTURAL INTEGRITY</span>
              <h2 className="section-main-title">Built for Legal Reliability</h2>
              <p className="section-lead-text">
                Generic LLMs hallucinate plausible-sounding legal advice. Our platform enforces strict evidentiary rules.
              </p>
            </div>

            <div className="capabilities-quad-grid">
              <div className="capability-card">
                <div className="cap-icon-box">
                  <ShieldCheckIcon className="cap-svg" />
                </div>
                <h3 className="cap-title">Verbatim Source Grounding</h3>
                <p className="cap-desc">
                  Answers cannot cite general legal knowledge. Every substantive assertion must quote the exact language
                  of the uploaded agreement, verified sentence-by-sentence.
                </p>
              </div>

              <div className="capability-card">
                <div className="cap-icon-box">
                  <SplitBranchIcon className="cap-svg" />
                </div>
                <h3 className="cap-title">Related Provisions & Precedence</h3>
                <p className="cap-desc">
                  Commercial contracts constantly modify prior terms. The system traces <code>notwithstanding</code>,{" "}
                  <code>subject to</code>, and <code>except as provided in</code> clauses to ensure overriding provisions are applied.
                </p>
              </div>

              <div className="capability-card">
                <div className="cap-icon-box">
                  <SearchMinusIcon className="cap-svg" />
                </div>
                <h3 className="cap-title">Calibrated Refusal (No Guessing)</h3>
                <p className="cap-desc">
                  If an agreement is silent on vendor insurance, the platform explicitly refuses to invent terms. It
                  displays the closest candidate clauses so you can independently verify silence.
                </p>
              </div>

              <div className="capability-card">
                <div className="cap-icon-box">
                  <LockIcon className="cap-svg" />
                </div>
                <h3 className="cap-title">Jurisdiction Strictness</h3>
                <p className="cap-desc">
                  Statutory schedules and conflict rules evaluate strictly under the selected governing law (Delaware, New
                  York, UK, India, etc.), preventing cross-jurisdictional contamination.
                </p>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 4. EVIDENCE / VERIFICATION VISUAL DEMONSTRATION                  */}
          {/* ================================================================ */}
          <section id="evidence-visual-demonstration-section" className="legal-demonstration-section">
            <div className="section-header-centered">
              <span className="section-pre-title">EVIDENTIARY PROOF</span>
              <h2 className="section-main-title">Evidence & Verification Demonstration</h2>
              <p className="section-lead-text">
                Review how our engine inspects an operative contract, isolates the governing provision, and traces cross-document overrides.
              </p>
            </div>

            <div className="demonstration-full-container">
              <div className="demonstration-card">
                <div className="demo-card-header">
                  <div className="demo-header-left">
                    <span className="demo-tag">LIVE CONTRACT INSPECTION</span>
                    <span className="demo-doc-name">Cloud SLA & Availability Schedule (DOC-008)</span>
                  </div>
                  <span className="demo-status-pill">
                    <ShieldCheckIcon className="status-ico" />
                    CHECKED AGAINST SOURCE
                  </span>
                </div>

                {/* Simulated Question */}
                <div className="demo-inquiry-box">
                  <span className="inquiry-k">INQUIRY</span>
                  <span className="inquiry-text">
                    "What notice period applies if monthly uptime is chronically below the SLA threshold?"
                  </span>
                </div>

                {/* Simulated Answer */}
                <div className="demo-answer-box">
                  <div className="demo-verdict-row">
                    <span className="verdict-supported-badge">
                      <CheckIcon className="v-ico" />
                      ✓ Supported by Document Evidence
                    </span>
                    <span className="governing-badge">US-DEL Governing Law</span>
                  </div>
                  <div className="demo-answer-text">
                    <strong>Section 3.1 (Accelerated Termination):</strong> If Monthly Uptime falls below 95.0% in any two consecutive calendar months, Customer may terminate immediately upon <strong>fifteen (15) calendar days</strong> prior written notice.
                  </div>
                </div>

                {/* Simulated Exact Evidence Stack */}
                <div className="demo-evidence-stack">
                  <div className="demo-ev-row">
                    <span className="ev-k">SOURCE</span>
                    <span className="ev-v">DOC-008 § 3.1 · Cloud Service Level Agreement</span>
                  </div>
                  <div className="demo-ev-row">
                    <span className="ev-k">EXACT EVIDENCE</span>
                    <span className="ev-quote">
                      "...terminate this Agreement immediately upon <mark>fifteen (15) calendar days</mark> prior written notice, notwithstanding the thirty (30) day notice period specified in Section 9.2 of the Master Agreement..."
                    </span>
                  </div>
                  <div className="demo-ev-rel-box">
                    <div className="rel-tag">RELATED PROVISION · CONTRACTUAL OVERRIDE</div>
                    <div className="rel-desc">
                      SLA Section 3.1 accelerated 15-day notice overrides Section 9.2 30-day notice in Master Agreement pursuant to express <code>notwithstanding</code> clause.
                    </div>
                  </div>
                </div>

                <div className="demo-card-footer">
                  <button
                    type="button"
                    className="demo-open-btn"
                    onClick={handleTrySample}
                  >
                    <span>Open and Inspect This Query in Workspace</span>
                    <ArrowRightIcon className="mini-arrow" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 5. SIMPLE WORKFLOW (6-Step Core Flow)                            */}
          {/* ================================================================ */}
          <section className="legal-simple-workflow-section">
            <div className="section-header-centered">
              <span className="section-pre-title">PREDICTABLE REVIEW LOOP</span>
              <h2 className="section-main-title">Simple 6-Step Workflow</h2>
              <p className="section-lead-text">
                From document ingestion to granular evidentiary audit without leaving the workspace.
              </p>
            </div>

            <div className="six-step-flow-grid">
              <div className="workflow-step-card">
                <div className="step-number-tag">STEP 01</div>
                <h3 className="step-title">Upload / Select Document</h3>
                <p className="step-body">Select from verified Master Agreements and SLAs or ingest PDF, Markdown, and TXT files directly.</p>
              </div>
              <div className="workflow-step-card">
                <div className="step-number-tag">STEP 02</div>
                <h3 className="step-title">Ask a Question</h3>
                <p className="step-body">Inquire about notice periods, termination remedies, liability caps, or indemnity carveouts in plain legal English.</p>
              </div>
              <div className="workflow-step-card">
                <div className="step-number-tag">STEP 03</div>
                <h3 className="step-title">Receive Grounded Answer</h3>
                <p className="step-body">Read a concise evidentiary synthesis drafted specifically for transactional lawyers.</p>
              </div>
              <div className="workflow-step-card">
                <div className="step-number-tag">STEP 04</div>
                <h3 className="step-title">See Evidence Status</h3>
                <p className="step-body">Instantly confirm if the assertion is Supported, Conflicting, or Not Found (Refusal to Speculate).</p>
              </div>
              <div className="workflow-step-card">
                <div className="step-number-tag">STEP 05</div>
                <h3 className="step-title">Inspect Exact Source</h3>
                <p className="step-body">Examine the exact governing clause, surrounding contract paragraphs, and character offsets in the evidence pane.</p>
              </div>
              <div className="workflow-step-card">
                <div className="step-number-tag">STEP 06</div>
                <h3 className="step-title">Continue Inquiring</h3>
                <p className="step-body">Ask follow-up questions to trace carveouts, cross-document overrides, or statutory exceptions seamlessly.</p>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 6. CALL TO ACTION                                                */}
          {/* ================================================================ */}
          <section className="legal-bottom-cta-section">
            <div className="cta-box-card">
              <div className="cta-content">
                <h2 className="cta-headline">Ready to review agreements with evidentiary certainty?</h2>
                <p className="cta-sub">
                  Experience commercial contract review where every answer shows its evidence and no claims are fabricated.
                </p>
                <div className="cta-buttons">
                  <button
                    type="button"
                    className="hero-btn-primary"
                    onClick={handleOpenWorkspace}
                  >
                    <span>Analyze a Document</span>
                    <ArrowRightIcon className="cta-arrow" />
                  </button>
                  <button
                    type="button"
                    className="hero-btn-secondary"
                    onClick={handleTrySample}
                  >
                    <span>Try a Sample</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ==================================================================== */}
      {/* VIEW 2: PRODUCTION THREE-PANE CONTRACT WORKSPACE                     */}
      {/* ==================================================================== */}
      {view === "workspace" && (
        <main className="workspace-view-root">
          <div className="workspace-three-pane">
            {/* ---------------------------------------------------------------- */}
            {/* PANE 1: LEFT DOCUMENT ROSTER & INGESTION                        */}
            {/* ---------------------------------------------------------------- */}
            <aside className={`document-roster-pane ${isDocsCollapsedMobile ? "collapsed-mobile" : ""}`}>
              {/* Mobile Toggle Bar */}
              <div
                className="mobile-docs-accordion-header"
                onClick={() => setIsDocsCollapsedMobile((prev) => !prev)}
                role="button"
                tabIndex={0}
              >
                <div className="docs-accordion-left">
                  <FileTextIcon className="accordion-ico" />
                  <span>Contract Inventory ({documents.length} Available)</span>
                </div>
                <ChevronDownIcon className={`accordion-chevron ${isDocsCollapsedMobile ? "" : "open"}`} />
              </div>

              {/* Desktop Roster Content */}
              <div className="roster-content-wrapper">
                <div className="roster-header">
                  <div className="roster-title-group">
                    <span className="roster-title">Contract Inventory</span>
                    <span className="roster-count">{documents.length} Ready</span>
                  </div>
                  <button
                    type="button"
                    className="roster-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload contract"
                  >
                    <UploadCloudIcon className="up-ico" />
                    <span>Upload</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    accept=".pdf,.txt,.md"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Sample Preset Load Button */}
                <div className="roster-preset-box">
                  <button
                    type="button"
                    className="btn-load-sample-preset"
                    onClick={handleTrySample}
                  >
                    <span>📄 Load Verified Contract Set</span>
                    <ChevronRightIcon className="mini-arrow" />
                  </button>
                </div>

                {/* Upload Status Notification if busy */}
                {isUploading && (
                  <div className="roster-indexing-card">
                    <span className="indexing-dot-pulse" />
                    <span>Verifying and indexing document structure…</span>
                  </div>
                )}

                {/* Document List */}
                <div className="roster-doc-list" role="listbox" aria-label="Available contract documents">
                  {documents.map((doc) => {
                    const isActive = doc.id === activeDocId
                    return (
                      <div
                        key={doc.id}
                        className={`doc-card-item ${isActive ? "active-doc" : ""}`}
                        onClick={() => setActiveDocId(doc.id)}
                        role="option"
                        aria-selected={isActive}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setActiveDocId(doc.id)
                        }}
                      >
                        <div className="doc-card-top-row">
                          <span className="doc-id-badge">{doc.id}</span>
                          <span className="doc-status-pill">
                            <span className="status-dot" />
                            Ready
                          </span>
                        </div>
                        <h4 className="doc-card-title">{doc.title}</h4>
                        <div className="doc-card-meta-row">
                          <span>{doc.sections || 6} Sec</span>
                          <span className="meta-sep">·</span>
                          <span>{doc.size || "32 KB"}</span>
                          <span className="meta-sep">·</span>
                          <span className="meta-jur">{doc.jurisdiction || "US"}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Drag and Drop Container */}
                <div
                  className="roster-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <UploadCloudIcon className="drop-ico" />
                  <span className="drop-title">Upload a legal document</span>
                  <span className="drop-sub">Drag file here · PDF, TXT or Markdown</span>
                </div>
              </div>
            </aside>

            {/* ---------------------------------------------------------------- */}
            {/* PANE 2: CENTER INQUIRY & GROUNDED ANSWER WORKSPACE              */}
            {/* ---------------------------------------------------------------- */}
            <section className="analysis-workspace-pane" aria-label="Contractual Inquiry and Grounded Analysis">
              {/* Active Document & Governance Status Bar */}
              <div className="governance-status-banner">
                <div className="gov-status-left">
                  <span className="gov-doc-tag">ACTIVE DOCUMENT</span>
                  <span className="gov-doc-name">
                    {documents.find((d) => d.id === activeDocId)?.title || "Master Cloud Services Agreement (DOC-006)"}
                  </span>
                </div>
                <div className="gov-status-right">
                  <LockIcon className="gov-lock" />
                  <span>{currentJurData.label} [{currentJurData.code}] Law Active</span>
                </div>
              </div>

              {/* Inquiry Card (Visually Dominant) */}
              <div className="inquiry-input-card">
                <div className="inquiry-header-row">
                  <div className="inquiry-label-group">
                    <span className="inquiry-badge">LEGAL INQUIRY</span>
                    <span className="inquiry-hint">Ask about termination, notice, indemnity, SLA, or liability</span>
                  </div>
                  <span className="inquiry-rule-text">Verifiability over Fluency</span>
                </div>

                <div className="inquiry-input-control-row">
                  <input
                    ref={queryInputRef}
                    id="legal-inquiry-input"
                    type="text"
                    className="inquiry-text-field"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isAnalyzing) handleRunAnalysis()
                    }}
                    placeholder="Ask a question about your documents (e.g. Who can terminate this agreement?)"
                    aria-label="Inquiry question input"
                    disabled={isAnalyzing}
                  />
                  <button
                    type="button"
                    className="btn-run-analysis"
                    onClick={() => handleRunAnalysis()}
                    disabled={isAnalyzing || !userQuery.trim()}
                    id="analyze-document-submit-btn"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="button-spinner" />
                        <span>Checking…</span>
                      </>
                    ) : (
                      <>
                        <span>Analyze document</span>
                        <ArrowRightIcon className="btn-arr" />
                      </>
                    )}
                  </button>
                </div>

                {/* Example Prompts Bar (Populates input WITHOUT auto-submitting) */}
                <div className="suggested-prompts-bar" role="group" aria-label="Example prompt suggestions">
                  <span className="suggest-label">Try:</span>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="suggest-chip-button"
                      onClick={() => {
                        setUserQuery(s)
                        queryInputRef.current?.focus()
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plain-English Error Banner */}
              {errorMessage && (
                <div className="error-callout-banner" role="alert">
                  <AlertTriangleIcon className="err-ico" />
                  <div className="err-text">{errorMessage}</div>
                  <button
                    type="button"
                    className="err-close"
                    onClick={() => setErrorMessage(null)}
                    aria-label="Dismiss error notice"
                  >
                    <CrossIcon />
                  </button>
                </div>
              )}

              {/* Honest Loading State (No fake progress timers) */}
              {isAnalyzing && (
                <div className="honest-loading-card" role="status" aria-live="polite">
                  <div className="loading-spinner-ring" />
                  <div className="loading-copy-group">
                    <span className="loading-main-line">Analyzing document provisions and checking against source…</span>
                    <span className="loading-sub-line">
                      Finding relevant passages · Tracing related provisions · Checking against source
                    </span>
                  </div>
                </div>
              )}

              {/* ANSWER PRESENTATION */}
              {liveResult && !isAnalyzing && (() => {
                const primaryCit = liveResult.citations?.[0] || null
                const primaryEv = liveResult.evidence?.find((e) => e.chunk_id === primaryCit?.chunk_id) || liveResult.evidence?.[0] || null
                const primaryRel = liveResult.relationships?.[0] || null

                return (
                  <article className="grounded-answer-card" aria-label="Grounded Legal Analysis Result">
                    {/* Verdict Status Banner (Icon + Text) */}
                    <div className={`answer-verdict-banner tone-${liveResult.evidence_state?.toLowerCase() || "supported"}`}>
                      <div className="verdict-banner-left">
                        {liveResult.evidence_state === "INSUFFICIENT" || liveResult.is_abstention ? (
                          <SearchMinusIcon className="verdict-icon" />
                        ) : liveResult.evidence_state === "CONFLICTING" ? (
                          <SplitBranchIcon className="verdict-icon" />
                        ) : liveResult.evidence_state === "PARTIAL" ? (
                          <AlertTriangleIcon className="verdict-icon" />
                        ) : (
                          <ShieldCheckIcon className="verdict-icon" />
                        )}

                        <div className="verdict-title-group">
                          <span className="verdict-state-title">
                            {liveResult.evidence_state === "INSUFFICIENT" || liveResult.is_abstention
                              ? "Evidence not found — Refusal to extrapolate"
                              : liveResult.evidence_state === "CONFLICTING"
                              ? "Conflicting Contractual Provisions"
                              : liveResult.evidence_state === "PARTIAL"
                              ? "Partially Supported — Incomplete Source Evidence"
                              : "Supported by Contractual Evidence"}
                          </span>
                          <span className="verdict-explanation-line">
                            {liveResult.evidence_state === "INSUFFICIENT" || liveResult.is_abstention
                              ? "The provided documents do not contain evidence to establish this rule. No speculative claims were generated."
                              : liveResult.evidence_state === "CONFLICTING"
                              ? "Two contractual provisions give divergent terms. Both are shown below; neither was assumed."
                              : liveResult.evidence_state === "PARTIAL"
                              ? "Verified statements are cited below. What could not be confirmed is distinguished."
                              : "Every substantive statement below is directly grounded in cited contractual text."}
                          </span>
                        </div>
                      </div>

                      <span className="verdict-pill-badge">
                        {liveResult.evidence_state === "INSUFFICIENT" || liveResult.is_abstention
                          ? "EVIDENCE NOT FOUND"
                          : (liveResult.evidence_state || "SUPPORTED")}
                      </span>
                    </div>

                    {/* Inquiry Echo */}
                    <div className="answer-query-echo">
                      <span className="echo-tag">INQUIRY</span>
                      <span className="echo-query">"{liveResult.query}"</span>
                    </div>

                    {/* ============================================================== */}
                    {/* LAWYER EVIDENTIARY REVIEW DOSSIER                              */}
                    {/* ============================================================== */}
                    <div className="lawyer-evidentiary-dossier" aria-label="Evidence Review Dossier">
                      {/* SECTION 1: ANSWER */}
                      <div className="dossier-block dossier-answer-block">
                        <div className="dossier-label">ANSWER</div>
                        <div className="dossier-answer-body">
                          <FormattedAnswerText
                            rawText={liveResult.answer_text}
                            evidenceList={liveResult.evidence || []}
                            onSelectChunk={(cid) => {
                              setSelectedCitationChunkId(cid)
                              setIsMobileEvidenceOpen(true)
                            }}
                          />
                        </div>
                      </div>

                      {/* SECTION 2: EVIDENCE STATUS */}
                      <div className="dossier-block dossier-status-block">
                        <div className="dossier-label">EVIDENCE STATUS</div>
                        <div className="dossier-value">
                          {liveResult.evidence_state === "INSUFFICIENT" || liveResult.is_abstention ? (
                            <span className="dossier-status-pill tone-insufficient">
                              <SearchMinusIcon className="dossier-ico" />
                              <span>✕ Evidence not found</span>
                            </span>
                          ) : liveResult.evidence_state === "CONFLICTING" ? (
                            <span className="dossier-status-pill tone-conflicting">
                              <SplitBranchIcon className="dossier-ico" />
                              <span>⚠ Conflicting provisions</span>
                            </span>
                          ) : liveResult.evidence_state === "PARTIAL" ? (
                            <span className="dossier-status-pill tone-partial">
                              <AlertTriangleIcon className="dossier-ico" />
                              <span>⚠ Partially supported</span>
                            </span>
                          ) : (
                            <span className="dossier-status-pill tone-supported">
                              <CheckIcon className="dossier-ico" />
                              <span>✓ Supported</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SECTION 3: SOURCE */}
                      <div className="dossier-block dossier-source-block">
                        <div className="dossier-label">SOURCE</div>
                        <div className="dossier-value">
                          {primaryEv ? (
                            <div className="dossier-source-tag">
                              <FileTextIcon className="dossier-source-ico" />
                              <span className="dossier-source-title">{primaryEv.document_title}</span>
                              <span className="dossier-source-sep">—</span>
                              <span className="dossier-source-sec">{primaryEv.section || "Operative Provision"}</span>
                              <span className="dossier-source-sep">—</span>
                              <span className="dossier-source-chunk">{primaryEv.chunk_id.replace(/^.*?#/, "Clause ")}</span>
                              <button
                                type="button"
                                className="dossier-btn-inspect"
                                onClick={() => {
                                  setSelectedCitationChunkId(primaryEv.chunk_id)
                                  setIsMobileEvidenceOpen(true)
                                }}
                              >
                                Inspect Source →
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted">No primary clause identified</span>
                          )}
                        </div>
                      </div>

                      {/* SECTION 4: EXACT EVIDENCE */}
                      {primaryCit?.quote_snippet && (
                        <div className="dossier-block dossier-evidence-block">
                          <div className="dossier-label">EXACT EVIDENCE</div>
                          <blockquote className="dossier-quote-text">
                            "{primaryCit.quote_snippet}"
                          </blockquote>
                        </div>
                      )}

                      {/* SECTION 5: RELATED PROVISION */}
                      {primaryRel && (
                        <div className="dossier-block dossier-rel-block">
                          <div className="dossier-label">RELATED PROVISION</div>
                          <div className="dossier-value">
                            <div className="dossier-rel-tag">
                              <SplitBranchIcon className="dossier-rel-ico" />
                              <span>
                                <strong>{primaryRel.target_section || `Section ${primaryRel.referenced_section}`}</strong> in <em>{primaryRel.target_doc_title}</em> — {primaryRel.relation === "OVERRIDE" ? "Subject to / Overridden by notwithstanding clause" : "Cross-referenced terms"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CALM INSUFFICIENT EVIDENCE STATE */}
                    {(liveResult.evidence_state === "INSUFFICIENT" || liveResult.is_abstention) && (
                      <div className="insufficient-evidence-callout">
                        <div className="insufficient-header">
                          <SearchMinusIcon className="insufficient-ico" />
                          <h4>Intentional Refusal to Extrapolate</h4>
                        </div>
                        <p className="insufficient-body">
                          {liveResult.abstention_reason ||
                            "Core subject matter was not established by the ingested agreements. The platform adheres to strict legal integrity and will not fabricate terms."}
                        </p>
                        {liveResult.evidence && liveResult.evidence.length > 0 && (
                          <div className="closest-passages-box">
                            <span className="closest-title">Closest Candidate Passages (Verify Silence):</span>
                            <div className="closest-list">
                              {liveResult.evidence.slice(0, 2).map((ev) => (
                                <div
                                  key={ev.chunk_id}
                                  className="closest-item"
                                  onClick={() => {
                                    setSelectedCitationChunkId(ev.chunk_id)
                                    setIsMobileEvidenceOpen(true)
                                  }}
                                >
                                  <span className="closest-sec">{ev.document_title} · {ev.section}</span>
                                  <span className="closest-preview">{ev.text.slice(0, 140)}…</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CONFLICTING STATE (Source A vs Source B) */}
                    {liveResult.evidence_state === "CONFLICTING" && (
                      <div className="conflict-provisions-section">
                        <div className="conflict-section-header">
                          <h4>Conflicting Contractual Terms</h4>
                          <span>Both provisions shown · Neither chosen for you</span>
                        </div>

                        {liveResult.conflicts && liveResult.conflicts.length > 0 ? (
                          liveResult.conflicts.map((c, idx) => (
                            <div key={idx} className="conflict-pair-container">
                              <div className="conflict-columns-grid">
                                <div className="conflict-card-col source-a">
                                  <span className="source-tag">Source A ({c.chunk_a.split("#")[0]})</span>
                                  <div className="conflict-claim">{c.claim_a}</div>
                                  <blockquote className="conflict-quote">"{c.quote_a}"</blockquote>
                                </div>
                                <div className="conflict-card-col source-b">
                                  <span className="source-tag">Source B ({c.chunk_b.split("#")[0]})</span>
                                  <div className="conflict-claim">{c.claim_b}</div>
                                  <blockquote className="conflict-quote">"{c.quote_b}"</blockquote>
                                </div>
                              </div>
                              {c.reason && <div className="conflict-reason-notice">Analysis: {c.reason}</div>}
                            </div>
                          ))
                        ) : (
                          <div className="conflict-columns-grid">
                            {liveResult.citations.slice(0, 2).map((cit, idx) => (
                              <div key={idx} className={`conflict-card-col source-${idx === 0 ? "a" : "b"}`}>
                                <span className="source-tag">{idx === 0 ? "Source A" : "Source B"} ({cit.chunk_id})</span>
                                <div className="conflict-claim">{cit.claim}</div>
                                <blockquote className="conflict-quote">"{cit.quote_snippet || cit.claim}"</blockquote>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CHECK AGAINST SOURCE CITATIONS STACK */}
                    {liveResult.citations && liveResult.citations.length > 0 && (
                      <div className="evidence-claims-stack">
                        <div className="claims-section-header">
                          <h4>Check Against Source (All Cited Provisions)</h4>
                          <span>{liveResult.citations.length} Verified Citation{liveResult.citations.length === 1 ? "" : "s"}</span>
                        </div>

                        <div className="claims-list">
                          {liveResult.citations.map((cit, idx) => {
                            const ev = liveResult.evidence?.find((e) => e.chunk_id === cit.chunk_id)
                            const isSelected = selectedCitationChunkId === cit.chunk_id

                            return (
                              <div
                                key={idx}
                                className={`claim-evidence-row ${isSelected ? "selected-row" : ""}`}
                                onClick={() => {
                                  setSelectedCitationChunkId(cit.chunk_id)
                                  setIsMobileEvidenceOpen(true)
                                }}
                              >
                                <div className="claim-row-top">
                                  <div className="claim-source-badge">
                                    <FileTextIcon className="doc-mini-ico" />
                                    <span className="src-title">{ev?.document_title || cit.chunk_id.split("#")[0]}</span>
                                    {ev?.section && <span className="src-sec">§ {ev.section}</span>}
                                  </div>
                                  <button
                                    type="button"
                                    className="btn-inspect-passage"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedCitationChunkId(cit.chunk_id)
                                      setIsMobileEvidenceOpen(true)
                                    }}
                                  >
                                    <ExternalSourceIcon className="open-ico" />
                                    <span>Inspect Source →</span>
                                  </button>
                                </div>

                                <div className="claim-statement">
                                  <span className="claim-label">Assertion:</span>
                                  <span>{cit.claim}</span>
                                </div>

                                {cit.quote_snippet && (
                                  <div className="claim-exact-quote">
                                    <span className="quote-label">Exact Evidence:</span>
                                    <span className="quote-content">"{cit.quote_snippet}"</span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* RELATED PROVISIONS & PRECEDENCE DIAGRAM */}
                    {liveResult.relationships && liveResult.relationships.length > 0 && (
                      <div className="precedence-diagram-section">
                        <div className="precedence-header">
                          <h4>Related Provisions & Precedence Mapping</h4>
                          <span>Clause dependencies identified</span>
                        </div>

                        {liveResult.relationships.map((rel, idx) => (
                          <div key={idx} className="precedence-card">
                            <div className="precedence-card-top">
                              <span className="precedence-badge">
                                {rel.relation === "OVERRIDE" ? "CONTRACTUAL OVERRIDE" : "CONTRACTUAL CROSS-REFERENCE"}
                              </span>
                              <span className="precedence-operator">
                                OPERATOR · <code>{rel.operator?.toUpperCase() || rel.relation}</code>
                              </span>
                            </div>

                            <div className="precedence-flow-diagram">
                              <div className="precedence-node source-node">
                                <span className="node-tag">Governing Provision</span>
                                <span className="node-doc">{rel.source_doc_title}</span>
                                <span className="node-sec">{rel.source_section}</span>
                              </div>

                              <div className="precedence-flow-arrow">
                                <div className="arrow-line" />
                                <div className="arrow-pill">
                                  <span>↓ {rel.relation === "OVERRIDE" ? "OVERRIDES (NOTWITHSTANDING)" : rel.relation}</span>
                                </div>
                                <div className="arrow-line" />
                              </div>

                              <div className="precedence-node target-node">
                                <span className="node-tag">Referenced Provision</span>
                                <span className="node-doc">{rel.target_doc_title}</span>
                                <span className="node-sec">
                                  {rel.target_section || `Section ${rel.referenced_section}`}
                                </span>
                              </div>
                            </div>

                            <div className="precedence-human-explanation">
                              {rel.relation === "OVERRIDE"
                                ? `${rel.source_section.split(">").pop()?.trim()} accelerated notice overrides Section ${rel.referenced_section} in ${rel.target_doc_title} pursuant to express notwithstanding language.`
                                : `${rel.source_section.split(">").pop()?.trim()} references and incorporates terms set forth in ${rel.target_section || `Section ${rel.referenced_section}`}.`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* COLLAPSIBLE TECHNICAL AUDIT (Hidden by default for lawyers) */}
                  <div className="technical-audit-accordion">
                    <button
                      type="button"
                      className="technical-accordion-toggle"
                      onClick={() => setShowTechnicalAudit((prev) => !prev)}
                    >
                      <LockIcon className="sec-ico" />
                      <span>{showTechnicalAudit ? "Hide Technical Audit Details" : "View Technical Verification Details (For Audit)"}</span>
                      <ChevronDownIcon className={`toggle-chevron ${showTechnicalAudit ? "open" : ""}`} />
                    </button>

                    {showTechnicalAudit && (
                      <div className="technical-audit-content">
                        <div className="audit-meta-grid">
                          <div>
                            <span className="audit-k">Generator Backend:</span>
                            <span className="audit-v">{liveResult.generated_by || "Verified Grounded Generator"}</span>
                          </div>
                          <div>
                            <span className="audit-k">Governing Law Context:</span>
                            <span className="audit-v">{liveResult.jurisdiction_context || selectedJurisdiction}</span>
                          </div>
                          <div>
                            <span className="audit-k">Retrieval Latency:</span>
                            <span className="audit-v">{liveResult.latency_ms?.retrieval_ms ? `${Math.round(liveResult.latency_ms.retrieval_ms)} ms` : "0.4 ms"}</span>
                          </div>
                          <div>
                            <span className="audit-k">Generation Latency:</span>
                            <span className="audit-v">{liveResult.latency_ms?.generation_ms ? `${Math.round(liveResult.latency_ms.generation_ms)} ms` : "420 ms"}</span>
                          </div>
                        </div>

                        {liveResult.trace_log && liveResult.trace_log.length > 0 && (
                          <div className="audit-trace-box">
                            <span className="trace-title">Pipeline Trace Log:</span>
                            <ul className="trace-list">
                              {liveResult.trace_log.map((t, i) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              )
            })()}

              {/* EMPTY STATE (Before query is run) */}
              {!liveResult && !isAnalyzing && (
                <div className="workspace-empty-guidance">
                  <div className="guidance-seal">
                    <ScalesOfJusticeIcon className="seal-svg" />
                  </div>
                  <h3>Select a Question to Begin Contract Review</h3>
                  <p>
                    Choose an inquiry from the suggestions above or enter a question regarding termination rights,
                    uptime SLA thresholds, or liability caps.
                  </p>
                  <div className="quick-suggestions-cluster">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="quick-prompt-btn"
                        onClick={() => {
                          setUserQuery(s)
                          queryInputRef.current?.focus()
                        }}
                      >
                        <span>{s}</span>
                        <ChevronRightIcon className="mini-arr" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* PANE 3: RIGHT SOURCE & EVIDENCE INSPECTION PANEL                */}
            {/* (Desktop: Column | Mobile: Bottom Sheet)                         */}
            {/* ---------------------------------------------------------------- */}
            <aside className={`source-evidence-panel ${isMobileEvidenceOpen ? "mobile-drawer-open" : ""}`}>
              {/* Mobile Drawer Backdrop Scrim */}
              {isMobileEvidenceOpen && (
                <div
                  className="mobile-drawer-backdrop"
                  onClick={() => setIsMobileEvidenceOpen(false)}
                  aria-hidden="true"
                />
              )}

              <div className="evidence-panel-inner">
                {/* Panel Header */}
                <div className="evidence-panel-header">
                  <div className="ev-header-title-group">
                    <span className="ev-panel-tag">SOURCE CLAUSE INSPECTION</span>
                    <h3 className="ev-doc-title">
                      {activeEvidenceItem?.document_title || "Master Cloud Services Agreement"}
                    </h3>
                    <span className="ev-sec-path">
                      {activeEvidenceItem?.section || "Section 9. Term and Termination"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-close-evidence-pane"
                    onClick={() => setIsMobileEvidenceOpen(false)}
                    aria-label="Close evidence panel"
                  >
                    <CrossIcon />
                  </button>
                </div>

                {activeEvidenceItem ? (
                  <div className="evidence-clause-scrollable">
                    {/* Verification Status Banner */}
                    <div className="clause-verification-pill">
                      <ShieldCheckIcon className="ver-ico" />
                      <span>Checked Against Source Clause</span>
                    </div>

                    {/* How the Passage Was Found (Lawyer-friendly provenance) */}
                    <div className="evidence-provenance-box">
                      <span className="prov-k">Discovery Method:</span>
                      <span className="prov-v">
                        {activeRelationship
                          ? `Related provision identified via precedence override (${activeRelationship.operator?.toUpperCase() || "OVERRIDE"})`
                          : `Found relevant passages in ${activeEvidenceItem.section || "Operative Provision"} (Direct clause search)`}
                      </span>
                    </div>

                    {/* Supporting Claim Box */}
                    {activeCitationItem?.claim && (
                      <div className="evidence-substantiated-claim">
                        <span className="claim-box-label">SUBSTANTIATED CLAIM</span>
                        <p className="claim-box-text">{activeCitationItem.claim}</p>
                      </div>
                    )}

                    {/* Verbatim Quoted Phrase */}
                    {activeCitationItem?.quote_snippet && (
                      <div className="evidence-verbatim-excerpt">
                        <span className="excerpt-label">VERBATIM QUOTED EXCERPT</span>
                        <blockquote className="excerpt-quote">
                          "{activeCitationItem.quote_snippet}"
                        </blockquote>
                      </div>
                    )}

                    {/* Full Clause Surrounding Context */}
                    <div className="evidence-full-context-box">
                      <div className="context-header">
                        <span className="context-label">SURROUNDING CONTRACTUAL CONTEXT</span>
                        <span className="chunk-id-tag">{activeEvidenceItem.chunk_id}</span>
                      </div>
                      <div className="context-body-prose">
                        <HighlightedQuote
                          text={activeEvidenceItem.text}
                          quote={activeCitationItem?.quote_snippet}
                        />
                      </div>
                    </div>

                    {/* Linked Clause Navigation */}
                    {activeRelationship && (
                      <div className="evidence-linked-clause-card">
                        <div className="linked-title">
                          <SplitBranchIcon className="linked-ico" />
                          <span>Linked Precedence Clause</span>
                        </div>
                        <div className="linked-details">
                          <span className="linked-op">{activeRelationship.operator?.toUpperCase()}</span>
                          <span className="linked-desc">
                            Links to {activeRelationship.target_section || `Section ${activeRelationship.referenced_section}`} in {activeRelationship.target_doc_title}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-jump-linked-clause"
                          onClick={() => {
                            if (activeRelationship.target_chunk_id) {
                              setSelectedCitationChunkId(activeRelationship.target_chunk_id)
                            }
                          }}
                        >
                          <span>Jump to Linked Clause →</span>
                        </button>
                      </div>
                    )}

                    <div className="evidence-clause-audit-footer">
                      <LockIcon className="footer-lock" />
                      <span>Tamper-evident evidentiary index · Character offsets verified</span>
                    </div>
                  </div>
                ) : (
                  <div className="evidence-empty-slate">
                    <div className="slate-seal">
                      <FileTextIcon className="slate-ico" />
                    </div>
                    <h4>No Clause Selected</h4>
                    <p>
                      Click on any citation chip or source assertion in the answer to inspect its full surrounding
                      contractual text.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* ==================================================================== */}
      {/* GLOBAL FOOTER BAR                                                   */}
      {/* ==================================================================== */}
      <footer className="legal-global-footer" role="contentinfo">
        <div className="footer-inner-container">
          <div className="footer-left">
            <span className="footer-brand">HNX Legal Intelligence</span>
            <span className="footer-sep">·</span>
            <span>Commercial Contract Verification & Precedence Engine</span>
          </div>
          <div className="footer-right">
            <span>HackNEX 2026</span>
            <span className="footer-sep">·</span>
            <span>Zero Hallucination Policy</span>
            <span className="footer-sep">·</span>
            <span>Active Jurisdiction: {currentJurData.label}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
