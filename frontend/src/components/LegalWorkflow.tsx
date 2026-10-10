import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { PageHeader } from "./AppChrome"
import { SignatureScale } from "./SignatureScale"
import { disclosure, fadeUpItem, staggerContainer } from "../motion"
import "./LegalWorkflow.css"

/*
 * Prototype legal-workflow layer: matters, tasks/deadlines and draft review tracking.
 *
 * PERSISTENCE: browser localStorage only (this device, this browser). Only non-sensitive
 * metadata is stored — titles, references, statuses, dates, notes and document IDs.
 * Full legal documents and draft texts are never written to localStorage.
 * Nothing here is synchronized between lawyers or devices.
 */

export type MatterStatus = "Open" | "On hold" | "Closed"
export type TaskStatus = "To do" | "In progress" | "Done"
export type ReviewState = "Pending review" | "Changes requested" | "Approved"

export interface Matter {
  id: string
  title: string
  reference: string
  client: string
  matterType: string
  status: MatterStatus
  notes: string
  docIds: string[]
  createdAt: string
}

export interface Task {
  id: string
  title: string
  matterId: string
  dueDate: string // YYYY-MM-DD or ""
  status: TaskStatus
  review: ReviewState | ""
  notes: string
  createdAt: string
}

export interface DraftRecord {
  id: string
  docId: string
  docTitle: string
  recipient: string
  matterId: string
  status: ReviewState
  reviewNotes: string
  updatedAt: string
}

export interface WorkflowDoc {
  id: string
  title: string
}

interface WorkflowState {
  matters: Matter[]
  tasks: Task[]
  drafts: DraftRecord[]
}

const STORAGE_KEY = "hnx.prototype.workflow.v1"
const TASK_STATUSES: TaskStatus[] = ["To do", "In progress", "Done"]
const REVIEW_STATES: ReviewState[] = ["Pending review", "Changes requested", "Approved"]
const MATTER_STATUSES: MatterStatus[] = ["Open", "On hold", "Closed"]
const MATTER_TYPES = ["Commercial contract", "Dispute / breach", "Data protection", "Employment", "Regulatory", "Other"]

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function loadState(): WorkflowState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        matters: Array.isArray(parsed.matters) ? parsed.matters : [],
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        drafts: Array.isArray(parsed.drafts) ? parsed.drafts : [],
      }
    }
  } catch {
    // Storage unavailable or corrupt: start empty.
  }
  return { matters: [], tasks: [], drafts: [] }
}

export function todayISO(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

export function isOverdue(t: Task): boolean {
  return !!t.dueDate && t.status !== "Done" && t.dueDate < todayISO()
}

function daysUntil(dateISO: string): number {
  const [y, m, d] = dateISO.split("-").map(Number)
  const due = new Date(y, m - 1, d).getTime()
  const [ty, tm, td] = todayISO().split("-").map(Number)
  const today = new Date(ty, tm - 1, td).getTime()
  return Math.round((due - today) / 86400000)
}

export function useWorkflowStore() {
  const [state, setState] = useState<WorkflowState>(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore quota / private-mode failures; state still works for this session.
    }
  }, [state])

  return {
    ...state,
    addMatter: (m: Omit<Matter, "id" | "createdAt">) => {
      const matter: Matter = { ...m, id: newId("MAT"), createdAt: new Date().toISOString() }
      setState((s) => ({ ...s, matters: [matter, ...s.matters] }))
      return matter.id
    },
    updateMatter: (id: string, patch: Partial<Matter>) =>
      setState((s) => ({ ...s, matters: s.matters.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
    addTask: (t: Omit<Task, "id" | "createdAt">) =>
      setState((s) => ({ ...s, tasks: [{ ...t, id: newId("TSK"), createdAt: new Date().toISOString() }, ...s.tasks] })),
    updateTask: (id: string, patch: Partial<Task>) =>
      setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
    deleteTask: (id: string) => setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
    addDraft: (d: Omit<DraftRecord, "id" | "updatedAt">) =>
      setState((s) => ({ ...s, drafts: [{ ...d, id: newId("DRF"), updatedAt: new Date().toISOString() }, ...s.drafts] })),
    updateDraft: (id: string, patch: Partial<DraftRecord>) =>
      setState((s) => ({
        ...s,
        drafts: s.drafts.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)),
      })),
  }
}

export type WorkflowStore = ReturnType<typeof useWorkflowStore>

export function PrototypeStorageNote() {
  return (
    <p className="wf-proto-note" role="note">
      <strong>Prototype:</strong> matters, tasks and review records are saved only in this browser (localStorage) as
      metadata. Document and draft text is never stored here, and nothing is shared or synchronized with other users or
      devices.
    </p>
  )
}

function ReviewBadge({ state }: { state: ReviewState | "" }) {
  if (!state) return <span className="wf-badge wf-badge-muted">No review</span>
  const cls =
    state === "Approved" ? "wf-badge-ok" : state === "Changes requested" ? "wf-badge-warn" : "wf-badge-pending"
  return <span className={`wf-badge ${cls}`}>{state}</span>
}

/* ======================================================================== */
/* SMART WORKSPACE OVERVIEW                                                  */
/* ======================================================================== */

export function OverviewPage({
  store,
  documents,
  documentsLive,
  onNewMatter,
  onAnalyze,
  onDraftNotice,
  onOpenTasks,
  onOpenMatter,
}: {
  store: WorkflowStore
  documents: WorkflowDoc[]
  documentsLive: boolean
  onNewMatter: () => void
  onAnalyze: () => void
  onDraftNotice: () => void
  onOpenTasks: () => void
  onOpenMatter: (id: string) => void
}) {
  const openMatters = store.matters.filter((m) => m.status !== "Closed")
  const upcoming = store.tasks
    .filter((t) => t.dueDate && t.status !== "Done" && daysUntil(t.dueDate) >= 0 && daysUntil(t.dueDate) <= 14)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const overdue = store.tasks.filter(isOverdue)
  const pendingTaskReviews = store.tasks.filter((t) => t.review === "Pending review" || t.review === "Changes requested")
  const pendingDraftReviews = store.drafts.filter((d) => d.status !== "Approved")
  const pendingReviewCount = pendingTaskReviews.length + pendingDraftReviews.length

  return (
    <main className="wf-page" aria-labelledby="wf-overview-title">
      <section className="hnx-hero" aria-labelledby="wf-overview-title">
        <div className="hnx-hero-copy">
          <span className="hnx-eyebrow">Command Centre</span>
          <h1 id="wf-overview-title" className="hnx-hero-title">
            Every answer carries its evidence.
          </h1>
          <p className="hnx-hero-desc">
            Analyse unfamiliar contracts with quoted, section-level evidence, see the exceptions that change a rule, and get a
            clear “not in this document” when the evidence isn't there.
          </p>
          <div className="wf-actions">
            <button type="button" className="wf-btn wf-btn-primary" onClick={onAnalyze}>Analyze a document</button>
            <button type="button" className="wf-btn" onClick={onNewMatter}>New matter</button>
            <button type="button" className="wf-btn" onClick={onDraftNotice}>Draft a legal notice</button>
          </div>
        </div>
        <div className="hnx-hero-visual">
          <SignatureScale />
        </div>
      </section>

      {store.matters.length === 0 && store.tasks.length === 0 && (
        <section className="wf-card hnx-onboarding" aria-labelledby="wf-onboarding-h">
          <h2 id="wf-onboarding-h">Get started in three steps</h2>
          <ol className="hnx-onboarding-steps">
            <li>
              <strong>Open a contract</strong>
              <span>Upload a PDF, TXT or Markdown file, or pick one from the indexed library.</span>
              <button type="button" className="wf-link" onClick={onAnalyze}>Go to Contract Workspace</button>
            </li>
            <li>
              <strong>Ask a precise question</strong>
              <span>Answers come with quoted evidence — or an explicit abstention.</span>
            </li>
            <li>
              <strong>Organise the work</strong>
              <span>Create a matter to group documents, deadlines and draft reviews.</span>
              <button type="button" className="wf-link" onClick={onNewMatter}>Create a matter</button>
            </li>
          </ol>
        </section>
      )}

      <motion.section className="wf-stats" aria-label="Workspace summary" variants={staggerContainer} initial="initial" animate="animate">
        <motion.div className="wf-stat" variants={fadeUpItem}>
          <span className="wf-stat-num">{openMatters.length}</span>
          <span className="wf-stat-label">Open matters</span>
          <span className="wf-stat-foot">{store.matters.length} total</span>
        </motion.div>
        <motion.div className="wf-stat" variants={fadeUpItem}>
          <span className="wf-stat-num">{documents.length}</span>
          <span className="wf-stat-label">Documents in library</span>
          <span className="wf-stat-foot">{documentsLive ? "From backend index" : "Backend offline — sample list"}</span>
        </motion.div>
        <motion.div className="wf-stat" variants={fadeUpItem}>
          <span className="wf-stat-num">{upcoming.length}</span>
          <span className="wf-stat-label">Deadlines next 14 days</span>
          <span className={`wf-stat-foot ${overdue.length ? "wf-text-danger" : ""}`}>{overdue.length} overdue</span>
        </motion.div>
        <motion.div className="wf-stat" variants={fadeUpItem}>
          <span className="wf-stat-num">{pendingReviewCount}</span>
          <span className="wf-stat-label">Pending review items</span>
          <span className="wf-stat-foot">
            {pendingTaskReviews.length} {pendingTaskReviews.length === 1 ? "task" : "tasks"} · {pendingDraftReviews.length}{" "}
            {pendingDraftReviews.length === 1 ? "draft" : "drafts"}
          </span>
        </motion.div>
      </motion.section>

      <div className="wf-grid-2">
        <section className="wf-card" aria-labelledby="wf-deadlines-h">
          <div className="wf-card-head">
            <h2 id="wf-deadlines-h">Upcoming & overdue deadlines</h2>
            <button type="button" className="wf-link" onClick={onOpenTasks}>All tasks</button>
          </div>
          {overdue.length === 0 && upcoming.length === 0 ? (
            <p className="wf-empty">No dated open tasks. Add due dates in Tasks to track deadlines.</p>
          ) : (
            <ul className="wf-list">
              {[...overdue, ...upcoming].slice(0, 8).map((t) => (
                <li key={t.id} className="wf-list-row">
                  <span className="wf-row-title">{t.title}</span>
                  <span className={isOverdue(t) ? "wf-badge wf-badge-danger" : "wf-badge wf-badge-muted"}>
                    {isOverdue(t) ? `Overdue · ${t.dueDate}` : `Due ${t.dueDate}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="wf-card" aria-labelledby="wf-recent-docs-h">
          <div className="wf-card-head">
            <h2 id="wf-recent-docs-h">Recent documents</h2>
            <button type="button" className="wf-link" onClick={onAnalyze}>Open analysis</button>
          </div>
          {documents.length === 0 ? (
            <p className="wf-empty">No documents indexed yet. Upload one in Contract Analysis.</p>
          ) : (
            <ul className="wf-list">
              {documents.slice(-6).reverse().map((d) => (
                <li key={d.id} className="wf-list-row">
                  <span className="wf-mono">{d.id}</span>
                  <span className="wf-row-title">{d.title}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="wf-card" aria-labelledby="wf-matters-h">
          <div className="wf-card-head">
            <h2 id="wf-matters-h">Open matters</h2>
            <button type="button" className="wf-link" onClick={onNewMatter}>New matter</button>
          </div>
          {openMatters.length === 0 ? (
            <p className="wf-empty">No matters yet. Create one to group documents, tasks and drafts.</p>
          ) : (
            <ul className="wf-list">
              {openMatters.slice(0, 6).map((m) => (
                <li key={m.id} className="wf-list-row">
                  <button type="button" className="wf-row-btn" onClick={() => onOpenMatter(m.id)}>
                    <span className="wf-row-title">{m.title}</span>
                    <span className="wf-muted">{m.reference || "No ref."} · {m.client || "No client"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="wf-card" aria-labelledby="wf-review-h">
          <div className="wf-card-head">
            <h2 id="wf-review-h">Review queue</h2>
          </div>
          {pendingReviewCount === 0 ? (
            <p className="wf-empty">Nothing awaiting review.</p>
          ) : (
            <ul className="wf-list">
              {pendingDraftReviews.slice(0, 4).map((d) => (
                <li key={d.id} className="wf-list-row">
                  <span className="wf-row-title">Notice draft · {d.docTitle}{d.recipient ? ` → ${d.recipient}` : ""}</span>
                  <ReviewBadge state={d.status} />
                </li>
              ))}
              {pendingTaskReviews.slice(0, 4).map((t) => (
                <li key={t.id} className="wf-list-row">
                  <span className="wf-row-title">Task · {t.title}</span>
                  <ReviewBadge state={t.review} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <PrototypeStorageNote />
    </main>
  )
}

/* ======================================================================== */
/* TASK FORM + TASK ROWS (shared by Tasks page and matter detail)            */
/* ======================================================================== */

function TaskCreateForm({
  store,
  fixedMatterId,
}: {
  store: WorkflowStore
  fixedMatterId?: string
}) {
  const [title, setTitle] = useState("")
  const [matterId, setMatterId] = useState(fixedMatterId || "")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState<TaskStatus>("To do")
  const [review, setReview] = useState<ReviewState | "">("")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    store.addTask({ title: title.trim(), matterId: fixedMatterId || matterId, dueDate, status, review, notes: "" })
    setTitle("")
    setDueDate("")
    setStatus("To do")
    setReview("")
  }

  return (
    <form className="wf-form wf-form-inline" onSubmit={submit} aria-label="Create task">
      <label className="wf-field wf-grow">
        <span>Task</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Review cure-period clause" required />
      </label>
      {!fixedMatterId && (
        <label className="wf-field">
          <span>Matter</span>
          <select value={matterId} onChange={(e) => setMatterId(e.target.value)}>
            <option value="">— None —</option>
            {store.matters.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </label>
      )}
      <label className="wf-field">
        <span>Due date</span>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>
      <label className="wf-field">
        <span>Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
          {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className="wf-field">
        <span>Review</span>
        <select value={review} onChange={(e) => setReview(e.target.value as ReviewState | "")}>
          <option value="">Not required</option>
          {REVIEW_STATES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <button type="submit" className="wf-btn wf-btn-primary">Add task</button>
    </form>
  )
}

function TaskRow({ task, store, showMatter }: { task: Task; store: WorkflowStore; showMatter: boolean }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes)
  const matter = store.matters.find((m) => m.id === task.matterId)
  const overdue = isOverdue(task)

  return (
    <motion.li
      variants={fadeUpItem}
      exit="exit"
      layout="position"
      className={`wf-task ${task.status === "Done" ? "wf-task-done" : ""} ${overdue ? "wf-task-overdue" : ""}`}
    >
      <div className="wf-task-main">
        <input
          type="checkbox"
          className="wf-check"
          checked={task.status === "Done"}
          onChange={(e) => store.updateTask(task.id, { status: e.target.checked ? "Done" : "To do" })}
          aria-label={`Mark "${task.title}" complete`}
        />
        {editing ? (
          <input className="wf-input wf-grow" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Task title" />
        ) : (
          <span className="wf-task-title">{task.title}</span>
        )}
        {overdue && <span className="wf-badge wf-badge-danger">Overdue</span>}
        <ReviewBadge state={task.review} />
      </div>
      <div className="wf-task-controls">
        {showMatter && <span className="wf-muted">{matter ? matter.title : "No matter"}</span>}
        <label className="wf-mini">
          <span className="wf-sr">Due date</span>
          <input type="date" value={task.dueDate} onChange={(e) => store.updateTask(task.id, { dueDate: e.target.value })} />
        </label>
        <label className="wf-mini">
          <span className="wf-sr">Status</span>
          <select value={task.status} onChange={(e) => store.updateTask(task.id, { status: e.target.value as TaskStatus })}>
            {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="wf-mini">
          <span className="wf-sr">Review state</span>
          <select value={task.review} onChange={(e) => store.updateTask(task.id, { review: e.target.value as ReviewState | "" })}>
            <option value="">Not required</option>
            {REVIEW_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        {editing ? (
          <>
            <button type="button" className="wf-btn wf-btn-sm wf-btn-primary" onClick={() => { store.updateTask(task.id, { title: title.trim() || task.title, notes }); setEditing(false) }}>Save</button>
            <button type="button" className="wf-btn wf-btn-sm" onClick={() => { setTitle(task.title); setNotes(task.notes); setEditing(false) }}>Cancel</button>
          </>
        ) : (
          <button type="button" className="wf-btn wf-btn-sm" onClick={() => setEditing(true)}>Edit</button>
        )}
        <button type="button" className="wf-btn wf-btn-sm wf-btn-ghost" onClick={() => store.deleteTask(task.id)} aria-label={`Delete task "${task.title}"`}>Delete</button>
      </div>
      {editing ? (
        <label className="wf-field">
          <span>Review notes</span>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      ) : (
        task.notes && <p className="wf-task-notes">{task.notes}</p>
      )}
    </motion.li>
  )
}

/* ======================================================================== */
/* TASKS & DEADLINES PAGE                                                    */
/* ======================================================================== */

export function TasksPage({ store }: { store: WorkflowStore }) {
  const [filter, setFilter] = useState<"open" | "overdue" | "review" | "done" | "all">("open")
  const tasks = useMemo(() => {
    const list = store.tasks.filter((t) => {
      if (filter === "open") return t.status !== "Done"
      if (filter === "overdue") return isOverdue(t)
      if (filter === "review") return t.review === "Pending review" || t.review === "Changes requested"
      if (filter === "done") return t.status === "Done"
      return true
    })
    return [...list].sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
  }, [store.tasks, filter])

  const counts = {
    open: store.tasks.filter((t) => t.status !== "Done").length,
    overdue: store.tasks.filter(isOverdue).length,
    review: store.tasks.filter((t) => t.review === "Pending review" || t.review === "Changes requested").length,
    done: store.tasks.filter((t) => t.status === "Done").length,
    all: store.tasks.length,
  }

  return (
    <main className="wf-page" aria-labelledby="wf-tasks-title">
      <PageHeader
        id="wf-tasks-title"
        eyebrow="Legal work"
        title="Tasks & Deadlines"
        description={`Track work, due dates and review status. Overdue is calculated from today's date (${todayISO()}).`}
      />
      <section className="wf-card">
        <TaskCreateForm store={store} />
      </section>
      <div className="wf-filters" role="group" aria-label="Filter tasks">
        {(["open", "overdue", "review", "done", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`wf-chip ${filter === f ? "active" : ""}`}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "review" ? "Needs review" : f[0].toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>
      {tasks.length === 0 ? (
        <p className="wf-empty">
          {store.tasks.length === 0 ? "No tasks yet. Add the first one above — give it a due date to track deadlines." : "No tasks match this filter."}
        </p>
      ) : (
        <motion.ul className="wf-task-list" variants={staggerContainer} initial="initial" animate="animate" key={filter}>
          <AnimatePresence initial={false}>
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} store={store} showMatter />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
      <PrototypeStorageNote />
    </main>
  )
}

/* ======================================================================== */
/* MATTER MANAGEMENT                                                         */
/* ======================================================================== */

export function MattersPage({
  store,
  documents,
  selectedMatterId,
  onSelectMatter,
  createNonce,
  onOpenDocument,
  onDraftForMatter,
}: {
  store: WorkflowStore
  documents: WorkflowDoc[]
  selectedMatterId: string | null
  onSelectMatter: (id: string | null) => void
  createNonce: number
  onOpenDocument: (docId: string) => void
  onDraftForMatter: (matterId: string, docId?: string) => void
}) {
  const [creating, setCreating] = useState(createNonce > 0)
  const [form, setForm] = useState({ title: "", reference: "", client: "", matterType: MATTER_TYPES[0], status: "Open" as MatterStatus, notes: "" })
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<MatterStatus | "All">("All")
  const matter = store.matters.find((m) => m.id === selectedMatterId) || null
  const visibleMatters = store.matters.filter((m) => {
    if (statusFilter !== "All" && m.status !== statusFilter) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return [m.title, m.reference, m.client, m.matterType].some((v) => v.toLowerCase().includes(q))
  })

  useEffect(() => {
    if (createNonce > 0) setCreating(true)
  }, [createNonce])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const id = store.addMatter({ ...form, title: form.title.trim(), docIds: [] })
    setForm({ title: "", reference: "", client: "", matterType: MATTER_TYPES[0], status: "Open", notes: "" })
    setCreating(false)
    onSelectMatter(id)
  }

  return (
    <main className="wf-page" aria-labelledby="wf-matters-title">
      <PageHeader
        id="wf-matters-title"
        eyebrow="Legal work"
        title="Matters"
        description="Group documents, tasks and notice drafts under a client matter."
        actions={
          <button type="button" className="wf-btn wf-btn-primary" onClick={() => setCreating((c) => !c)} aria-expanded={creating}>
            {creating ? "Close form" : "New matter"}
          </button>
        }
      />

      <AnimatePresence initial={false}>
      {creating && (
        <motion.section key="create" className="wf-card" aria-label="Create matter" variants={disclosure} initial="initial" animate="animate" exit="exit" style={{ overflow: "hidden" }}>
          <form className="wf-form" onSubmit={submit}>
            <div className="wf-form-grid">
              <label className="wf-field">
                <span>Matter title *</span>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Polaris cold-chain spoilage claim" />
              </label>
              <label className="wf-field">
                <span>Reference</span>
                <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. M-2026-014" />
              </label>
              <label className="wf-field">
                <span>Client name</span>
                <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
              </label>
              <label className="wf-field">
                <span>Matter type</span>
                <select value={form.matterType} onChange={(e) => setForm({ ...form, matterType: e.target.value })}>
                  {MATTER_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="wf-field">
                <span>Status</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MatterStatus })}>
                  {MATTER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <label className="wf-field">
              <span>Notes (avoid confidential details — stored in this browser)</span>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
            <div className="wf-actions">
              <button type="submit" className="wf-btn wf-btn-primary">Create matter</button>
            </div>
          </form>
        </motion.section>
      )}
      </AnimatePresence>

      <div className="wf-split">
        <section className="wf-card wf-matter-list" aria-label="Matter list">
          {store.matters.length > 0 && (
            <div className="hnx-list-tools">
              <label className="wf-field">
                <span className="wf-sr">Search matters</span>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, reference, client" />
              </label>
              <div className="wf-filters" role="group" aria-label="Filter by status">
                {(["All", ...MATTER_STATUSES] as const).map((st) => (
                  <button key={st} type="button" className={`wf-chip ${statusFilter === st ? "active" : ""}`} aria-pressed={statusFilter === st} onClick={() => setStatusFilter(st)}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
          {store.matters.length === 0 ? (
            <div className="wf-empty-block">
              <p className="wf-empty">No matters yet.</p>
              <button type="button" className="wf-btn wf-btn-primary" onClick={() => setCreating(true)}>Create your first matter</button>
            </div>
          ) : visibleMatters.length === 0 ? (
            <p className="wf-empty">No matters match this search.</p>
          ) : (
            <motion.ul className="wf-list" variants={staggerContainer} initial="initial" animate="animate">
              {visibleMatters.map((m) => {
                const docCount = m.docIds.length
                const taskCount = store.tasks.filter((t) => t.matterId === m.id && t.status !== "Done").length
                return (
                  <motion.li key={m.id} variants={fadeUpItem}>
                    <button
                      type="button"
                      className={`wf-row-btn ${m.id === selectedMatterId ? "active" : ""}`}
                      onClick={() => onSelectMatter(m.id)}
                      aria-current={m.id === selectedMatterId}
                    >
                      <span className="hnx-matter-row-top">
                        <span className="wf-row-title">{m.title}</span>
                        <span className={`wf-badge ${m.status === "Open" ? "wf-badge-ok" : m.status === "On hold" ? "wf-badge-pending" : "wf-badge-muted"}`}>{m.status}</span>
                      </span>
                      <span className="wf-muted">
                        {m.reference || "No ref."} · {m.client || "No client"}
                      </span>
                      <span className="hnx-matter-meta">
                        {docCount} {docCount === 1 ? "document" : "documents"} · {taskCount} open {taskCount === 1 ? "task" : "tasks"} · opened {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </button>
                  </motion.li>
                )
              })}
            </motion.ul>
          )}
        </section>

        {matter ? (
          <MatterDetail
            key={matter.id}
            matter={matter}
            store={store}
            documents={documents}
            onOpenDocument={onOpenDocument}
            onDraftForMatter={onDraftForMatter}
          />
        ) : (
          <section className="wf-card"><p className="wf-empty">Select or create a matter to see its documents, tasks and drafts.</p></section>
        )}
      </div>
      <PrototypeStorageNote />
    </main>
  )
}

function MatterDetail({
  matter,
  store,
  documents,
  onOpenDocument,
  onDraftForMatter,
}: {
  matter: Matter
  store: WorkflowStore
  documents: WorkflowDoc[]
  onOpenDocument: (docId: string) => void
  onDraftForMatter: (matterId: string, docId?: string) => void
}) {
  const [linkDoc, setLinkDoc] = useState("")
  const [notes, setNotes] = useState(matter.notes)
  const tasks = store.tasks.filter((t) => t.matterId === matter.id)
  const drafts = store.drafts.filter((d) => d.matterId === matter.id)
  const linkedDocs = matter.docIds.map((id) => documents.find((d) => d.id === id) || { id, title: "(not in current library)" })
  const unlinked = documents.filter((d) => !matter.docIds.includes(d.id))

  return (
    <section className="wf-card wf-matter-detail" aria-labelledby="wf-matter-detail-h">
      <div className="wf-card-head">
        <div>
          <h2 id="wf-matter-detail-h">{matter.title}</h2>
          <p className="wf-muted">
            {matter.reference || "No reference"} · {matter.client || "No client"} · {matter.matterType}
          </p>
        </div>
        <label className="wf-mini">
          <span className="wf-sr">Matter status</span>
          <select value={matter.status} onChange={(e) => store.updateMatter(matter.id, { status: e.target.value as MatterStatus })}>
            {MATTER_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <label className="wf-field">
        <span>Notes</span>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => store.updateMatter(matter.id, { notes })} />
      </label>

      <h3 className="wf-h3">Documents ({linkedDocs.length})</h3>
      {linkedDocs.length === 0 ? (
        <p className="wf-empty">No documents linked.</p>
      ) : (
        <ul className="wf-list">
          {linkedDocs.map((d) => (
            <li key={d.id} className="wf-list-row">
              <span className="wf-mono">{d.id}</span>
              <span className="wf-row-title">{d.title}</span>
              <button type="button" className="wf-btn wf-btn-sm" onClick={() => onOpenDocument(d.id)}>Analyze</button>
              <button type="button" className="wf-btn wf-btn-sm" onClick={() => onDraftForMatter(matter.id, d.id)}>Draft notice</button>
              <button type="button" className="wf-btn wf-btn-sm wf-btn-ghost" onClick={() => store.updateMatter(matter.id, { docIds: matter.docIds.filter((x) => x !== d.id) })}>Unlink</button>
            </li>
          ))}
        </ul>
      )}
      <div className="wf-form-inline">
        <label className="wf-field wf-grow">
          <span>Link a library document</span>
          <select value={linkDoc} onChange={(e) => setLinkDoc(e.target.value)}>
            <option value="">— Select document —</option>
            {unlinked.map((d) => <option key={d.id} value={d.id}>{d.id} · {d.title}</option>)}
          </select>
        </label>
        <button
          type="button"
          className="wf-btn"
          disabled={!linkDoc}
          onClick={() => { store.updateMatter(matter.id, { docIds: [...matter.docIds, linkDoc] }); setLinkDoc("") }}
        >
          Link
        </button>
      </div>

      <h3 className="wf-h3">Tasks ({tasks.length})</h3>
      <TaskCreateForm store={store} fixedMatterId={matter.id} />
      {tasks.length > 0 && (
        <ul className="wf-task-list">
          {tasks.map((t) => <TaskRow key={t.id} task={t} store={store} showMatter={false} />)}
        </ul>
      )}

      <h3 className="wf-h3">Notice drafts ({drafts.length})</h3>
      {drafts.length === 0 ? (
        <p className="wf-empty">No review records. Generate a notice in Legal Drafting and save a review record to this matter.</p>
      ) : (
        <ul className="wf-list">
          {drafts.map((d) => (
            <li key={d.id} className="wf-list-row">
              <span className="wf-row-title">{d.docTitle}{d.recipient ? ` → ${d.recipient}` : ""}</span>
              <ReviewBadge state={d.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ======================================================================== */
/* DRAFT REVIEW TRACKING (used on the Legal Drafting page)                   */
/* ======================================================================== */

export function DraftReviewPanel({
  store,
  docId,
  docTitle,
  recipient,
  hasDraft,
  defaultMatterId,
}: {
  store: WorkflowStore
  docId: string
  docTitle: string
  recipient: string
  hasDraft: boolean
  defaultMatterId: string
}) {
  const [matterId, setMatterId] = useState(defaultMatterId)
  const [status, setStatus] = useState<ReviewState>("Pending review")
  const [notes, setNotes] = useState("")
  const [saved, setSaved] = useState(false)
  const records = store.drafts.filter((d) => d.docId === docId)

  useEffect(() => setMatterId(defaultMatterId), [defaultMatterId])

  const save = () => {
    store.addDraft({ docId, docTitle, recipient, matterId, status, reviewNotes: notes })
    setNotes("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section className="wf-card wf-review-panel" aria-labelledby="wf-review-panel-h">
      <div className="wf-card-head">
        <h2 id="wf-review-panel-h">Review tracking</h2>
        <span className="wf-badge wf-badge-pending">DRAFT — REQUIRES LAWYER REVIEW</span>
      </div>
      <p className="wf-muted">
        Records the review status and reviewer notes for this draft (metadata only — the draft text is not saved). This is
        a local record on this device, not a shared review between lawyers.
      </p>
      <div className="wf-form-grid">
        <label className="wf-field">
          <span>Matter</span>
          <select value={matterId} onChange={(e) => setMatterId(e.target.value)}>
            <option value="">— None —</option>
            {store.matters.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </label>
        <label className="wf-field">
          <span>Draft status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as ReviewState)}>
            {REVIEW_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <label className="wf-field">
        <span>Review notes</span>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Confirm delivery dates with client before sending" />
      </label>
      <div className="wf-actions">
        <button type="button" className="wf-btn wf-btn-primary" onClick={save} disabled={!hasDraft} title={hasDraft ? "" : "Generate a draft first"}>
          Save review record
        </button>
        {saved && <span className="wf-ok" role="status">Saved locally</span>}
      </div>

      {records.length > 0 && (
        <>
          <h3 className="wf-h3">Records for {docId}</h3>
          <ul className="wf-task-list">
            {records.map((r) => (
              <li key={r.id} className="wf-task">
                <div className="wf-task-main">
                  <span className="wf-task-title">{r.recipient || "Recipient not set"}</span>
                  <ReviewBadge state={r.status} />
                  <span className="wf-muted">{new Date(r.updatedAt).toLocaleString()}</span>
                </div>
                <div className="wf-task-controls">
                  <label className="wf-mini">
                    <span className="wf-sr">Update draft status</span>
                    <select value={r.status} onChange={(e) => store.updateDraft(r.id, { status: e.target.value as ReviewState })}>
                      {REVIEW_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
                <label className="wf-field">
                  <span className="wf-sr">Review notes</span>
                  <textarea
                    rows={2}
                    defaultValue={r.reviewNotes}
                    onBlur={(e) => e.target.value !== r.reviewNotes && store.updateDraft(r.id, { reviewNotes: e.target.value })}
                    aria-label="Review notes"
                  />
                </label>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
