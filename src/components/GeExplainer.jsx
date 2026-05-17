import { GoldLink } from './GoldLink'
import { LS_GE_AREAS, LS_GE_SPECIAL_REQUIREMENTS } from '../data/lsGeRequirements'

export function GeExplainer() {
  return (
    <details className="mt-4 rounded-2xl border border-silver/30 bg-slate-950/45 open:bg-slate-950/55">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-100 [&::-webkit-details-marker]:hidden">
        <span className="text-silver">+</span> How L&S general education works
      </summary>
      <div className="border-t border-silver/25 px-4 py-3 text-sm leading-6 text-slate-300">
        <p>
          B.A. candidates in the College of Letters and Science complete Areas A–G plus special subject area
          requirements. GOLD shows how each course applies — one class can count toward an area and a special
          requirement, but credit is awarded once per requirement.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-silver">Areas A–G</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-400">
              {LS_GE_AREAS.map((area) => (
                <li key={area.key}>
                  {area.label}: {area.title}
                  {area.coursesRequired > 1 ? ` (${area.coursesRequired} courses)` : ''}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-silver">Special requirements</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-400">
              {LS_GE_SPECIAL_REQUIREMENTS.map((special) => (
                <li key={special.key}>
                  {special.title}
                  {special.coursesRequired > 1 ? ` (${special.coursesRequired} courses)` : ''}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Your degree audit is the source of truth — not this demo checklist.</li>
          <li>
            Transfer and AP credit may clear requirements with different labels than you expect; confirm in GOLD
            before you skip a planned course.
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <GoldLink href="https://catalog.ucsb.edu/general-education" variant="pill">
            General Education (catalog)
          </GoldLink>
          <GoldLink href="https://my.sa.ucsb.edu/gold/">Open degree audit in GOLD</GoldLink>
          <a
            href="https://dailynexus.com/interactives/grades/ges"
            target="_blank"
            rel="noreferrer"
            className="link-gold rounded-full px-3 py-1.5 text-xs font-semibold"
          >
            Daily Nexus GE grades
          </a>
        </div>
      </div>
    </details>
  )
}
