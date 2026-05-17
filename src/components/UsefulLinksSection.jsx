'use client'

import { usefulLinkGroups } from '../data/faqAndLinks'
import { CampusLinkRow } from './CampusLinkRow'

export function UsefulLinksSection() {
  return (
    <section className="panel border border-silver/30 bg-gradient-to-br from-gold/10 via-ucsb-navy/80 to-slate-950/45 p-6">
      <p className="text-label-caps-gold">Useful links</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">Bookmark these UCSB pages</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
        Organized shortcuts to official sites and SILVER demo tools. Gold links open live campus pages in a
        new tab.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {usefulLinkGroups.map((group) => (
          <div key={group.id} className="rounded-2xl border border-silver/30 bg-slate-950/40 p-5">
            <h4 className="text-lg font-semibold text-white">{group.title}</h4>
            <p className="mt-1 text-sm text-slate-400">{group.description}</p>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <CampusLinkRow key={link.url + link.label} link={link} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
