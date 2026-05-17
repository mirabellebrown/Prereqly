import { EconPrepMapFlowchart } from '../../components/EconPrepMapFlowchart'
import { SilverLogo } from '../../components/SilverLogo'

export const metadata = {
  title: 'Economics prep flowchart | UCSB SILVER',
  description:
    '2025–26 Economics B.A. prep flowchart: pre-major, ECON 5 or PSTAT 120A, UD core courses, and electives.',
}

export default function EconPrepMapPage() {
  return (
    <div className="app-page-bg relative min-h-screen text-slate-50">
      <div className="app-page-overlay pointer-events-none fixed inset-0" />

      <header className="border-b border-silver/35 bg-logo-navy shadow-[0_8px_32px_rgba(20,52,116,0.35)]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-8 sm:py-7">
          <div>
            <SilverLogo height={40} href="/" />
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Economics prep flowchart
            </h1>
            <p className="mt-2 max-w-2xl pb-1 text-sm leading-6 text-slate-300">
              Spaced layout with zoom controls — tap courses when unlocked. Verify everything in Gaucho GOLD
              and the UCSB General Catalog.
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 pb-12 pt-10 sm:px-8 sm:pt-12">
        <EconPrepMapFlowchart showBackLink variant="standalone" />
      </main>
    </div>
  )
}
