'use client'

import Link from 'next/link'
import { usefulLinkGroups } from '../data/faqAndLinks'
import { GoldSourceChip } from './GoldLink'

function UsefulLinkRow({ link }) {
  const isInternal = link.url.startsWith('/')

  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/45 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {isInternal ? (
          <Link
            href={link.url}
            className="text-sm font-semibold text-gold hover:text-gold-hover"
          >
            {link.label}
          </Link>
        ) : (
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-gold hover:text-gold-hover"
          >
            {link.label}
          </a>
        )}
        {link.description && (
          <p className="mt-1 text-xs leading-5 text-slate-400">{link.description}</p>
        )}
      </div>
      {!isInternal && (
        <GoldSourceChip href={link.url} label="Open source" />
      )}
    </li>
  )
}

export function UsefulLinksSection() {
  return (
    <section className="panel border border-gold/20 bg-gradient-to-br from-gold/10 via-ucsb-navy/80 to-slate-950 p-6">
      <p className="text-label-caps-gold">Useful links</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">Bookmark these UCSB pages</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
        Organized shortcuts to official sites and SILVER demo tools. Gold links open live campus pages in a
        new tab.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {usefulLinkGroups.map((group) => (
          <div key={group.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <h4 className="text-lg font-semibold text-white">{group.title}</h4>
            <p className="mt-1 text-sm text-slate-400">{group.description}</p>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <UsefulLinkRow key={link.url + link.label} link={link} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
