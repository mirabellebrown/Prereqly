'use client'

import { useMemo, useState } from 'react'
import { usefulLinkGroups } from '../data/faqAndLinks'
import { CampusLinkRow } from './CampusLinkRow'
import { GoldLink } from './GoldLink'

const LINK_CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'essential', label: 'Essential' },
  { id: 'registration', label: 'Registration' },
  { id: 'major', label: 'GE & major' },
  { id: 'financial', label: 'Billing & aid' },
  { id: 'campus-life', label: 'Campus' },
]

function filterLinkGroups(categoryId) {
  if (categoryId === 'all') {
    return usefulLinkGroups
  }
  return usefulLinkGroups.filter((group) => group.id === categoryId)
}

export function ImportantLinksPanel({ onNavigateResources, compact = false }) {
  const [categoryFilter, setCategoryFilter] = useState('essential')
  const filteredGroups = useMemo(() => filterLinkGroups(categoryFilter), [categoryFilter])

  return (
    <section
      className={`panel border border-silver/30 bg-gradient-to-br from-gold/10 via-ucsb-navy/90 to-slate-950/45 ${
        compact ? 'p-5' : 'p-6'
      }`}
    >
      <p className="text-label-caps-gold">Important links</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">Official UCSB bookmarks</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Quick access to GOLD, the catalog, advising, and campus services. Open the live source to verify
        policies before you act.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {LINK_CATEGORY_FILTERS.map((filter) => {
          const isActive = categoryFilter === filter.id
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setCategoryFilter(filter.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                isActive
                  ? 'border-gold/40 bg-gold/14 text-gold'
                  : 'border-silver/30 bg-slate-950/50 text-slate-400 hover:border-silver/40 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4 space-y-4">
        {filteredGroups.map((group) => (
          <div key={group.id}>
            {categoryFilter === 'all' && (
              <h4 className="mb-2 text-sm font-semibold text-silver-bright">{group.title}</h4>
            )}
            <ul className="space-y-2">
              {group.links.map((link) => (
                <CampusLinkRow key={link.url + link.label} link={link} compact />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-silver/30 pt-4">
        <GoldLink variant="pill">Open Gaucho GOLD</GoldLink>
        {onNavigateResources && (
          <button
            type="button"
            onClick={onNavigateResources}
            className="text-xs font-semibold text-silver hover:text-silver-bright"
          >
            Full Resource Hub →
          </button>
        )}
      </div>
    </section>
  )
}
