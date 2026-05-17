'use client'

import Link from 'next/link'
import { AppIcon } from './AppIcon'

export function FlowchartLauncher() {
  return (
    <div className="space-y-6">
      <section className="panel border border-silver/30 bg-slate-950/50 p-6 backdrop-blur-xl sm:p-8">
        <p className="text-label-caps-gold">Economics pathway</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Prep flowchart</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Open the full-screen map to explore pre-major admission, preparation, and upper-division major
          requirements. Use zoom controls and scroll to focus on one section at a time.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="text-blue-300">●</span>
            Step 1 — Pre-major admission (ECON 1, 2, 10A)
          </li>
          <li className="flex gap-2">
            <span className="text-teal-300">●</span>
            Step 2 — Preparation (ECON 5 or PSTAT 120A + calculus)
          </li>
          <li className="flex gap-2">
            <span className="text-amber-300">●</span>
            Step 3 — Upper-division major (40 units)
          </li>
        </ul>
        <Link
          href="/econ-prep-map"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-gold/40 bg-gold/12 px-5 py-3 text-sm font-semibold text-gold transition hover:border-gold/55 hover:bg-gold/18"
        >
          <AppIcon name="flowchart" className="h-5 w-5" />
          Open full-screen flowchart
        </Link>
      </section>
    </div>
  )
}

