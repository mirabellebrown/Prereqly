'use client'

import { useMemo, useState } from 'react'
import { GoldSourceChip } from './GoldLink'
import { AppIcon } from './AppIcon'
import {
  FAQ_CATEGORIES,
  filterFaqByCategory,
  frequentlyAskedQuestions,
} from '../data/faqAndLinks'

function FaqItem({ item, isOpen, onToggle, onAskInChat }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/5"
      >
        <h4 className="text-base font-semibold leading-6 text-white">{item.question}</h4>
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
            isOpen
              ? 'border-gold/40 bg-gold/14 text-gold'
              : 'border-white/15 bg-white/5 text-slate-400'
          }`}
        >
          <AppIcon
            name="chevron"
            className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-white/10 px-5 pb-5 pt-4">
          <p className="text-sm leading-6 text-slate-300">{item.answer}</p>
          {(item.links?.length > 0 || item.chatPrompt) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {item.links?.map((link) => (
                <GoldSourceChip key={link.url + link.label} href={link.url} label={link.label} />
              ))}
              {item.chatPrompt && onAskInChat && (
                <button
                  type="button"
                  onClick={() => onAskInChat(item.chatPrompt)}
                  className="rounded-full border border-silver/25 bg-silver/10 px-3 py-1.5 text-xs font-semibold text-silver-bright transition hover:bg-silver/15"
                >
                  Ask in Campus Q&A
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export function FaqSection({ onAskInChat }) {
  const [category, setCategory] = useState('all')
  const [openId, setOpenId] = useState(frequentlyAskedQuestions[0]?.id ?? null)

  const filtered = useMemo(() => filterFaqByCategory(category), [category])

  return (
    <section className="panel border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-label-caps">Frequently asked questions</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Common L&S & Economics questions</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Quick answers for this demo. Verify everything on official UCSB sites or with an advisor before
            you change your schedule.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FAQ_CATEGORIES.map((cat) => {
            const isActive = category === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  isActive
                    ? 'border-silver/35 bg-silver/15 text-silver-bright'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((item) => (
          <FaqItem
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
            onAskInChat={onAskInChat}
          />
        ))}
      </div>
    </section>
  )
}
