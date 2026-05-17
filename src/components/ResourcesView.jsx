'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { campusResourceHub } from '../data/campusResources'
import {
  POLICY_SNIPPET_CATEGORIES,
  filterPolicySnippets,
} from '../data/policySnippets'
import { GoldLink, GoldSourceChip } from './GoldLink'
import { AppIcon } from './AppIcon'
import { FaqSection } from './FaqSection'
import { UsefulLinksSection } from './UsefulLinksSection'

function ResourceLink({ link }) {
  const isInternal = link.url.startsWith('/')
  if (isInternal) {
    return (
      <Link href={link.url} className="link-gold rounded-full px-3 py-1.5 text-xs font-semibold">
        {link.label}
      </Link>
    )
  }
  return <GoldSourceChip href={link.url} label={link.label} />
}

export function ResourcesView({ onNavigate, onAskAboutSnippet, onAskInChat }) {
  const [policyCategory, setPolicyCategory] = useState('all')
  const filteredSnippets = useMemo(
    () => filterPolicySnippets(policyCategory),
    [policyCategory],
  )

  return (
    <div className="space-y-6">
      <section className="panel-hero border border-silver/30 bg-gradient-to-br from-[#041018] via-[#020a12] to-app-bg p-6 shadow-[0_20px_90px_rgba(1,8,16,0.5)]">
        <p className="text-label-caps-gold">Resource Hub</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          FAQ, useful links & official resources
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Frequently asked questions, bookmarked UCSB pages, and policy snippets for L&S Economics planning.
          Verify every detail on the live source site before you enroll or petition.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate('chat')}
            className="btn-silver rounded-full px-5 py-2.5"
          >
            Open Campus Q&A
          </button>
          <GoldLink variant="pill">Open Gaucho GOLD</GoldLink>
        </div>
      </section>

      <FaqSection onAskInChat={onAskInChat} />

      <UsefulLinksSection />

      <section>
        <p className="text-label-caps mb-4">Browse by topic</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campusResourceHub.map((group) => (
          <div
            key={group.id}
            className={`panel border border-silver/30 bg-gradient-to-br ${group.accent} p-[1px]`}
          >
            <div className="h-full rounded-[calc(var(--radius-panel)-1px)] bg-white/[0.07] p-5">
              <h3 className="text-lg font-semibold tracking-tight">{group.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{group.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.links.map((link) => (
                  <ResourceLink key={link.url + link.label} link={link} />
                ))}
              </div>
            </div>
          </div>
          ))}
        </div>
      </section>

      <section className="panel border border-silver/30 bg-white/[0.06] p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-label-caps">Policy snippet library</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Short excerpts to verify in chat</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Demo summaries only—always read the full policy on the linked official page. Campus Q&A can
              surface matching snippets when you ask related questions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {POLICY_SNIPPET_CATEGORIES.map((category) => {
              const isActive = policyCategory === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setPolicyCategory(category.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    isActive
                      ? 'border-gold/40 bg-gold/14 text-gold'
                      : 'border-silver/30 bg-white/[0.06] text-slate-400 hover:border-silver/40 hover:text-white'
                  }`}
                >
                  {category.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filteredSnippets.map((snippet) => (
            <article
              key={snippet.id}
              className="rounded-2xl border border-silver/30 bg-white/[0.06] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-semibold text-white">{snippet.title}</h4>
                <span className="badge-silver rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  {snippet.category}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{snippet.excerpt}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <GoldSourceChip href={snippet.sourceUrl} label={`${snippet.sourceLabel} (source)`} />
                <button
                  type="button"
                  onClick={() => onAskAboutSnippet(snippet)}
                  className="rounded-full border border-silver/25 bg-silver/10 px-3 py-1.5 text-xs font-semibold text-silver-bright transition hover:bg-silver/15"
                >
                  Ask in Campus Q&A
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel border border-silver/25 bg-gradient-to-br from-silver/12 via-ucsb-navy to-app-bg p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-silver/25 bg-silver/10 text-silver">
            <AppIcon name="chat" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-label-caps">Tip</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Use suggested prompts in Campus Q&A for pass times, unit load, GE, and prerequisites. Bot
              replies include official source chips and may attach a matching policy snippet from this
              library.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
