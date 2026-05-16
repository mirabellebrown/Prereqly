import { EconPrepMapFlowchart } from '../../components/EconPrepMapFlowchart'

export const metadata = {
  title: 'Economics prep flowchart | UCSB SILVER',
  description:
    'Full-page demo flowchart of L&S Economics pre-major and prep prerequisites unlocking upper-division coursework.',
}

export default function EconPrepMapPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(254,188,17,0.12),_transparent_30%),linear-gradient(180deg,_#04101d_0%,_#07192f_42%,_#020816_100%)] text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_18%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.06),transparent_20%)]" />

      <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">UCSB SILVER · demo</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Economics prep flowchart</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Larger view with color-coded arrows so crossing paths stay readable. Tap courses when unlocked; verify
              everything in GOLD and the UCSB General Catalog.
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 py-8 sm:px-8">
        <EconPrepMapFlowchart showBackLink />
      </main>
    </div>
  )
}
