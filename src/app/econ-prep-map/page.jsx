import { EconPrepMapFlowchart } from '../../components/EconPrepMapFlowchart'
import { SilverLogo } from '../../components/SilverLogo'

export const metadata = {
  title: 'Economics prep flowchart | UCSB SILVER',
  description:
    'Full-page demo flowchart of L&S Economics pre-major and prep prerequisites unlocking upper-division coursework.',
}

export default function EconPrepMapPage() {
  return (
    <div className="app-page-bg relative min-h-screen text-slate-50">
      <div className="app-page-overlay pointer-events-none fixed inset-0" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-logo-navy shadow-[0_8px_32px_rgba(20,52,116,0.35)]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <div>
            <SilverLogo height={40} href="/" />
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Economics prep flowchart
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Larger view with color-coded arrows so crossing paths stay readable. Tap courses when unlocked;
              verify everything in Gaucho GOLD and the UCSB General Catalog.
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 pb-8 pt-[11rem] sm:px-8">
        <EconPrepMapFlowchart showBackLink />
      </main>
    </div>
  )
}
