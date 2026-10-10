import { useRef } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"
import { EASE_OUT } from "../motion"

/*
 * Signature composition for the Command Centre: a brass balance scale above layered
 * contract sheets, with evidence lines tying highlighted clauses to the pans.
 * Lightweight SVG + CSS 3D transforms; pointer depth and the balancing settle are
 * disabled when the user prefers reduced motion. Clause labels are illustrative motifs
 * and carry no data.
 */
export function SignatureScale() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 18 })
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 18 })

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
  }

  const sheet = (i: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.15 + i * 0.12, ease: EASE_OUT } },
  })

  return (
    <div className="sig-stage" ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden="true">
      <motion.div className="sig-scene" style={reduce ? undefined : { rotateX: rx, rotateY: ry }}>
        {/* Layered contract sheets (static offsets via style so they compose with the entrance) */}
        <motion.div className="sig-sheet sig-sheet-back" style={{ x: "16%", z: -60, rotate: 9 }} {...sheet(0)} />
        <motion.div className="sig-sheet sig-sheet-mid" style={{ x: "8%", z: -30, rotate: 4 }} {...sheet(1)} />
        <motion.div className="sig-sheet sig-sheet-front" style={{ rotate: -2 }} {...sheet(2)}>
          <span className="sig-sheet-id">CONTRACT · §2</span>
          <span className="sig-line w90" />
          <span className="sig-mark">
            <span className="sig-mark-ref">§ 2.2</span>
            <span className="sig-line w80 ink" />
            <span className="sig-line w60 ink" />
          </span>
          <span className="sig-line w85" />
          <span className="sig-mark sig-mark-b">
            <span className="sig-mark-ref">§ 2.3</span>
            <span className="sig-line w75 ink" />
            <span className="sig-line w55 ink" />
          </span>
          <span className="sig-line w70" />
        </motion.div>

        {/* Brass balance scale */}
        <motion.svg
          className="sig-scale"
          viewBox="0 0 320 260"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } }}
        >
          <defs>
            <linearGradient id="sigBrass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f0d79c" />
              <stop offset="0.45" stopColor="#c5a059" />
              <stop offset="1" stopColor="#7d5f26" />
            </linearGradient>
            <linearGradient id="sigBrassV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e6c886" />
              <stop offset="1" stopColor="#8a6a2c" />
            </linearGradient>
            <radialGradient id="sigGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#c5a059" stopOpacity="0.28" />
              <stop offset="1" stopColor="#c5a059" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="160" cy="236" rx="120" ry="14" fill="url(#sigGlow)" />
          {/* base + pillar */}
          <path d="M112 238h96l-10-14h-76z" fill="url(#sigBrassV)" />
          <rect x="154" y="44" width="12" height="182" rx="4" fill="url(#sigBrass)" />
          <circle cx="160" cy="40" r="11" fill="url(#sigBrass)" />
          {/* beam + pans settle into a slow balance */}
          <motion.g
            style={{ transformOrigin: "160px 52px" }}
            initial={reduce ? false : { rotate: -5 }}
            animate={reduce ? undefined : { rotate: [-5, 1.6, -1.1, 0.6, 0], transition: { duration: 2.6, delay: 0.5, ease: "easeInOut" } }}
          >
            <rect x="34" y="48" width="252" height="8" rx="4" fill="url(#sigBrass)" />
            <g>
              <path d="M52 56 30 132M52 56l22 76" stroke="#c5a059" strokeWidth="1.4" opacity="0.8" />
              <path d="M18 132h68a34 14 0 0 1-68 0z" fill="url(#sigBrassV)" />
            </g>
            <g>
              <path d="M268 56l-22 76M268 56l22 76" stroke="#c5a059" strokeWidth="1.4" opacity="0.8" />
              <path d="M234 132h68a34 14 0 0 1-68 0z" fill="url(#sigBrassV)" />
            </g>
          </motion.g>
        </motion.svg>

        {/* Evidence lines from the highlighted clauses to the pans */}
        <motion.svg className="sig-evidence" viewBox="0 0 400 340" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.9, duration: 0.6 } }}>
          <motion.path
            d="M118 214 C 92 186, 100 146, 116 112"
            stroke="#dfbe7c"
            strokeWidth="1.3"
            strokeDasharray="3 5"
            fill="none"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1, transition: { delay: 1.0, duration: 0.9, ease: EASE_OUT } }}
          />
          <motion.path
            d="M286 262 C 326 224, 304 152, 284 112"
            stroke="#dfbe7c"
            strokeWidth="1.3"
            strokeDasharray="3 5"
            fill="none"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1, transition: { delay: 1.15, duration: 0.9, ease: EASE_OUT } }}
          />
          <circle cx="116" cy="110" r="3.5" fill="#dfbe7c" />
          <circle cx="284" cy="110" r="3.5" fill="#dfbe7c" />
        </motion.svg>
      </motion.div>
    </div>
  )
}
