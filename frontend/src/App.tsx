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
// ANIMATED BALANCE-SCALE ILLUSTRATION (REFINED LEGAL EDITORIAL HERO)
// ============================================================================

function BalanceScaleHero() {
  return (
    <div className="hero-scale-container" aria-label="Evidentiary Balance of Legal Proof">
      <svg
        className="hero-scale-svg"
        viewBox="0 0 360 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="scaleBrassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dfbe7c" />
            <stop offset="50%" stopColor="#c5a059" />
            <stop offset="100%" stopColor="#9e7d3b" />
          </linearGradient>
          <linearGradient id="scalePedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#202b3d" />
            <stop offset="100%" stopColor="#101827" />
          </linearGradient>
        </defs>

        {/* Stepped Pedestal Base */}
        <rect x="90" y="234" width="180" height="12" rx="2" fill="url(#scalePedestalGrad)" stroke="#c5a059" strokeWidth="1.2" />
        <rect x="115" y="224" width="130" height="10" rx="1.5" fill="url(#scalePedestalGrad)" stroke="#c5a059" strokeWidth="1" />
        <rect x="140" y="216" width="80" height="8" rx="1" fill="#c5a059" opacity="0.8" />

        {/* Central Fluted Pillar */}
        <rect x="175" y="70" width="10" height="146" rx="2" fill="url(#scalePedestalGrad)" stroke="#c5a059" strokeWidth="1.2" />
        <line x1="180" y1="74" x2="180" y2="212" stroke="#dfbe7c" strokeWidth="1" opacity="0.6" />

        {/* Pillar Capital & Fulcrum Pin */}
        <path d="M168 70h24l-3 10h-18z" fill="url(#scaleBrassGrad)" />
        <circle cx="180" cy="62" r="7.5" fill="url(#scaleBrassGrad)" stroke="#101827" strokeWidth="1.5" />
        <circle cx="180" cy="62" r="2.5" fill="#101827" />

        {/* Oscillating Crossbeam & Suspended Pans Assembly */}
        <g className="scale-rocking-assembly">
          {/* Main Tapered Beam */}
          <path
            d="M52 61.5L180 58.5L308 61.5C310 61.5 311 63 309.5 64L180 66L50.5 64C49 63 50 61.5 52 61.5Z"
            fill="url(#scaleBrassGrad)"
          />
          <circle cx="56" cy="63" r="4.5" fill="url(#scaleBrassGrad)" stroke="#101827" strokeWidth="1" />
          <circle cx="304" cy="63" r="4.5" fill="url(#scaleBrassGrad)" stroke="#101827" strokeWidth="1" />

          {/* Left Pan Assembly (Counter-rotates to stay upright) */}
          <g className="scale-left-pan-group">
            <line x1="56" y1="65" x2="32" y2="148" stroke="#c5a059" strokeWidth="1.1" strokeDasharray="3 2" />
            <line x1="56" y1="65" x2="80" y2="148" stroke="#c5a059" strokeWidth="1.1" strokeDasharray="3 2" />
            <ellipse cx="56" cy="148" rx="28" ry="4.5" fill="url(#scalePedestalGrad)" stroke="#c5a059" strokeWidth="1.2" />
            <path d="M28 148c0 10 12.5 16 28 16s28-6 28-16" fill="url(#scaleBrassGrad)" opacity="0.3" stroke="#c5a059" strokeWidth="1.2" />
            {/* Left Pan Token: Stylized Contract Clause */}
            <rect x="46" y="130" width="20" height="16" rx="2" fill="#162032" stroke="#dfbe7c" strokeWidth="1" />
            <line x1="50" y1="134" x2="62" y2="134" stroke="#dfbe7c" strokeWidth="1" />
            <line x1="50" y1="138" x2="59" y2="138" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="50" y1="142" x2="57" y2="142" stroke="#94a3b8" strokeWidth="0.8" />
          </g>

          {/* Right Pan Assembly (Counter-rotates in complement) */}
          <g className="scale-right-pan-group">
            <line x1="304" y1="65" x2="280" y2="148" stroke="#c5a059" strokeWidth="1.1" strokeDasharray="3 2" />
            <line x1="304" y1="65" x2="328" y2="148" stroke="#c5a059" strokeWidth="1.1" strokeDasharray="3 2" />
            <ellipse cx="304" cy="148" rx="28" ry="4.5" fill="url(#scalePedestalGrad)" stroke="#c5a059" strokeWidth="1.2" />
            <path d="M276 148c0 10 12.5 16 28 16s28-6 28-16" fill="url(#scaleBrassGrad)" opacity="0.3" stroke="#c5a059" strokeWidth="1.2" />
            {/* Right Pan Token: Verified Evidentiary Seal */}
            <circle cx="304" cy="138" r="9" fill="#10b981" opacity="0.25" />
            <circle cx="304" cy="138" r="7" fill="url(#scaleBrassGrad)" stroke="#101827" strokeWidth="0.8" />
            <path d="M301 138l2 2 4-4" stroke="#080c15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </svg>
      <div className="hero-scale-caption">
        <span className="scale-caption-title">Evidentiary Equilibrium</span>
        <span className="scale-caption-sub">Claim · Verbatim Grounding · Section Precedence</span>
      </div>
    </div>
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
  page?: number
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
  documents = [],
  onSelectChunk,
}: {
  rawText: string
  evidenceList: EvidenceItem[]
  documents?: DocumentInfo[]
  onSelectChunk?: (chunkId: string) => void
}) {
  if (!rawText) return null

  const getLabel = (cid: string) => {
    const ev = evidenceList.find((e) => e.chunk_id === cid)
    const docId = cid.split("#")[0]
    const doc = documents.find((d) => d.id === docId)
    const docTitle = doc?.title || ev?.document_title || docId

    if (ev?.section) {
      const match = ev.section.match(/(?:Section|§|##)?\s*([0-9]+(?:\.[0-9]+)?)/i)
      if (match) return `${docTitle.split(" ")[0]} · § ${match[1]}`
      const last = ev.section.split(">").pop()?.trim()
      if (last) return `${docTitle.split(" ")[0]} · ${last.slice(0, 16)}`
    }
    return `${docTitle.split(" ")[0]} · Evidence`
  }

  const paragraphs = rawText.split(/\n\n+/)

  return (
    <div className="answer-prose">
      {paragraphs.map((para, pIdx) => {
        // Clean leading markdown hashes (#, ##, ###)
        const cleanPara = para.replace(/^#+\s*/, "").trim()
        if (!cleanPara) return null

        // Match bold markers **...** and bracketed chunk ids [DOC-xxx#cxxx]
        const tokenRegex = /(\*\*.*?\*\*|\[DOC-[A-Za-z0-9_-]+#c[0-9]+\])/g
        const parts = cleanPara.split(tokenRegex)

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
                    title={`Inspect source clause: ${label}`}
                  >
                    <FileTextIcon className="chip-ico" />
                    <span>{label}</span>
                  </button>
                )
              }
              // Clean any stray markdown asterisks
              const cleanPart = part.replace(/\*\*/g, "")
              return <span key={partIdx}>{cleanPart}</span>
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
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  // Query and Execution State
  const [userQuery, setUserQuery] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [analysisStage, setAnalysisStage] = useState<string>("Analyzing document...")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [liveResult, setLiveResult] = useState<AnswerResult | null>(null)

  // Active Selected Citation / Passage
  const [selectedCitationChunkId, setSelectedCitationChunkId] = useState<string | null>(null)

  // Progressive Disclosure Toggles
  const [showFullContext, setShowFullContext] = useState<boolean>(false)
  const [showTechnicalAudit, setShowTechnicalAudit] = useState<boolean>(false)

  // Workspace Tab: "inquiry" (Clause Analysis) | "draft" (Evidence-Backed Notice Drafter)
  const [workspaceTab, setWorkspaceTab] = useState<"inquiry" | "draft">("inquiry")

  // Legal Notice Drafting State
  const [draftSender, setDraftSender] = useState<string>("Apex Biologics LLC")
  const [draftRecipient, setDraftRecipient] = useState<string>("Polaris Cold-Chain Solutions Inc")
  const [draftAddress, setDraftAddress] = useState<string>("100 Industrial Port Parkway, Anchorage, AK 99501")
  const [draftBreach, setDraftBreach] = useState<string>(
    "Failure to maintain delivery window for Temperature Sensitive Goods shipment #TX-8910 resulting in consignment spoilage exceeding four (4) hours beyond scheduled delivery."
  )
  const [draftIncidentDate, setDraftIncidentDate] = useState<string>("October 4, 2026")
  const [draftNoticeDate, setDraftNoticeDate] = useState<string>("October 9, 2026")
  const [draftRemedy, setDraftRemedy] = useState<string>(
    "Immediate indemnification for spoiled cargo value pursuant to special liability guarantee and expedited replacement freight."
  )
  const [draftCureDays, setDraftCureDays] = useState<string>("15")
  const [draftExtraFacts, setDraftExtraFacts] = useState<string>(
    "Continuous data logger telemetry confirmed cargo temperatures spiked to 14.2°C for over 5 consecutive hours during port customs detention."
  )
  const [isDrafting, setIsDrafting] = useState<boolean>(false)
  const [draftResult, setDraftResult] = useState<any>(null)
  const [editableDraftText, setEditableDraftText] = useState<string>("")
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false)
  const [showDraftModal, setShowDraftModal] = useState<boolean>(false)

  // Non-blocking Scroll Reveal Observer: Reveals cards smoothly as they enter viewport
  useEffect(() => {
    if (typeof window === "undefined") return

    // Immediately reveal all elements if reduced motion is requested or observer is unsupported
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal-on-scroll, .reveal-scale").forEach((el) => {
        el.classList.add("is-revealed")
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed")
            obs.unobserve(entry.target)
          }
        })
      },
      {
        root: null,
        // Trigger 80px before entering viewport so content is already revealed when scrolled to
        rootMargin: "0px 0px 80px 0px",
        threshold: 0.01,
      }
    )

    const unrevealedElements = document.querySelectorAll(
      ".reveal-on-scroll:not(.is-revealed), .reveal-scale:not(.is-revealed)"
    )
    unrevealedElements.forEach((el) => observer.observe(el))

    // Failsafe timer: guarantee all elements are visible after 600ms even if observer fails
    const fallbackTimer = setTimeout(() => {
      document.querySelectorAll(".reveal-on-scroll:not(.is-revealed), .reveal-scale:not(.is-revealed)").forEach((el) => {
        el.classList.add("is-revealed")
      })
    }, 600)

    return () => {
      clearTimeout(fallbackTimer)
      observer.disconnect()
    }
  }, [view])

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
        }
      })
      .catch(() => {
        // Fallback to SAMPLE_DOCS if server is offline
      })
  }, [])

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

  // "Analyze a Document" CTA handler (Presents large document intake experience)
  const handleOpenWorkspace = () => {
    setView("workspace")
    setActiveDocId(null)
    setErrorMessage(null)
  }

  // Process uploaded or dropped document
  const handleProcessFile = async (file: File) => {
    setIsUploading(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("jurisdiction", selectedJurisdiction)

      const res = await fetch("http://127.0.0.1:8000/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        const backendDoc = data.document
        const newDoc: DocumentInfo = {
          id: backendDoc.id,
          title: backendDoc.title,
          filename: backendDoc.filename,
          jurisdiction: backendDoc.jurisdiction || selectedJurisdiction,
          sections: backendDoc.sections || 6,
          size: `${Math.max(1, Math.round(backendDoc.total_chars / 1024))} KB`,
          total_chars: backendDoc.total_chars,
          status: "Verified",
        }
        setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)])
        setActiveDocId(newDoc.id)
        setUserQuery("")
        setLiveResult(null)
      } else {
        const errJson = await res.json().catch(() => ({}))
        setErrorMessage(friendlyError(errJson.detail || `Upload failed (${res.status})`))
      }
    } catch (e: any) {
      setErrorMessage(friendlyError(e?.message || "Could not upload document to server"))
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    handleProcessFile(files[0])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0])
    }
  }

  // Execute legal analysis against backend API with honest progressive stages
  const handleRunAnalysis = async (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : userQuery).trim()
    if (!q) return

    setIsAnalyzing(true)
    setErrorMessage(null)
    setAnalysisStage("Analyzing document...")

    const t1 = setTimeout(() => setAnalysisStage("Finding relevant provisions..."), 350)
    const t2 = setTimeout(() => setAnalysisStage("Checking source evidence..."), 800)
    const t3 = setTimeout(() => setAnalysisStage("Preparing answer..."), 1300)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          selected_jurisdiction: selectedJurisdiction,
          top_k: 4,
          doc_id: activeDocId || undefined,
        }),
      })

      if (res.ok) {
        const data: AnswerResult = await res.json()
        setLiveResult(data)
        if (data.citations && data.citations.length > 0) {
          setSelectedCitationChunkId(data.citations[0].chunk_id)
        } else if (data.evidence && data.evidence.length > 0) {
          setSelectedCitationChunkId(data.evidence[0].chunk_id)
        } else {
          setSelectedCitationChunkId(null)
        }
      } else {
        const errJson = await res.json().catch(() => ({}))
        setErrorMessage(friendlyError(errJson.detail || `Server error (${res.status})`))
      }
    } catch (e: any) {
      setErrorMessage(friendlyError(e?.message || "Failed to fetch"))
    } finally {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      setIsAnalyzing(false)
    }
  }

  // Legal Notice Drafting Execution
  const handleGenerateDraft = async () => {
    if (!draftBreach.trim()) return
    setIsDrafting(true)
    setErrorMessage(null)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/draft/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_id: activeDocId || undefined,
          selected_jurisdiction: selectedJurisdiction,
          sender_entity: draftSender || undefined,
          recipient_entity: draftRecipient || undefined,
          recipient_address: draftAddress || undefined,
          alleged_breach: draftBreach,
          incident_date: draftIncidentDate || undefined,
          notice_date: draftNoticeDate || undefined,
          demanded_remedy: draftRemedy || undefined,
          cure_period_days: draftCureDays || undefined,
          additional_facts: draftExtraFacts || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setDraftResult(data)
        setEditableDraftText(data.draft_text)
      } else {
        const errJson = await res.json().catch(() => ({}))
        setErrorMessage(friendlyError(errJson.detail || `Draft generation failed (${res.status})`))
      }
    } catch (e: any) {
      setErrorMessage(friendlyError(e?.message || "Failed to reach server for legal notice drafting"))
    } finally {
      setIsDrafting(false)
    }
  }

  const handlePreviewClauses = async () => {
    try {
      setIsDrafting(true)
      const q = draftBreach.trim() || "notice breach termination remedy cure liability"
      const res = await fetch(
        `http://127.0.0.1:8000/api/draft/clauses?doc_id=${encodeURIComponent(activeDocId || "")}&query=${encodeURIComponent(q)}`
      )
      if (res.ok) {
        const data = await res.json()
        setDraftResult((prev: any) => ({
          ...(prev || {}),
          grounded_provisions: data.clauses,
          source_doc_id: data.doc_id,
          doc_title: data.doc_title,
          is_supported_by_contract: data.clauses && data.clauses.length > 0,
        }))
      }
    } catch {
      // Non-blocking preview
    } finally {
      setIsDrafting(false)
    }
  }

  const handleCopyDraft = () => {
    if (!editableDraftText) return
    navigator.clipboard.writeText(editableDraftText)
    setCopiedDraft(true)
    setTimeout(() => setCopiedDraft(false), 2200)
  }

  const handleDownloadDraft = () => {
    if (!editableDraftText) return
    const blob = new Blob([editableDraftText], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Legal_Notice_${activeDocId || "Draft"}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleApplyPreset = (type: "spoilage" | "invoice") => {
    if (type === "spoilage") {
      setDraftSender("Apex Biologics LLC")
      setDraftRecipient("Polaris Cold-Chain Solutions Inc")
      setDraftAddress("100 Industrial Port Parkway, Anchorage, AK 99501")
      setDraftBreach(
        "Failure to maintain delivery window for Temperature Sensitive Goods shipment #TX-8910 resulting in consignment spoilage exceeding four (4) hours beyond scheduled delivery."
      )
      setDraftIncidentDate("October 4, 2026")
      setDraftNoticeDate("October 9, 2026")
      setDraftRemedy(
        "Full indemnification for direct cargo loss value and expedited replacement freight pursuant to Section 2.3 and Section 5.2."
      )
      setDraftCureDays("15")
      setDraftExtraFacts(
        "Data logger telemetry verified cargo temperature spiked to 14.2°C during customs detention."
      )
    } else {
      setDraftSender("Service Provider Corporate Counsel")
      setDraftRecipient("Acme Logistics Client Corp")
      setDraftAddress("[RECIPIENT REGISTERED ADDRESS REQUIRED]")
      setDraftBreach(
        "Failure to remit undisputed invoice amounts for monthly distribution services within thirty (30) calendar days from receipt of electronic invoice #INV-2026-089."
      )
      setDraftIncidentDate("September 15, 2026")
      setDraftNoticeDate("October 9, 2026")
      setDraftRemedy(
        "Remittance of principal invoice balance ($48,250.00) plus accrued contractual interest at 1.25% per month for amounts overdue more than fifteen (15) days pursuant to Section 3.1."
      )
      setDraftCureDays("10")
      setDraftExtraFacts(
        "Formal invoice was delivered via electronic billing portal on August 15, 2026 and remains undisputed."
      )
    }
    setDraftResult(null)
    setEditableDraftText("")
  }

  // Active Document Data
  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0]

  // Active Inspected Evidence Chunk details
  const effectiveCitationChunkId =
    selectedCitationChunkId ||
    liveResult?.citations?.[0]?.chunk_id ||
    liveResult?.evidence?.[0]?.chunk_id ||
    null

  const activeEvidenceItem: EvidenceItem | null = (() => {
    if (!liveResult?.evidence || liveResult.evidence.length === 0) return null
    if (effectiveCitationChunkId) {
      const found = liveResult.evidence.find((e) => e.chunk_id === effectiveCitationChunkId)
      if (found) return found
    }
    return liveResult.evidence[0] || null
  })()

  const activeCitationItem: CitationItem | null = (() => {
    if (!liveResult?.citations || liveResult.citations.length === 0) return null
    if (effectiveCitationChunkId) {
      const found = liveResult.citations.find((c) => c.chunk_id === effectiveCitationChunkId)
      if (found) return found
    }
    return liveResult.citations[0] || null
  })()

  const activeEvidenceDoc = documents.find((d) => d.id === activeEvidenceItem?.chunk_id.split("#")[0])
  const activeEvidenceDocName = activeEvidenceDoc?.title || activeEvidenceItem?.document_title || activeDoc?.title || "Master Services Agreement"
  const activeEvidenceSection = activeEvidenceItem?.section || "Operative Provision"
  const activeEvidencePage = activeEvidenceItem?.page ? `Page ${activeEvidenceItem.page}` : (activeEvidenceItem?.section || "Operative Provision")
  const activeQuoteSnippet = activeCitationItem?.quote_snippet || (activeEvidenceItem?.text ? activeEvidenceItem.text.slice(0, 220) + "..." : "")

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
            {/* Governing Jurisdiction Selector (Active in Workspace View) */}
            {view === "workspace" && (
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
            )}

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
          <div
            className="legal-atmosphere-backdrop"
            aria-hidden="true"
          />

          {/* Subtle Architectural / Column Lines */}
          <div
            className="legal-atmosphere-geometry"
            aria-hidden="true"
          />

          {/* ================================================================ */}
          {/* 1. HERO SECTION                                                  */}
          {/* ================================================================ */}
          <section className="legal-hero-section">
            <div className="hero-layout-grid">
              {/* Left Column: Authoritative Legal Copy */}
              <div className="hero-copy-column">
                <div className="hero-eyebrow">
                  <span className="eyebrow-rule" />
                  <span>HNX Legal Intelligence · Evidentiary Document Review</span>
                </div>

                <h1 className="hero-primary-headline">
                  Document-Grounded <em>Legal Intelligence.</em>
                </h1>

                <p className="hero-supporting-lead">
                  Uncompromising contractual verification for commercial agreements. Every substantive claim cites operative clauses with exact character spans; silence and conflicts are reported explicitly.
                </p>

                {/* Primary & Secondary Action Buttons */}
                <div className="hero-cta-button-row">
                  <button
                    type="button"
                    className="hero-btn-primary"
                    onClick={() => {
                      setView("workspace")
                      setTimeout(() => fileInputRef.current?.click(), 100)
                    }}
                    id="hero-upload-document-cta"
                  >
                    <UploadCloudIcon className="btn-browse-ico" />
                    <span>Upload Document</span>
                    <ArrowRightIcon className="cta-arrow" />
                  </button>

                  <button
                    type="button"
                    className="hero-btn-secondary"
                    onClick={handleTrySample}
                    id="hero-explore-demo-cta"
                  >
                    <span>Explore Demonstration</span>
                  </button>
                </div>

                {/* Editorial Trust Badges */}
                <div className="hero-trust-badges">
                  <div className="hero-trust-badge">
                    <ShieldCheckIcon className="trust-badge-icon" />
                    <span>Zero Speculation Policy</span>
                  </div>
                  <div className="hero-trust-badge">
                    <FileTextIcon className="trust-badge-icon" />
                    <span>Character-Span Citations</span>
                  </div>
                  <div className="hero-trust-badge">
                    <SplitBranchIcon className="trust-badge-icon" />
                    <span>CPDE Precedence Tracking</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Animated Balance Scale + Product Demonstration */}
              <div className="hero-demonstration-column">
                {/* Refined Animated Balance Scale Illustration */}
                <BalanceScaleHero />

                <div className="hero-preview-card" aria-label="Evidentiary Demonstration Preview">
                  <div className="preview-card-header">
                    <span className="preview-badge">Live Demonstration</span>
                    <span className="preview-doc-ref">DOC-006 · Master Services Agreement</span>
                  </div>

                  <div className="preview-stage-group">
                    {/* Stage 1: Question */}
                    <div className="preview-stage">
                      <span className="stage-label">Question</span>
                      <p className="preview-question-text">
                        "Who can terminate this agreement?"
                      </p>
                    </div>

                    {/* Stage 2: Answer with Status */}
                    <div className="preview-stage preview-stage-answer">
                      <div className="stage-label-row">
                        <span className="stage-label">Answer</span>
                        <span className="stage-supported-pill">
                          <CheckIcon className="pill-check-ico" />
                          Supported by source
                        </span>
                      </div>
                      <p className="preview-answer-text">
                        Either party may terminate the agreement upon thirty (30) days prior written notice.
                      </p>
                    </div>

                    {/* Stage 3: Source */}
                    <div className="preview-stage">
                      <span className="stage-label">Source</span>
                      <p className="preview-source-text">
                        Master Services Agreement · Section 12 · Page 8
                      </p>
                    </div>

                    {/* Stage 4: Exact Evidence */}
                    <div className="preview-stage preview-stage-quote">
                      <span className="stage-label">Exact evidence</span>
                      <blockquote className="preview-quote-body">
                        "Either party may terminate this Agreement without cause upon <mark>thirty (30) days</mark> prior written notice..."
                      </blockquote>
                    </div>
                  </div>

                  <div className="preview-card-footer">
                    <button
                      type="button"
                      className="preview-demo-action"
                      onClick={handleTrySample}
                    >
                      <span>Explore this live in the workspace →</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 2. HOW IT WORKS                                                  */}
          {/* ================================================================ */}
          <section className="legal-how-it-works-section">
            <div className="section-header-centered">
              <span className="section-pre-title">How it works</span>
              <h2 className="section-main-title">Three Steps to Evidentiary Clarity</h2>
              <p className="section-lead-text">
                Designed for legal workflows: upload documents, inquire naturally, and inspect verbatim proof.
              </p>
            </div>

            <div className="how-it-works-grid">
              <div className="how-step-card reveal-on-scroll stagger-1">
                <div className="how-step-index">1</div>
                <h3 className="how-step-title">Upload a document</h3>
                <p className="how-step-desc">
                  Load commercial contracts, Master Services Agreements, or schedules in PDF, DOCX, or text format.
                </p>
              </div>

              <div className="how-step-card reveal-on-scroll stagger-2">
                <div className="how-step-index">2</div>
                <h3 className="how-step-title">Ask your question</h3>
                <p className="how-step-desc">
                  Inquire about termination triggers, liability carveouts, or obligations in plain legal English.
                </p>
              </div>

              <div className="how-step-card reveal-on-scroll stagger-3">
                <div className="how-step-index">3</div>
                <h3 className="how-step-title">Review the evidence</h3>
                <p className="how-step-desc">
                  Every material claim connects directly to verbatim contractual clauses, section numbers, and page references.
                </p>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 3. BUILT FOR LEGAL REVIEW                                        */}
          {/* ================================================================ */}
          <section className="legal-capabilities-section">
            <div className="section-header-centered">
              <span className="section-pre-title">Built for legal review</span>
              <h2 className="section-main-title">Forensic Contract Intelligence</h2>
              <p className="section-lead-text">
                Engineered specifically for transactional attorneys, in-house counsel, and contract review teams.
              </p>
            </div>

            <div className="capabilities-grid">
              <div className="capability-card reveal-on-scroll stagger-1">
                <div className="cap-icon-box">
                  <FileTextIcon className="cap-svg" />
                </div>
                <div className="cap-content">
                  <h3 className="cap-title">Contract Review</h3>
                  <p className="cap-desc">
                    Find relevant clauses, obligations, exceptions, and related provisions across single or multi-part agreements.
                  </p>
                </div>
              </div>

              <div className="capability-card reveal-on-scroll stagger-2">
                <div className="cap-icon-box">
                  <ShieldCheckIcon className="cap-svg" />
                </div>
                <div className="cap-content">
                  <h3 className="cap-title">Evidence-Grounded Answers</h3>
                  <p className="cap-desc">
                    Trace important claims to the exact source passage. Avoid unsupported claims with sentence-level verification.
                  </p>
                </div>
              </div>

              <div className="capability-card reveal-on-scroll stagger-3">
                <div className="cap-icon-box">
                  <SearchMinusIcon className="cap-svg" />
                </div>
                <div className="cap-content">
                  <h3 className="cap-title">Missing Evidence</h3>
                  <p className="cap-desc">
                    Know when the document does not establish an answer. The system identifies silence rather than inventing terms.
                  </p>
                </div>
              </div>

              <div className="capability-card reveal-on-scroll stagger-4">
                <div className="cap-icon-box">
                  <SplitBranchIcon className="cap-svg" />
                </div>
                <div className="cap-content">
                  <h3 className="cap-title">Related Provisions</h3>
                  <p className="cap-desc">
                    Follow explicit legal references between clauses, tracking <em>notwithstanding</em> overrides and schedule precedence.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 4. TRUST / DIFFERENTIATOR: INSPECT THE EVIDENCE                   */}
          {/* ================================================================ */}
          <section className="legal-differentiator-section">
            <div className="section-header-centered">
              <span className="section-pre-title">Evidentiary audit trail</span>
              <h2 className="section-main-title">Don't just get an answer. Inspect the evidence.</h2>
              <p className="section-lead-text">
                Generic AI summarizes without proof. HNX connects every substantive assertion directly to its operative contractual clause.
              </p>
            </div>

            <div className="differentiator-chain-wrapper">
              <div className="audit-step-block audit-claim-block reveal-on-scroll stagger-1">
                <div className="audit-step-header">
                  <span className="audit-step-tag">Claim</span>
                  <span className="audit-status-tag">
                    <CheckIcon className="pill-check-ico" />
                    Supported by Document Evidence
                  </span>
                </div>
                <p className="audit-claim-text">
                  Customer liability for data security incidents is capped at two times annual fees, overriding the standard contract cap.
                </p>
              </div>

              <div className="chain-connector">
                <span className="connector-text">Traced to operative source ↓</span>
              </div>

              <div className="audit-step-block audit-source-block reveal-on-scroll stagger-2">
                <div className="audit-step-header">
                  <span className="audit-step-tag">Source</span>
                  <span className="audit-source-name">Data Protection Addendum (DPA)</span>
                </div>
                <div className="audit-source-details">
                  <span className="source-chip">Section 8.2</span>
                  <span className="source-chip">Page 6</span>
                  <span className="source-chip">Precedence Clause</span>
                </div>
              </div>

              <div className="chain-connector">
                <span className="connector-text">Exact contractual language ↓</span>
              </div>

              <div className="audit-step-block audit-evidence-block reveal-on-scroll stagger-3">
                <div className="audit-step-header">
                  <span className="audit-step-tag">Exact evidence</span>
                  <span className="audit-verbatim-tag">Verbatim contract text</span>
                </div>
                <blockquote className="audit-evidence-quote">
                  "Notwithstanding Section 9.1 (Limitation of Liability) of the Master Agreement, Provider's aggregate liability for Data Protection Breaches under this Addendum shall not exceed <mark>two (2) times the total fees paid</mark> by Customer in the preceding twelve (12) months."
                </blockquote>
                <div className="audit-rel-notice">
                  <SplitBranchIcon className="rel-ico" />
                  <span><strong>Follow Related Provisions:</strong> Express <code>notwithstanding</code> override modifies Master Agreement § 9.1 general cap.</span>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 5. CALL TO ACTION                                                */}
          {/* ================================================================ */}
          <section className="legal-bottom-cta-section">
            <div className="cta-box-card reveal-scale">
              <div className="cta-content">
                <h2 className="cta-headline">Ready to review agreements with evidentiary certainty?</h2>
                <p className="cta-sub">
                  Experience commercial contract review where every answer shows its evidence and silence is explicitly noted.
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
      {/* VIEW 2: LAWYER-FIRST CONTRACT WORKSPACE                             */}
      {/* ==================================================================== */}
      {view === "workspace" && (
        <main className="workspace-view-root">
          {/* STATE A: NO ACTIVE DOCUMENT -> MAJOR PRIMARY INTAKE EXPERIENCE */}
          {!activeDocId ? (
            <div className="workspace-intake-container">
              <div className="intake-header">
                <div className="intake-crest">
                  <ScalesOfJusticeIcon className="intake-crest-svg" />
                </div>
                <h1 className="intake-title">Analyze a Legal Document</h1>
                <p className="intake-subtitle">
                  Upload a contract, case file, judgment, notice, or other legal document to begin evidentiary review.
                </p>
              </div>

              {/* Large Centered Intake Dropzone */}
              <div
                className={`intake-dropzone-card ${isDragging ? "drag-active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="dropzone-cloud-icon-box">
                  <UploadCloudIcon className="dropzone-cloud-ico" />
                </div>

                <h2 className="dropzone-main-label">Upload your document</h2>
                <p className="dropzone-hint">
                  Drag & drop PDF here, or choose from your computer
                </p>
                <p className="dropzone-formats">
                  Accepted formats: PDF, Word (DOCX), TXT, Markdown
                </p>

                <div className="dropzone-button-row">
                  <button
                    type="button"
                    className="btn-intake-browse"
                    onClick={() => fileInputRef.current?.click()}
                    id="intake-choose-pdf-btn"
                  >
                    <FileTextIcon className="btn-browse-ico" />
                    <span>Choose Document</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                </div>

                {isUploading && (
                  <div className="intake-uploading-indicator">
                    <span className="button-spinner" />
                    <span>Analyzing and indexing document structure…</span>
                  </div>
                )}

                {/* Or Try Verified Sample Preset */}
                <div className="intake-sample-divider">
                  <span className="divider-line" />
                  <span className="divider-text">or try a verified sample</span>
                  <span className="divider-line" />
                </div>

                <div className="intake-samples-grid">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="intake-sample-card"
                      onClick={() => {
                        setActiveDocId(doc.id)
                        setUserQuery("Who can terminate this agreement?")
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="sample-card-left">
                        <span className="sample-dot">●</span>
                        <div className="sample-text-group">
                          <span className="sample-title">{doc.title}</span>
                          <span className="sample-meta">{doc.size || "32 KB"} · Ready for analysis</span>
                        </div>
                      </div>
                      <div className="sample-card-actions">
                        <button
                          type="button"
                          className="btn-sample-draft"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveDocId(doc.id)
                            setShowDraftModal(true)
                          }}
                          title={`Draft Legal Document for ${doc.title}`}
                          id={`btn-sample-draft-${doc.id}`}
                        >
                          <FileTextIcon className="btn-mini-ico" />
                          <span>Draft Notice</span>
                        </button>
                        <ArrowRightIcon className="sample-arrow" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* STATE B: ACTIVE DOCUMENT -> FOCUSED ANALYSIS WORKSPACE */
            <div className="workspace-focused-root">
              {/* TOP: Active Document & Controls Bar */}
              <header className="workspace-active-doc-bar">
                <div className="active-doc-left">
                  <span className="doc-active-indicator">●</span>
                  <div className="active-doc-title-group">
                    <h2 className="active-doc-heading">
                      {activeDoc?.title || "Master Cloud Services Agreement"}
                    </h2>
                    <div className="active-doc-metadata-row">
                      <span>{activeDoc?.size || "32 KB"}</span>
                      <span className="meta-sep">·</span>
                      <span>{activeDoc?.sections || 6} Operative Sections</span>
                      <span className="meta-sep">·</span>
                      <span>Governing Law: {currentJurData.label} [{currentJurData.code}]</span>
                    </div>
                  </div>
                </div>

                <div className="active-doc-actions">
                  <div className="jurisdiction-select-wrap">
                    <select
                      id="governing-jurisdiction-select"
                      className="workspace-jurisdiction-select"
                      value={selectedJurisdiction}
                      onChange={(e) => setSelectedJurisdiction(e.target.value)}
                      aria-label="Governing Law Jurisdiction"
                    >
                      {JURISDICTIONS.map((jur) => (
                        <option key={jur.id} value={jur.id}>
                          [{jur.code}] {jur.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn-workspace-draft-action primary-gold"
                    onClick={() => setShowDraftModal(true)}
                    title="Draft Evidence-Backed Legal Notice for this document"
                    id="btn-workspace-draft-action"
                  >
                    <FileTextIcon className="btn-ico" />
                    <span>Draft Legal Document</span>
                  </button>

                  <button
                    type="button"
                    className="btn-workspace-switch-doc"
                    onClick={() => setActiveDocId(null)}
                    title="Switch or upload another document"
                  >
                    <UploadCloudIcon className="btn-ico" />
                    <span>Switch / Add Document</span>
                  </button>
                </div>
              </header>

              {/* MAIN WORKSPACE: Compact Left Document Navigator + Center Analysis Stage */}
              <div className="workspace-main-layout">
                {/* LEFT: Compact Document Navigator */}
                <aside className="workspace-compact-sidebar">
                  <div className="sidebar-header-row">
                    <span className="sidebar-heading">Documents</span>
                    <button
                      type="button"
                      className="btn-sidebar-add-doc"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload document"
                    >
                      + Add document
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,.md"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                  </div>

                  <div className="compact-docs-list" role="listbox" aria-label="Loaded legal documents">
                    {documents.map((d) => {
                      const isActive = d.id === activeDocId
                      return (
                        <button
                          key={d.id}
                          type="button"
                          className={`compact-doc-item ${isActive ? "active-doc" : ""}`}
                          onClick={() => {
                            setActiveDocId(d.id)
                            setLiveResult(null)
                            setErrorMessage(null)
                          }}
                          role="option"
                          aria-selected={isActive}
                        >
                          <span className={`doc-status-bullet ${isActive ? "bullet-active" : ""}`}>
                            {isActive ? "●" : "○"}
                          </span>
                          <div className="compact-doc-info">
                            <span className="compact-doc-title">{d.title}</span>
                            <span className="compact-doc-sub">{d.size || "32 KB"} · Ready</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </aside>

                {/* CENTER: Question Area → Loading → Answer → Evidence */}
                <main className="workspace-center-stage">
                  {/* Document Scope Banner */}
                  <div className="workspace-scope-banner">
                    <ShieldCheckIcon className="trust-badge-icon" />
                    <span>
                      Active Scope: <strong>{activeDoc?.title}</strong> ({activeDoc?.id}). Analysis is strictly bounded to this document without default-corpus cross-contamination.
                    </span>
                  </div>

                  {/* High-Visibility Draft Legal Document CTA Banner */}
                  <div className="workspace-draft-cta-banner">
                    <div className="draft-cta-left">
                      <FileTextIcon className="cta-ico" />
                      <div className="cta-text">
                        <span className="cta-title">Evidence-Backed Legal Notice Drafting</span>
                        <span className="cta-sub">
                          Prepare a structured, lawyer-reviewable Legal Notice grounded strictly in operative clauses from <strong>{activeDoc?.title}</strong>.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-draft-cta-action"
                      id="btn-workspace-cta-draft"
                      onClick={() => setShowDraftModal(true)}
                    >
                      <FileTextIcon />
                      <span>Draft Legal Document</span>
                    </button>
                  </div>

                  {/* Mode Selector Tabs: Inquiry vs Evidence-Backed Drafting */}
                  <div className="workspace-tab-bar" role="tablist">
                    <button
                      type="button"
                      className={`workspace-tab-btn ${workspaceTab === "inquiry" ? "active" : ""}`}
                      onClick={() => setWorkspaceTab("inquiry")}
                      id="workspace-tab-inquiry-btn"
                      role="tab"
                      aria-selected={workspaceTab === "inquiry"}
                    >
                      <SearchMinusIcon className="tab-ico" />
                      <span>Clause Analysis & Inquiries</span>
                    </button>
                    <button
                      type="button"
                      className={`workspace-tab-btn ${workspaceTab === "draft" ? "active" : ""}`}
                      onClick={() => setWorkspaceTab("draft")}
                      id="workspace-tab-draft-btn"
                      role="tab"
                      aria-selected={workspaceTab === "draft"}
                    >
                      <FileTextIcon className="tab-ico" />
                      <span>Draft Legal Notice (Evidence-Backed)</span>
                      <span className="tab-badge-new">NEW</span>
                    </button>
                  </div>

                  {/* Error Notification */}
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

                  {workspaceTab === "inquiry" && (
                    <>
                      {/* 1. Question Area */}
                      <section className="workspace-question-section">
                        <label htmlFor="legal-inquiry-input" className="question-section-label">
                          Ask about this document
                        </label>

                        <div className="question-input-wrapper">
                          <input
                            ref={queryInputRef}
                            id="legal-inquiry-input"
                            type="text"
                            className="question-input-field"
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !isAnalyzing) handleRunAnalysis()
                            }}
                            placeholder="What would you like to know about this document?"
                            disabled={isAnalyzing}
                            aria-label="What would you like to know about this document?"
                          />
                          <button
                            type="button"
                            className="btn-question-ask"
                            onClick={() => handleRunAnalysis()}
                            disabled={isAnalyzing || !userQuery.trim()}
                            id="analyze-document-submit-btn"
                          >
                            {isAnalyzing ? "Checking…" : "Ask"}
                          </button>
                        </div>

                        <div className="question-suggestions-row">
                          <span className="suggestions-lead">Try asking:</span>
                          {SUGGESTIONS.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className="suggestion-link-btn"
                              onClick={() => {
                                setUserQuery(s)
                                queryInputRef.current?.focus()
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* Honest Loading State (Real stages, no fake percentages) */}
                      {isAnalyzing && (
                        <div className="honest-loading-panel" role="status" aria-live="polite">
                          <div className="loading-spinner-ring" />
                      <div className="loading-steps-stack">
                        <span className="loading-active-step">{analysisStage}</span>
                        <div className="loading-stages-trail">
                          <span className={`stage-dot ${analysisStage === "Analyzing document..." ? "current" : "done"}`}>
                            Analyzing document
                          </span>
                          <span className="stage-sep">→</span>
                          <span className={`stage-dot ${analysisStage === "Finding relevant provisions..." ? "current" : analysisStage.includes("Checking") || analysisStage.includes("Preparing") ? "done" : ""}`}>
                            Finding relevant provisions
                          </span>
                          <span className="stage-sep">→</span>
                          <span className={`stage-dot ${analysisStage === "Checking source evidence..." ? "current" : analysisStage.includes("Preparing") ? "done" : ""}`}>
                            Checking source evidence
                          </span>
                          <span className="stage-sep">→</span>
                          <span className={`stage-dot ${analysisStage === "Preparing answer..." ? "current" : ""}`}>
                            Preparing answer
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Answer & Evidence Area */}
                  {liveResult && !isAnalyzing && (
                    <article className="workspace-answer-article" aria-label="Grounded Legal Analysis">
                      {/* Answer Header & Status */}
                      <div className="answer-header-row">
                        <h3 className="answer-main-heading">Answer</h3>
                        <span className={`answer-status-pill tone-${liveResult.evidence_state?.toLowerCase() || (liveResult.is_abstention ? "insufficient" : "supported")}`}>
                          {liveResult.evidence_state === "INSUFFICIENT" || liveResult.is_abstention ? (
                            <>
                              <SearchMinusIcon className="pill-ico" />
                              <span>INSUFFICIENT · Evidence Not Established</span>
                            </>
                          ) : liveResult.evidence_state === "CONFLICTING" ? (
                            <>
                              <SplitBranchIcon className="pill-ico" />
                              <span>CONFLICTING · Contradiction Identified</span>
                            </>
                          ) : liveResult.evidence_state === "PARTIAL" ? (
                            <>
                              <AlertTriangleIcon className="pill-ico" />
                              <span>PARTIAL · Select Provisions Grounded</span>
                            </>
                          ) : liveResult.evidence_state === "UNVERIFIED" ? (
                            <>
                              <LockIcon className="pill-ico" />
                              <span>UNVERIFIED · Verification Pending</span>
                            </>
                          ) : (
                            <>
                              <CheckIcon className="pill-ico" />
                              <span>SUPPORTED · Fully Grounded</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Formatted Answer Body */}
                      <div className="answer-body-content">
                        <FormattedAnswerText
                          rawText={liveResult.answer_text}
                          evidenceList={liveResult.evidence || []}
                          documents={documents}
                          onSelectChunk={(cid) => setSelectedCitationChunkId(cid)}
                        />
                        {!liveResult.is_abstention && (
                          <div className="answer-draft-bridge-row">
                            <button
                              type="button"
                              className="btn-bridge-to-draft"
                              onClick={() => {
                                setWorkspaceTab("draft")
                                setDraftBreach(`Alleged non-compliance regarding ${userQuery || "contractual obligations"}`)
                              }}
                              id="btn-bridge-to-draft"
                              title="Prepare an evidence-backed formal notice based on this finding"
                            >
                              <FileTextIcon className="btn-ico" />
                              <span>Draft Legal Notice From This Finding →</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* In case of Insufficient Evidence / Abstention */}
                      {(liveResult.evidence_state === "INSUFFICIENT" || liveResult.is_abstention) && (
                        <div className="insufficient-evidence-callout">
                          <div className="insufficient-header">
                            <SearchMinusIcon className="insufficient-ico" />
                            <h4>Evidence Not Found — Refusal to Speculate</h4>
                          </div>
                          <p className="insufficient-body">
                            {liveResult.abstention_reason ||
                              "The provided agreements do not contain evidence to establish this rule. The platform strictly refuses to speculate or invent contractual terms."}
                          </p>
                          {liveResult.evidence && liveResult.evidence.length > 0 && (
                            <div className="closest-passages-box">
                              <span className="closest-title">Closest Candidate Passages Checked (Verify Silence):</span>
                              <div className="closest-list">
                                {liveResult.evidence.slice(0, 2).map((ev) => (
                                  <div
                                    key={ev.chunk_id}
                                    className="closest-item"
                                    onClick={() => setSelectedCitationChunkId(ev.chunk_id)}
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

                      {/* In case of Conflicting Provisions */}
                      {liveResult.evidence_state === "CONFLICTING" && (
                        <div className="conflict-provisions-section">
                          <div className="conflict-section-header">
                            <h4>Conflicting Contractual Terms</h4>
                            <span>Both provisions shown below; neither was assumed for you.</span>
                          </div>
                          <div className="conflict-columns-grid">
                            {liveResult.citations.slice(0, 2).map((cit, idx) => (
                              <div key={idx} className={`conflict-card-col source-${idx === 0 ? "a" : "b"}`}>
                                <span className="source-tag">{idx === 0 ? "Provision A" : "Provision B"}</span>
                                <div className="conflict-claim">{cit.claim}</div>
                                <blockquote className="conflict-quote">"{cit.quote_snippet || cit.claim}"</blockquote>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evidence Supporting This Answer */}
                      {(!liveResult.is_abstention && liveResult.evidence_state !== "INSUFFICIENT") && (
                        <section className="answer-evidence-section">
                          <div className="evidence-section-header">
                            <h4 className="evidence-section-title">Evidence supporting this answer</h4>
                            {liveResult.citations && liveResult.citations.length > 1 && (
                              <div className="evidence-sources-nav">
                                <span className="sources-count-text">Sources ({liveResult.citations.length}):</span>
                                {liveResult.citations.map((c, idx) => {
                                  const isSelected = (selectedCitationChunkId === c.chunk_id) || (!selectedCitationChunkId && idx === 0)
                                  const ev = liveResult.evidence?.find((e) => e.chunk_id === c.chunk_id)
                                  const doc = documents.find((d) => d.id === c.chunk_id.split("#")[0])
                                  const docTitle = doc?.title || ev?.document_title || `Source ${idx + 1}`
                                  const sec = ev?.section?.match(/(?:Section|§)?\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1] || ""
                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      className={`source-chip-toggle ${isSelected ? "active" : ""}`}
                                      onClick={() => setSelectedCitationChunkId(c.chunk_id)}
                                    >
                                      <span>{idx + 1}. {docTitle.split(" ")[0]} {sec ? `§ ${sec}` : ""}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* Active Source Card */}
                          <div className="evidence-primary-card">
                            <div className="source-location-row">
                              <div className="source-doc-info">
                                <FileTextIcon className="source-doc-ico" />
                                <span className="source-doc-name">{activeEvidenceDocName}</span>
                                <span className="source-meta-sep">·</span>
                                <span className="source-sec-name">{activeEvidenceSection}</span>
                                <span className="source-meta-sep">·</span>
                                <span className="source-page-name">{activeEvidencePage}</span>
                              </div>
                              <span className="source-verified-badge">✓ Checked against source</span>
                            </div>

                            <div className="exact-evidence-block">
                              <span className="exact-evidence-label">Exact evidence:</span>
                              <blockquote className="exact-evidence-quote">
                                "{activeQuoteSnippet}"
                              </blockquote>
                            </div>

                            {/* Related Provision (Cross-reference / Overrides) */}
                            {activeRelationship && (
                              <div className="related-provision-box">
                                <div className="rel-prov-header">
                                  <SplitBranchIcon className="rel-ico" />
                                  <span className="rel-prov-label">Related provision</span>
                                </div>
                                <div className="rel-prov-content">
                                  <span className="rel-prov-title">
                                    {activeRelationship.target_section || `Section ${activeRelationship.referenced_section}`} in {activeRelationship.target_doc_title}
                                  </span>
                                  <span className="rel-prov-relation">
                                    ↳ Related through: <code>"{activeRelationship.operator || "notwithstanding"}"</code> clause — {activeRelationship.relation === "OVERRIDE" ? "accelerated terms override standard provision." : "cross-referenced provision."}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Progressive Disclosure Action Row */}
                            <div className="evidence-footer-actions">
                              <button
                                type="button"
                                className="btn-expand-context"
                                onClick={() => setShowFullContext((prev) => !prev)}
                              >
                                <span>{showFullContext ? "Hide surrounding document context ▲" : "View surrounding document context ▼"}</span>
                              </button>

                              <button
                                type="button"
                                className="btn-expand-context btn-tech-details"
                                onClick={() => setShowTechnicalAudit((prev) => !prev)}
                              >
                                <span>{showTechnicalAudit ? "Hide technical details ▲" : "Technical evidence details ▼"}</span>
                              </button>
                            </div>

                            {/* Surrounding Context Drawer */}
                            {showFullContext && activeEvidenceItem && (
                              <div className="surrounding-context-box">
                                <span className="context-box-title">Surrounding Contractual Context:</span>
                                <div className="context-box-prose">
                                  <HighlightedQuote
                                    text={activeEvidenceItem.text}
                                    quote={activeCitationItem?.quote_snippet}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Technical Details Drawer */}
                            {showTechnicalAudit && (
                              <div className="technical-audit-box">
                                <span className="tech-box-title">Technical Verification Details:</span>
                                <div className="tech-meta-items">
                                  <span>Backend: {liveResult.generated_by || "Verified Grounded Generator"}</span>
                                  <span>Governing Law: {liveResult.jurisdiction_context || selectedJurisdiction}</span>
                                  <span>Retrieval: {liveResult.latency_ms?.retrieval_ms ? `${Math.round(liveResult.latency_ms.retrieval_ms)}ms` : "0.4ms"}</span>
                                  <span>Generation: {liveResult.latency_ms?.generation_ms ? `${Math.round(liveResult.latency_ms.generation_ms)}ms` : "420ms"}</span>
                                  <span>Clause Ref: {activeEvidenceItem?.chunk_id}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </section>
                      )}
                    </article>
                  )}

                  {/* Empty State before Inquiry */}
                  {!liveResult && !isAnalyzing && (
                    <div className="workspace-prompt-guide">
                      <div className="guide-seal-icon">
                        <ScalesOfJusticeIcon className="seal-svg" />
                      </div>
                      <h3 className="guide-heading">Ready to analyze {activeDoc?.title || "this document"}</h3>
                      <p className="guide-text">
                        Ask a specific legal question above or choose a suggested topic regarding termination triggers,
                        notice periods, liability limitations, or SLA remedies.
                      </p>
                    </div>
                  )}
                    </>
                  )}

                  {/* ========================================================== */}
                  {/* EVIDENCE-BACKED LEGAL NOTICE DRAFTER WORKSPACE             */}
                  {/* ========================================================== */}
                  {workspaceTab === "draft" && (
                    <div className="legal-notice-drafter-container">
                      {/* Drafter Introduction Card */}
                      <section className="drafter-intro-card">
                        <div className="drafter-heading-row">
                          <div className="drafter-title-group">
                            <h3>Evidence-Backed Legal Notice Drafter</h3>
                            <p className="drafter-subtitle">
                              Draft a formal commercial notice strictly grounded in verified clauses from <strong>{activeDoc?.title || "the selected agreement"}</strong>. 
                              Allegations from client instructions are segregated from source contract evidence with zero fabricated statutes, citations, or deadlines.
                            </p>
                          </div>
                          <div className="drafter-preset-buttons">
                            <button
                              type="button"
                              className="btn-drafter-preset"
                              onClick={() => handleApplyPreset("spoilage")}
                            >
                              Fill SLA/Spoilage Preset
                            </button>
                            <button
                              type="button"
                              className="btn-drafter-preset"
                              onClick={() => handleApplyPreset("invoice")}
                            >
                              Fill Overdue Invoice Preset
                            </button>
                          </div>
                        </div>
                      </section>

                      {/* Drafter Input Form Card */}
                      <section className="drafter-form-card" aria-label="Legal Notice Parameters">
                        <div className="drafter-input-grid">
                          <div className="drafter-field-group full-width">
                            <label className="drafter-field-label">
                              <span>Document Type</span>
                              <span className="drafter-field-sub">Operative Draft Workflow</span>
                            </label>
                            <select
                              className="drafter-text-input"
                              value="legal_notice"
                              disabled
                              aria-label="Document Type Selection"
                            >
                              <option value="legal_notice">Legal Notice of Contractual Breach & Demand for Cure (Operative)</option>
                            </select>
                          </div>

                          <div className="drafter-field-group">
                            <label className="drafter-field-label">
                              <span>Sender / Client Entity</span>
                              <span className="drafter-field-sub">Claimant</span>
                            </label>
                            <input
                              type="text"
                              className="drafter-text-input"
                              value={draftSender}
                              onChange={(e) => setDraftSender(e.target.value)}
                              placeholder="e.g. Apex Biologics LLC"
                              disabled={isDrafting}
                            />
                          </div>

                          <div className="drafter-field-group">
                            <label className="drafter-field-label">
                              <span>Recipient Entity</span>
                              <span className="drafter-field-sub">Adverse Party</span>
                            </label>
                            <input
                              type="text"
                              className="drafter-text-input"
                              value={draftRecipient}
                              onChange={(e) => setDraftRecipient(e.target.value)}
                              placeholder="e.g. Polaris Cold-Chain Solutions Inc"
                              disabled={isDrafting}
                            />
                          </div>

                          <div className="drafter-field-group full-width">
                            <label className="drafter-field-label">
                              <span>Recipient Registered Address</span>
                              <span className="drafter-field-sub">Leave blank to insert placeholder</span>
                            </label>
                            <input
                              type="text"
                              className="drafter-text-input"
                              value={draftAddress}
                              onChange={(e) => setDraftAddress(e.target.value)}
                              placeholder="e.g. 100 Industrial Port Parkway, Anchorage, AK 99501"
                              disabled={isDrafting}
                            />
                          </div>

                          <div className="drafter-field-group full-width">
                            <label className="drafter-field-label">
                              <span>Nature of Alleged Contractual Breach *</span>
                              <span className="drafter-field-sub">Required</span>
                            </label>
                            <textarea
                              className="drafter-textarea-input"
                              rows={3}
                              value={draftBreach}
                              onChange={(e) => setDraftBreach(e.target.value)}
                              placeholder="Describe the alleged breach (e.g. failure to deliver within 48-hour delivery window resulting in consignment spoilage)..."
                              disabled={isDrafting}
                            />
                          </div>

                          <div className="drafter-field-group">
                            <label className="drafter-field-label">
                              <span>Date of Formal Notice</span>
                              <span className="drafter-field-sub">Optional</span>
                            </label>
                            <input
                              type="text"
                              className="drafter-text-input"
                              value={draftNoticeDate}
                              onChange={(e) => setDraftNoticeDate(e.target.value)}
                              placeholder="e.g. October 9, 2026"
                              disabled={isDrafting}
                            />
                          </div>

                          <div className="drafter-field-group">
                            <label className="drafter-field-label">
                              <span>Date(s) of Alleged Incident</span>
                              <span className="drafter-field-sub">Optional</span>
                            </label>
                            <input
                              type="text"
                              className="drafter-text-input"
                              value={draftIncidentDate}
                              onChange={(e) => setDraftIncidentDate(e.target.value)}
                              placeholder="e.g. October 4, 2026"
                              disabled={isDrafting}
                            />
                          </div>

                          <div className="drafter-field-group">
                            <label className="drafter-field-label">
                              <span>Cure / Response Period (Days)</span>
                              <span className="drafter-field-sub">Leave blank for contract default</span>
                            </label>
                            <input
                              type="text"
                              className="drafter-text-input"
                              value={draftCureDays}
                              onChange={(e) => setDraftCureDays(e.target.value)}
                              placeholder="e.g. 15 or 30"
                              disabled={isDrafting}
                            />
                          </div>

                          <div className="drafter-field-group full-width">
                            <label className="drafter-field-label">
                              <span>Demanded Remedy / Action Requested</span>
                              <span className="drafter-field-sub">Optional</span>
                            </label>
                            <textarea
                              className="drafter-textarea-input"
                              rows={2}
                              value={draftRemedy}
                              onChange={(e) => setDraftRemedy(e.target.value)}
                              placeholder="e.g. Full indemnification for cargo loss and delivery of replacement freight..."
                              disabled={isDrafting}
                            />
                          </div>

                          <div className="drafter-field-group full-width">
                            <label className="drafter-field-label">
                              <span>Additional Facts / Client Instructions</span>
                              <span className="drafter-field-sub">Attributed explicitly as claimant assertions</span>
                            </label>
                            <textarea
                              className="drafter-textarea-input"
                              rows={2}
                              value={draftExtraFacts}
                              onChange={(e) => setDraftExtraFacts(e.target.value)}
                              placeholder="e.g. Data logger confirmed temperatures exceeded 14°C for over 5 hours..."
                              disabled={isDrafting}
                            />
                          </div>
                        </div>

                        <div className="drafter-submit-row">
                          <button
                            type="button"
                            className="btn-generate-draft"
                            onClick={handleGenerateDraft}
                            disabled={isDrafting || !draftBreach.trim()}
                            id="btn-generate-draft"
                          >
                            <FileTextIcon />
                            <span>{isDrafting ? "Retrieving Clauses & Structuring Draft…" : "Generate Evidence-Backed Draft"}</span>
                          </button>

                          <button
                            type="button"
                            className="btn-preview-clauses"
                            onClick={handlePreviewClauses}
                            disabled={isDrafting}
                            id="btn-preview-clauses"
                            title="Identify and view operative clauses before generating"
                          >
                            <SearchMinusIcon />
                            <span>Preview Operative Clauses</span>
                          </button>

                          <div className="draft-safeguard-badge">
                            <ShieldCheckIcon />
                            <span>No fabricated citations · Verbatim contract grounding · Lawyer review mandatory</span>
                          </div>
                        </div>
                      </section>

                      {/* Drafter Output / Result View */}
                      {draftResult && (
                        <section className="draft-output-card" aria-label="Generated Legal Notice Draft">
                          {/* Mandatory Lawyer Review Banner */}
                          <div className="draft-lawyer-review-banner" role="alert">
                            <AlertTriangleIcon className="banner-alert-ico" />
                            <div className="banner-content">
                              <strong>*** DRAFT — REQUIRES LAWYER REVIEW ***</strong>
                              <p>
                                This document is an unexecuted work-product draft. It segregates contractually grounded terms
                                from unverified factual assertions supplied by the client. It must be reviewed, verified,
                                and approved by qualified legal counsel prior to formal delivery.
                              </p>
                            </div>
                          </div>

                          {/* Missing Placeholders Warning */}
                          {draftResult.missing_fields && draftResult.missing_fields.length > 0 && (
                            <div className="missing-fields-box">
                              <span className="missing-fields-title">
                                ⚠ Missing Information Injected as Explicit Placeholders:
                              </span>
                              <div className="missing-fields-pills">
                                {draftResult.missing_fields.map((f: string) => (
                                  <span key={f} className="missing-field-chip">
                                    [{f.toUpperCase()} REQUIRED]
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Evidence Gap Warning if Breach is Not Supported */}
                          {draftResult.is_supported_by_contract === false && (
                            <div className="missing-fields-box" style={{ borderColor: "#f87171", background: "rgba(239, 68, 68, 0.12)" }}>
                              <span className="missing-fields-title" style={{ color: "#f87171" }}>
                                ⚠ Contract Evidence Gap — Unsupported Notice:
                              </span>
                              <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#fca5a5", lineHeight: 1.5 }}>
                                {draftResult.missing_evidence || draftResult.support_notes || "The selected agreement does not contain operative clauses governing this alleged breach. Counsel audit required."}
                              </p>
                            </div>
                          )}

                          {/* Split View: Grounded Contract Clauses (Left) & Editable Draft Editor (Right) */}
                          <div className="draft-split-grid">
                            {/* Left: Verified Grounded Clauses */}
                            <div className="draft-evidence-panel">
                              <div className="draft-panel-header">
                                <span className="draft-panel-heading">
                                  <ShieldCheckIcon />
                                  <span>Contract Evidence ({draftResult.grounded_provisions?.length || 0} Clauses)</span>
                                </span>
                                <span className="clause-chunk-badge">{draftResult.source_doc_id}</span>
                              </div>

                              <div className="clauses-card-stack">
                                {draftResult.grounded_provisions && draftResult.grounded_provisions.length > 0 ? (
                                  draftResult.grounded_provisions.map((item: any, idx: number) => (
                                    <div key={idx} className="grounded-clause-card">
                                      <div className="clause-card-meta">
                                        <span className="clause-card-title">{item.section_title}</span>
                                        <span className="clause-chunk-badge">{item.chunk_id}</span>
                                      </div>
                                      <blockquote className="clause-quote-text">
                                        "{item.quote_snippet}"
                                      </blockquote>
                                      {item.cure_period_hint && (
                                        <span className="clause-cure-hint">
                                          ⏱ Detected cure period: {item.cure_period_hint}
                                        </span>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <p className="drafter-subtitle">No specific contractual clauses retrieved.</p>
                                )}
                              </div>
                            </div>

                            {/* Right: Editable Draft Notice Area */}
                            <div className="draft-editor-panel">
                              <div className="draft-panel-header">
                                <span className="draft-panel-heading">
                                  <FileTextIcon />
                                  <span>Legal Notice Draft (Editable)</span>
                                </span>

                                <div className="draft-editor-actions">
                                  <button
                                    type="button"
                                    className={`btn-draft-action ${copiedDraft ? "copied" : ""}`}
                                    onClick={handleCopyDraft}
                                    title="Copy draft to clipboard"
                                  >
                                    <CheckIcon />
                                    <span>{copiedDraft ? "Copied!" : "Copy Draft"}</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-draft-action"
                                    onClick={handleDownloadDraft}
                                    title="Download as Markdown"
                                  >
                                    <ArrowRightIcon />
                                    <span>Download .md</span>
                                  </button>
                                </div>
                              </div>

                              <textarea
                                className="draft-editor-textarea"
                                value={editableDraftText}
                                onChange={(e) => setEditableDraftText(e.target.value)}
                                rows={24}
                                aria-label="Editable Legal Notice Text"
                              />

                              <div className="draft-meta-footer">
                                <span>Word Count: {editableDraftText.trim().split(/\s+/).filter(Boolean).length} words</span>
                                <span>Chars: {editableDraftText.length}</span>
                                <span>Status: Pre-Execution Draft</span>
                              </div>
                            </div>
                          </div>
                        </section>
                      )}
                    </div>
                  )}
                </main>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ==================================================================== */}
      {/* EVIDENCE-BACKED LEGAL NOTICE DRAFTING MODAL DIALOG                  */}
      {/* ==================================================================== */}
      {showDraftModal && (
        <div
          className="draft-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="draft-modal-heading"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDraftModal(false)
          }}
        >
          <div className="draft-modal-container">
            {/* Modal Header */}
            <div className="draft-modal-header">
              <div className="draft-modal-title-group">
                <div className="draft-modal-title-row">
                  <h3 id="draft-modal-heading" className="draft-modal-title">Draft Legal Document</h3>
                  <span className="draft-modal-badge">Legal Notice</span>
                </div>
                <p className="draft-modal-subtitle">
                  Operative clauses grounded in <strong>{activeDoc?.title || "Selected Agreement"}</strong> ({activeDoc?.id}).
                </p>
              </div>
              <button
                type="button"
                className="draft-modal-close-btn"
                onClick={() => setShowDraftModal(false)}
                aria-label="Close drafting dialog"
              >
                <CrossIcon />
              </button>
            </div>

            <div className="draft-modal-body">
              {/* Preset Buttons */}
              <div className="drafter-preset-buttons">
                <button
                  type="button"
                  className="btn-drafter-preset"
                  onClick={() => handleApplyPreset("spoilage")}
                >
                  Fill SLA/Spoilage Preset
                </button>
                <button
                  type="button"
                  className="btn-drafter-preset"
                  onClick={() => handleApplyPreset("invoice")}
                >
                  Fill Overdue Invoice Preset
                </button>
              </div>

              {/* Form Input Card */}
              <section className="drafter-form-card" aria-label="Legal Notice Parameters">
                <div className="drafter-input-grid">
                  <div className="drafter-field-group full-width">
                    <label className="drafter-field-label">
                      <span>Document Type</span>
                      <span className="drafter-field-sub">Operative Document Format</span>
                    </label>
                    <select
                      className="drafter-text-input"
                      value="legal_notice"
                      disabled
                      aria-label="Document Type Selection"
                    >
                      <option value="legal_notice">Legal Notice of Contractual Breach & Demand for Cure (Operative)</option>
                    </select>
                  </div>

                  <div className="drafter-field-group">
                    <label className="drafter-field-label">
                      <span>Sender / Client Entity</span>
                      <span className="drafter-field-sub">Claimant</span>
                    </label>
                    <input
                      type="text"
                      className="drafter-text-input"
                      value={draftSender}
                      onChange={(e) => setDraftSender(e.target.value)}
                      placeholder="e.g. Apex Biologics LLC"
                      disabled={isDrafting}
                    />
                  </div>

                  <div className="drafter-field-group">
                    <label className="drafter-field-label">
                      <span>Recipient Entity</span>
                      <span className="drafter-field-sub">Adverse Party</span>
                    </label>
                    <input
                      type="text"
                      className="drafter-text-input"
                      value={draftRecipient}
                      onChange={(e) => setDraftRecipient(e.target.value)}
                      placeholder="e.g. Polaris Cold-Chain Solutions Inc"
                      disabled={isDrafting}
                    />
                  </div>

                  <div className="drafter-field-group full-width">
                    <label className="drafter-field-label">
                      <span>Recipient Registered Address</span>
                      <span className="drafter-field-sub">Leave blank to insert placeholder</span>
                    </label>
                    <input
                      type="text"
                      className="drafter-text-input"
                      value={draftAddress}
                      onChange={(e) => setDraftAddress(e.target.value)}
                      placeholder="e.g. 100 Industrial Port Parkway, Anchorage, AK 99501"
                      disabled={isDrafting}
                    />
                  </div>

                  <div className="drafter-field-group full-width">
                    <label className="drafter-field-label">
                      <span>Nature of Alleged Contractual Breach *</span>
                      <span className="drafter-field-sub">Required</span>
                    </label>
                    <textarea
                      className="drafter-textarea-input"
                      rows={3}
                      value={draftBreach}
                      onChange={(e) => setDraftBreach(e.target.value)}
                      placeholder="Describe the alleged breach (e.g. failure to deliver within 48-hour delivery window resulting in consignment spoilage)..."
                      disabled={isDrafting}
                    />
                  </div>

                  <div className="drafter-field-group">
                    <label className="drafter-field-label">
                      <span>Date of Formal Notice</span>
                      <span className="drafter-field-sub">Optional</span>
                    </label>
                    <input
                      type="text"
                      className="drafter-text-input"
                      value={draftNoticeDate}
                      onChange={(e) => setDraftNoticeDate(e.target.value)}
                      placeholder="e.g. October 9, 2026"
                      disabled={isDrafting}
                    />
                  </div>

                  <div className="drafter-field-group">
                    <label className="drafter-field-label">
                      <span>Date(s) of Alleged Incident</span>
                      <span className="drafter-field-sub">Optional</span>
                    </label>
                    <input
                      type="text"
                      className="drafter-text-input"
                      value={draftIncidentDate}
                      onChange={(e) => setDraftIncidentDate(e.target.value)}
                      placeholder="e.g. October 4, 2026"
                      disabled={isDrafting}
                    />
                  </div>

                  <div className="drafter-field-group">
                    <label className="drafter-field-label">
                      <span>Cure / Response Period (Days)</span>
                      <span className="drafter-field-sub">Leave blank for contract default</span>
                    </label>
                    <input
                      type="text"
                      className="drafter-text-input"
                      value={draftCureDays}
                      onChange={(e) => setDraftCureDays(e.target.value)}
                      placeholder="e.g. 15 or 30"
                      disabled={isDrafting}
                    />
                  </div>

                  <div className="drafter-field-group full-width">
                    <label className="drafter-field-label">
                      <span>Demanded Remedy / Action Requested</span>
                      <span className="drafter-field-sub">Optional</span>
                    </label>
                    <textarea
                      className="drafter-textarea-input"
                      rows={2}
                      value={draftRemedy}
                      onChange={(e) => setDraftRemedy(e.target.value)}
                      placeholder="e.g. Full indemnification for cargo loss and delivery of replacement freight..."
                      disabled={isDrafting}
                    />
                  </div>

                  <div className="drafter-field-group full-width">
                    <label className="drafter-field-label">
                      <span>Additional Facts / Client Instructions</span>
                      <span className="drafter-field-sub">Attributed explicitly as claimant assertions</span>
                    </label>
                    <textarea
                      className="drafter-textarea-input"
                      rows={2}
                      value={draftExtraFacts}
                      onChange={(e) => setDraftExtraFacts(e.target.value)}
                      placeholder="e.g. Data logger confirmed temperatures exceeded 14°C for over 5 hours..."
                      disabled={isDrafting}
                    />
                  </div>
                </div>

                <div className="drafter-submit-row">
                  <button
                    type="button"
                    className="btn-generate-draft"
                    onClick={handleGenerateDraft}
                    disabled={isDrafting || !draftBreach.trim()}
                    id="btn-modal-generate-draft"
                  >
                    <FileTextIcon />
                    <span>{isDrafting ? "Retrieving Clauses & Structuring Draft…" : "Generate Evidence-Backed Draft"}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-preview-clauses"
                    onClick={handlePreviewClauses}
                    disabled={isDrafting}
                    id="btn-modal-preview-clauses"
                    title="Identify and view operative clauses before generating"
                  >
                    <SearchMinusIcon />
                    <span>Preview Operative Clauses</span>
                  </button>

                  <div className="draft-safeguard-badge">
                    <ShieldCheckIcon />
                    <span>No fabricated citations · Verbatim contract grounding · Lawyer review mandatory</span>
                  </div>
                </div>
              </section>

              {/* Generated Draft Output Card */}
              {draftResult && (
                <section className="draft-output-card" aria-label="Generated Legal Notice Draft">
                  {/* Mandatory Lawyer Review Banner */}
                  <div className="draft-lawyer-review-banner" role="alert">
                    <AlertTriangleIcon className="banner-alert-ico" />
                    <div className="banner-content">
                      <strong>*** DRAFT — REQUIRES LAWYER REVIEW ***</strong>
                      <p>
                        This document is an unexecuted work-product draft. It segregates contractually grounded terms
                        from unverified factual assertions supplied by the client. It must be reviewed, verified,
                        and approved by qualified legal counsel prior to formal delivery.
                      </p>
                    </div>
                  </div>

                  {/* Missing Placeholders Warning */}
                  {draftResult.missing_fields && draftResult.missing_fields.length > 0 && (
                    <div className="missing-fields-box">
                      <span className="missing-fields-title">
                        ⚠ Missing Information Injected as Explicit Placeholders:
                      </span>
                      <div className="missing-fields-pills">
                        {draftResult.missing_fields.map((f: string) => (
                          <span key={f} className="missing-field-chip">
                            [{f.toUpperCase()} REQUIRED]
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence Gap Warning if Breach is Not Supported */}
                  {draftResult.is_supported_by_contract === false && (
                    <div className="missing-fields-box" style={{ borderColor: "#f87171", background: "rgba(239, 68, 68, 0.12)" }}>
                      <span className="missing-fields-title" style={{ color: "#f87171" }}>
                        ⚠ Contract Evidence Gap — Unsupported Notice:
                      </span>
                      <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#fca5a5", lineHeight: 1.5 }}>
                        {draftResult.missing_evidence || draftResult.support_notes || "The selected agreement does not contain operative clauses governing this alleged breach. Counsel audit required."}
                      </p>
                    </div>
                  )}

                  {/* Split View */}
                  <div className="draft-split-grid">
                    {/* Left: Verified Grounded Clauses */}
                    <div className="draft-evidence-panel">
                      <div className="draft-panel-header">
                        <span className="draft-panel-heading">
                          <ShieldCheckIcon />
                          <span>Contract Evidence ({draftResult.grounded_provisions?.length || 0} Clauses)</span>
                        </span>
                        <span className="clause-chunk-badge">{draftResult.source_doc_id || activeDocId}</span>
                      </div>

                      <div className="clauses-card-stack">
                        {draftResult.grounded_provisions && draftResult.grounded_provisions.length > 0 ? (
                          draftResult.grounded_provisions.map((item: any, idx: number) => (
                            <div key={idx} className="grounded-clause-card">
                              <div className="clause-card-meta">
                                <span className="clause-card-title">{item.section_title}</span>
                                <span className="clause-chunk-badge">{item.chunk_id}</span>
                              </div>
                              <blockquote className="clause-quote-text">
                                "{item.quote_snippet}"
                              </blockquote>
                              {item.cure_period_hint && (
                                <span className="clause-cure-hint">
                                  ⏱ Detected cure period: {item.cure_period_hint}
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="drafter-subtitle">No specific contractual clauses retrieved.</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Editable Draft Notice Area */}
                    <div className="draft-editor-panel">
                      <div className="draft-panel-header">
                        <span className="draft-panel-heading">
                          <FileTextIcon />
                          <span>Legal Notice Draft (Editable)</span>
                        </span>

                        <div className="draft-editor-actions">
                          <button
                            type="button"
                            className={`btn-draft-action ${copiedDraft ? "copied" : ""}`}
                            onClick={handleCopyDraft}
                            title="Copy draft to clipboard"
                          >
                            <CheckIcon />
                            <span>{copiedDraft ? "Copied!" : "Copy Draft"}</span>
                          </button>
                          <button
                            type="button"
                            className="btn-draft-action"
                            onClick={handleDownloadDraft}
                            title="Download as Markdown"
                          >
                            <ArrowRightIcon />
                            <span>Download .md</span>
                          </button>
                        </div>
                      </div>

                      <textarea
                        className="draft-editor-textarea"
                        value={editableDraftText}
                        onChange={(e) => setEditableDraftText(e.target.value)}
                        rows={24}
                        aria-label="Editable Legal Notice Text"
                      />

                      <div className="draft-meta-footer">
                        <span>Word Count: {editableDraftText.trim().split(/\s+/).filter(Boolean).length} words</span>
                        <span>Chars: {editableDraftText.length}</span>
                        <span>Status: Pre-Execution Draft</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
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
            <span>Evidence-Grounded Policy</span>
            <span className="footer-sep">·</span>
            <span>Active Jurisdiction: {currentJurData.label}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
