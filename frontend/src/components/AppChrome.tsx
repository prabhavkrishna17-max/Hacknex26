import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion } from "framer-motion"

/*
 * Application chrome: grouped sidebar navigation (drawer on small screens) and a top
 * context bar with breadcrumbs. Navigation ids are kept stable (nav-tab-*) because
 * demo scripts and tests address them.
 */

export type AppView = "landing" | "overview" | "matters" | "workspace" | "drafting" | "tasks"

type IconName = "overview" | "matters" | "workspace" | "drafting" | "tasks" | "landing" | "menu" | "close"

export function NavIcon({ name }: { name: IconName }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true }
  switch (name) {
    case "overview":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7.5" height="8" rx="1.5" />
          <rect x="13.5" y="3" width="7.5" height="5" rx="1.5" />
          <rect x="13.5" y="11" width="7.5" height="10" rx="1.5" />
          <rect x="3" y="14" width="7.5" height="7" rx="1.5" />
        </svg>
      )
    case "matters":
      return (
        <svg {...common}>
          <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v9A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5z" />
        </svg>
      )
    case "workspace":
      return (
        <svg {...common}>
          <path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z" />
          <path d="M14 3v5h5" />
          <circle cx="11.5" cy="14" r="2.6" />
          <path d="m13.5 16 2 2" />
        </svg>
      )
    case "drafting":
      return (
        <svg {...common}>
          <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" />
          <path d="m14.5 7.5 3 3" />
        </svg>
      )
    case "tasks":
      return (
        <svg {...common}>
          <path d="m4 7 2 2 3.5-3.5" />
          <path d="M12 7.5h8" />
          <path d="m4 15 2 2 3.5-3.5" />
          <path d="M12 15.5h8" />
        </svg>
      )
    case "landing":
      return (
        <svg {...common}>
          <path d="M12 4v16M7 20h10M5 7h14" />
          <path d="M5 7 2.5 13h5zM19 7l-2.5 6h5z" />
          <path d="M2.5 13a2.5 2.5 0 0 0 5 0M16.5 13a2.5 2.5 0 0 0 5 0" />
        </svg>
      )
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      )
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      )
  }
}

function BrandMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round">
      <line x1="24" y1="8" x2="24" y2="40" strokeWidth="2.5" />
      <line x1="14" y1="40" x2="34" y2="40" strokeWidth="2.5" />
      <line x1="8" y1="14" x2="40" y2="14" strokeWidth="2.5" />
      <path d="M8 14 4 26h8zM40 14l-4 12h8z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 26q4 4 8 0M36 26q4 4 8 0" strokeWidth="1.8" />
    </svg>
  )
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => (typeof window !== "undefined" ? window.matchMedia(query).matches : false))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(window.matchMedia(query).matches)
    mq.addEventListener("change", onChange)
    // Fallback: some environments (devtools emulation, older engines) skip MediaQueryList events
    window.addEventListener("resize", onChange)
    return () => {
      mq.removeEventListener("change", onChange)
      window.removeEventListener("resize", onChange)
    }
  }, [query])
  return matches
}

const NAV_GROUPS: { label: string; items: { view: AppView; label: string; id: string; icon: IconName }[] }[] = [
  { label: "Command", items: [{ view: "overview", label: "Command Centre", id: "nav-tab-smart-workspace", icon: "overview" }] },
  {
    label: "Legal work",
    items: [
      { view: "matters", label: "Matters", id: "nav-tab-matters", icon: "matters" },
      { view: "workspace", label: "Contract Workspace", id: "nav-tab-workspace", icon: "workspace" },
      { view: "drafting", label: "Legal Drafting", id: "nav-tab-drafting", icon: "drafting" },
      { view: "tasks", label: "Tasks & Deadlines", id: "nav-tab-tasks", icon: "tasks" },
    ],
  },
  { label: "Product", items: [{ view: "landing", label: "Overview & Principles", id: "nav-tab-overview", icon: "landing" }] },
]

export function AppSidebar({
  view,
  onNavigate,
  documentCount,
  documentsLive,
  mobileOpen,
  onCloseMobile,
}: {
  view: AppView
  onNavigate: (v: AppView) => void
  documentCount: number
  documentsLive: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const isDrawer = useMediaQuery("(max-width: 860px)")
  const firstItemRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isDrawer || !mobileOpen) return
    firstItemRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isDrawer, mobileOpen, onCloseMobile])

  const go = (v: AppView) => {
    onNavigate(v)
    if (isDrawer) onCloseMobile()
  }

  const body = (
    <>
      <div className="hnx-sidebar-top">
        <button type="button" className="hnx-brand" onClick={() => go("landing")} aria-label="HNX Legal Intelligence — Overview & Principles">
          <span className="hnx-brand-mark">
            <BrandMark />
          </span>
          <span className="hnx-brand-text">
            <span className="hnx-brand-name">HNX Legal Intelligence</span>
            <span className="hnx-brand-sub">Evidence-grounded review</span>
          </span>
        </button>
        {isDrawer && (
          <button type="button" className="hnx-icon-btn" onClick={onCloseMobile} aria-label="Close navigation">
            <NavIcon name="close" />
          </button>
        )}
      </div>

      <nav className="hnx-nav" aria-label="Main navigation">
        {NAV_GROUPS.map((g, gi) => (
          <div key={g.label} className="hnx-nav-group">
            <span className="hnx-nav-label">{g.label}</span>
            <ul>
              {g.items.map((it, ii) => {
                const active = view === it.view
                const ref = gi === 0 && ii === 0 ? firstItemRef : undefined
                return (
                  <li key={it.id}>
                    <button
                      ref={ref}
                      type="button"
                      id={it.id}
                      className={`hnx-nav-item ${active ? "active" : ""}`}
                      aria-current={active ? "page" : undefined}
                      title={it.label}
                      onClick={() => go(it.view)}
                    >
                      {active && <motion.span layoutId="hnx-nav-active" className="hnx-nav-active-bg" transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} />}
                      <span className="hnx-nav-icon">
                        <NavIcon name={it.icon} />
                      </span>
                      <span className="hnx-nav-text">{it.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="hnx-sidebar-foot">
        <div className="hnx-status-line" role="status">
          <span className={`hnx-status-dot ${documentsLive ? "live" : "offline"}`} aria-hidden="true" />
          <span>
            {documentsLive ? `${documentCount} documents indexed` : "Backend offline · sample list"}
          </span>
        </div>
        <p className="hnx-sidebar-note">Matters &amp; tasks are stored in this browser only.</p>
      </div>
    </>
  )

  if (!isDrawer) {
    return <aside className="hnx-sidebar">{body}</aside>
  }

  // Drawer: always mounted, slid with CSS transitions (time-based, so it never sticks
  // off-screen when animation frames are throttled); inert while closed.
  return (
    <>
      <div className={`hnx-drawer-backdrop ${mobileOpen ? "open" : ""}`} onClick={onCloseMobile} aria-hidden="true" />
      <aside
        className={`hnx-sidebar hnx-sidebar-drawer ${mobileOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        {body}
      </aside>
    </>
  )
}

export function AppTopBar({ crumbs, onOpenMenu, children }: { crumbs: string[]; onOpenMenu: () => void; children?: ReactNode }) {
  return (
    <header className="hnx-topbar" role="banner">
      <button type="button" className="hnx-icon-btn hnx-menu-btn" onClick={onOpenMenu} aria-label="Open navigation">
        <NavIcon name="menu" />
      </button>
      <nav className="hnx-breadcrumb" aria-label="Breadcrumb">
        <ol>
          {crumbs.map((c, i) => (
            <li key={i} aria-current={i === crumbs.length - 1 ? "page" : undefined}>
              {c}
            </li>
          ))}
        </ol>
      </nav>
      <div className="hnx-topbar-tools">{children}</div>
    </header>
  )
}

/** Reusable page header: eyebrow · title · description · actions. */
export function PageHeader({ eyebrow, title, description, actions, id }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode; id?: string }) {
  return (
    <header className="hnx-page-header">
      <div className="hnx-page-header-text">
        {eyebrow && <span className="hnx-eyebrow">{eyebrow}</span>}
        <h1 id={id} className="hnx-page-title">
          {title}
        </h1>
        {description && <p className="hnx-page-desc">{description}</p>}
      </div>
      {actions && <div className="hnx-page-actions">{actions}</div>}
    </header>
  )
}
