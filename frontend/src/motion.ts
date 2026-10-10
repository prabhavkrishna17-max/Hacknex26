import type { Transition, Variants } from "framer-motion"

/*
 * Shared Framer Motion conventions for HNX.
 * - Everyday UI: 150–260 ms, opacity + small translate only.
 * - Hero composition: slower (≈0.9 s) and reserved for the overview visual.
 * - Reduced motion: the app root wraps everything in <MotionConfig reducedMotion="user">,
 *   which drops transform animation for users who ask for it (opacity fades remain, briefly).
 */

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const tFast: Transition = { duration: 0.16, ease: EASE_OUT }
export const tBase: Transition = { duration: 0.24, ease: EASE_OUT }
export const tSlow: Transition = { duration: 0.9, ease: EASE_OUT }

/*
 * Essential content never starts fully transparent: if animation frames are throttled
 * (background tab, low-power mode) text stays readable. Decorative layers may fade from 0.
 */

/** Page-level entrance when switching views. */
export const pageVariants: Variants = {
  initial: { opacity: 0.6, y: 8 },
  animate: { opacity: 1, y: 0, transition: tBase },
  exit: { opacity: 0, transition: { duration: 0.12 } },
}

/** Container that staggers its children (lists, card grids). */
export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
}

/** Child item for staggered lists. */
export const fadeUpItem: Variants = {
  initial: { opacity: 0.5, y: 6 },
  animate: { opacity: 1, y: 0, transition: tBase },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
}

/** Panels that appear in place (answer card, abstention, draft output): movement only, always fully opaque. */
export const panelReveal: Variants = {
  initial: { y: 10 },
  animate: { y: 0, transition: tBase },
}

/** Swap between items of the same kind (e.g. selected citation → evidence). */
export const crossFade: Variants = {
  initial: { opacity: 0.4, x: 8 },
  animate: { opacity: 1, x: 0, transition: tFast },
  exit: { opacity: 0, x: -8, transition: { duration: 0.1 } },
}

/** Disclosures (surrounding context, technical details, forms): transform + opacity only, no height animation. */
export const disclosure: Variants = {
  initial: { opacity: 0.4, y: -4 },
  animate: { opacity: 1, y: 0, transition: tBase },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
}

/** Backdrop for overlays (draft dialog). */
export const backdropVariants: Variants = {
  initial: { opacity: 0.4 },
  animate: { opacity: 1, transition: tFast },
  exit: { opacity: 0, transition: tFast },
}

/** Dialog (modal) entrance. */
export const dialogVariants: Variants = {
  initial: { opacity: 0.6, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: tBase },
  exit: { opacity: 0, y: 8, scale: 0.99, transition: { duration: 0.14 } },
}

/** Subtle press feedback for primary buttons. */
export const tapPress = { scale: 0.98 }
