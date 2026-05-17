'use client'

import Link from 'next/link'
import { GoldSourceChip } from './GoldLink'

export function CampusLinkRow({ link, compact = false }) {
  const isInternal = link.url.startsWith('/')

  return (
    <li
      className={`flex flex-col gap-2 rounded-2xl border border-silver/30 bg-slate-950/45 ${
        compact ? 'p-3' : 'p-4 sm:flex-row sm:items-center sm:justify-between'
      }`}
    >
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
          <p className={`mt-1 leading-5 text-slate-400 ${compact ? 'text-[11px]' : 'text-xs'}`}>
            {link.description}
          </p>
        )}
      </div>
      {!isInternal && !compact && <GoldSourceChip href={link.url} label="Open source" />}
    </li>
  )
}
