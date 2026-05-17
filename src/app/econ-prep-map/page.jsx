import { EconPrepMapFlowchart } from '../../components/EconPrepMapFlowchart'

export const metadata = {
 title: 'Economics prep flowchart | UCSB SILVER',
 description:
 'Full-page demo flowchart of L&S Economics pre-major and prep prerequisites unlocking upper-division coursework.',
}

export default function EconPrepMapPage() {
 return (
 <div className="app-page-bg relative min-h-screen overflow-hidden text-slate-50">
 <div className="app-page-overlay pointer-events-none absolute inset-0" />

 <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
 <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
 <div>
 <p className="text-label-caps">UCSB SILVER · demo</p>
 <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Economics prep flowchart</h1>
 <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
 Larger view with color-coded arrows so crossing paths stay readable. Tap courses when unlocked; verify
 everything in Gaucho GOLD and the UCSB General Catalog.
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
