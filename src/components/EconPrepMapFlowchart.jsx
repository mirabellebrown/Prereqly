'use client'

import Link from 'next/link'
import { GoldLink } from './GoldLink'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { econPrepFlowchart } from '../mockData'
import { ECON_MAJOR_SHEET_LABEL } from '../data/economicsMajor2025'
import {
  econPrepMapById,
  flowById,
  flowEdgePath,
  gateDiamondPoints,
  nodeRequirementsMet,
  stripInvalidMapCompletions,
} from '../lib/econPrepFlowchartUtils'

const STORAGE_KEY = 'ucsb-silver-econ-map'
const LEGACY_STORAGE_KEY = 'prereqly-econ-map'
const ZOOM_MIN = 0.55
const ZOOM_MAX = 1.25
const ZOOM_STEP = 0.1
const ZOOM_DEFAULT = 0.78

function readStoredIds() {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')) {
      return stripInvalidMapCompletions(parsed)
    }
  } catch {
    return null
  }
  return null
}

function writeStoredIds(ids) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

function ZoomButton({ children, onClick, disabled, title }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-silver/30 bg-slate-950/60 px-2.5 text-sm font-semibold text-slate-200 transition hover:border-silver/45 hover:bg-slate-900/80 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function EconPrepMapFlowchart({ showBackLink = true }) {
  const [completedIds, setCompletedIds] = useState(
    () => readStoredIds() ?? stripInvalidMapCompletions(['econ1', 'math3a']),
  )
  const [zoom, setZoom] = useState(ZOOM_DEFAULT)

  useEffect(() => {
    writeStoredIds(completedIds)
  }, [completedIds])

  const done = useMemo(() => new Set(completedIds), [completedIds])
  const { width, height, edges, nodes, zones = [] } = econPrepFlowchart

  const displayWidth = Math.round(width * zoom)
  const displayHeight = Math.round(height * zoom)

  const uniqueEdgeStrokes = useMemo(() => {
    const list = edges.map((e) => e.stroke || '#94a3b8')
    return [...new Set(list)]
  }, [edges])

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100))
  }, [])

  function isUnlockedCourse(node) {
    if (node.kind !== 'course') {
      return false
    }
    const mapNode = econPrepMapById[node.id]
    return mapNode ? nodeRequirementsMet(mapNode, done) : false
  }

  function isCompleteCourse(node) {
    return node.kind === 'course' && done.has(node.id)
  }

  function missingLabels(node) {
    const mapNode = econPrepMapById[node.id]
    if (!mapNode) {
      return []
    }
    const missing = (mapNode.requires ?? [])
      .filter((id) => !done.has(id))
      .map((id) => econPrepMapById[id]?.label ?? id)
    const any = mapNode.requiresAny ?? []
    if (any.length > 0 && !any.some((id) => done.has(id))) {
      missing.push(`one of: ${any.map((id) => econPrepMapById[id]?.label ?? id).join(', ')}`)
    }
    return missing
  }

  function courseStroke(node) {
    const phase = node.phase ?? 'premajor'
    const isPrepCenter = node.column === 'center' && phase === 'premajor'
    const isUpper = phase === 'upper'

    if (isCompleteCourse(node)) {
      if (isUpper) {
        return { fill: 'rgba(120, 53, 15, 0.35)', stroke: '#fcd34d' }
      }
      if (isPrepCenter) {
        return { fill: 'rgba(56, 189, 248, 0.35)', stroke: '#7dd3fc' }
      }
      return { fill: 'rgba(6, 78, 59, 0.45)', stroke: '#34d399' }
    }

    if (isUnlockedCourse(node)) {
      if (isUpper) {
        return { fill: 'rgba(180, 120, 20, 0.4)', stroke: '#fde047' }
      }
      if (isPrepCenter) {
        return { fill: 'rgba(96, 165, 250, 0.55)', stroke: '#bae6fd' }
      }
      return { fill: 'rgba(30, 58, 138, 0.35)', stroke: '#7dd3fc' }
    }

    if (isUpper) {
      return { fill: 'rgba(69, 45, 10, 0.55)', stroke: 'rgba(253, 224, 71, 0.45)' }
    }
    if (isPrepCenter) {
      return { fill: 'rgba(59, 130, 196, 0.42)', stroke: 'rgba(147, 197, 253, 0.65)' }
    }
    return { fill: 'rgba(15, 23, 42, 0.85)', stroke: 'rgba(148, 163, 184, 0.45)' }
  }

  function toggleNode(nodeId) {
    setCompletedIds((prev) => {
      const set = new Set(prev)
      if (set.has(nodeId)) {
        set.delete(nodeId)
        return stripInvalidMapCompletions([...set])
      }
      const node = econPrepMapById[nodeId]
      if (!node || !nodeRequirementsMet(node, set)) {
        return prev
      }
      set.add(nodeId)
      return stripInvalidMapCompletions([...set])
    })
  }

  return (
    <div className="space-y-4">
      {showBackLink && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-silver/35 bg-slate-950/50 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-silver/35 hover:text-silver"
          >
            ← Back to UCSB SILVER
          </Link>
          <p className="text-xs text-slate-500">Progress is saved only in this browser.</p>
        </div>
      )}

      <p className="text-sm leading-6 text-slate-400">
        {ECON_MAJOR_SHEET_LABEL} Economics B.A. prep map. The <span className="text-sky-200">blue zone</span>{' '}
        is pre-major and preparation; the <span className="text-gold">gold zone</span> is upper division. Use
        zoom to fit your screen.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-silver/30 bg-slate-950/40 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/10 px-2 py-1">
            <span className="h-2 w-2 rounded-sm bg-sky-400/60" />
            Pre-major &amp; prep
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-2 py-1">
            <span className="h-2 w-2 rounded-sm bg-gold/60" />
            Upper division
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ZoomButton onClick={zoomOut} disabled={zoom <= ZOOM_MIN} title="Zoom out">
            −
          </ZoomButton>
          <span className="min-w-[3.25rem] text-center text-xs font-semibold tabular-nums text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <ZoomButton onClick={zoomIn} disabled={zoom >= ZOOM_MAX} title="Zoom in">
            +
          </ZoomButton>
          <ZoomButton onClick={() => setZoom(ZOOM_DEFAULT)} title="Reset zoom">
            Fit
          </ZoomButton>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-silver/30 bg-slate-950/40 p-4 shadow-inner max-h-[min(72vh,620px)]">
        <svg
          role="img"
          aria-label="Economics prerequisite flowchart"
          width={displayWidth}
          height={displayHeight}
          viewBox={`0 0 ${width} ${height}`}
          className="block font-sans"
          style={{ minWidth: displayWidth }}
        >
          <defs>
            {uniqueEdgeStrokes.map((stroke, i) => (
              <marker
                key={stroke}
                id={`flow-arrow-${i}`}
                markerWidth="9"
                markerHeight="9"
                refX="8"
                refY="4.5"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M0,0 L9,4.5 L0,9 z" fill={stroke} />
              </marker>
            ))}
          </defs>

          {zones.map((zone) => (
            <g key={zone.id}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                rx={18}
                fill={
                  zone.id === 'premajor'
                    ? 'rgba(30, 58, 95, 0.42)'
                    : 'rgba(69, 45, 10, 0.28)'
                }
                stroke={
                  zone.id === 'premajor'
                    ? 'rgba(125, 211, 252, 0.35)'
                    : 'rgba(254, 188, 17, 0.4)'
                }
                strokeWidth={2}
              />
              <text
                x={zone.x + 18}
                y={zone.y + 26}
                className={`text-[12px] font-bold uppercase tracking-[0.14em] ${
                  zone.id === 'premajor' ? 'fill-sky-200' : 'fill-gold'
                }`}
              >
                {zone.label}
              </text>
              <text x={zone.x + 18} y={zone.y + 44} className="fill-slate-400 text-[11px]">
                {zone.sublabel}
              </text>
            </g>
          ))}

          <line
            x1={640}
            y1={24}
            x2={640}
            y2={height - 24}
            stroke="rgba(203, 213, 225, 0.2)"
            strokeWidth={2}
            strokeDasharray="6 6"
          />

          {edges.map((edge) => {
            const fromNode = flowById[edge.from]
            const toNode = flowById[edge.to]
            if (!fromNode || !toNode) {
              return null
            }
            const d = flowEdgePath(fromNode, toNode, edge.fromSide, edge.toSide)
            const stroke = edge.stroke || '#94a3b8'
            const markerIdx = uniqueEdgeStrokes.indexOf(stroke)
            const headDone = toNode.kind === 'course' && done.has(edge.to)
            const opacity = headDone ? 0.95 : 0.85
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={d}
                fill="none"
                stroke={stroke}
                strokeOpacity={opacity}
                strokeWidth="2.25"
                markerEnd={`url(#flow-arrow-${markerIdx >= 0 ? markerIdx : 0})`}
              />
            )
          })}

          {nodes.map((node) => {
            if (node.kind === 'gate') {
              const isOr = node.gateKind === 'or'
              return (
                <g key={node.id}>
                  <polygon
                    points={gateDiamondPoints(node)}
                    fill={isOr ? 'rgba(254, 243, 199, 0.92)' : 'rgba(248, 250, 252, 0.94)'}
                    stroke={isOr ? 'rgba(251, 191, 36, 0.85)' : 'rgba(100, 116, 139, 0.9)'}
                    strokeWidth="1.25"
                  />
                  <text
                    x={node.x + node.w / 2}
                    y={node.y + node.h / 2 + 4}
                    textAnchor="middle"
                    className={`text-[12px] font-bold ${isOr ? 'fill-amber-800' : 'fill-slate-700'}`}
                  >
                    {node.label}
                  </text>
                </g>
              )
            }

            const courseNode = econPrepMapById[node.id]
            const unlocked = courseNode ? isUnlockedCourse(node) : false
            const complete = courseNode ? isCompleteCourse(node) : false
            const missing = courseNode ? missingLabels(node) : []
            const interactive = courseNode && (unlocked || complete)
            const { fill, stroke } = courseStroke(node)
            const title = !unlocked && missing.length ? `Locked — needs: ${missing.join(', ')}` : node.label

            return (
              <g
                key={node.id}
                className={interactive ? 'cursor-pointer' : 'cursor-not-allowed'}
                onClick={() => interactive && toggleNode(node.id)}
              >
                <title>{title}</title>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  rx={node.id === 'udElectives' ? 16 : 14}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2"
                />
                <text
                  x={node.x + 16}
                  y={node.y + 32}
                  className="fill-white text-[15px] font-semibold tracking-tight"
                >
                  {node.label}
                </text>
                <text x={node.x + 16} y={node.y + 54} className="fill-slate-300 text-[12px]">
                  {node.subtitle}
                </text>
                {complete && (
                  <text
                    x={node.x + node.w - 14}
                    y={node.y + 32}
                    textAnchor="end"
                    className="fill-emerald-300 text-[11px] font-bold uppercase tracking-[0.12em]"
                  >
                    Done
                  </text>
                )}
                {!complete && unlocked && (
                  <text
                    x={node.x + node.w - 14}
                    y={node.y + 32}
                    textAnchor="end"
                    className="fill-sky-200 text-[11px] font-bold uppercase tracking-[0.12em]"
                  >
                    Tap
                  </text>
                )}
                {!unlocked && !complete && (
                  <text
                    x={node.x + node.w - 14}
                    y={node.y + 32}
                    textAnchor="end"
                    className="fill-slate-500 text-[11px] font-bold uppercase tracking-[0.12em]"
                  >
                    Locked
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="rounded-2xl border border-silver/30 bg-slate-950/50 px-3 py-1">
          Use <span className="font-semibold text-slate-300">− / +</span> or <span className="font-semibold text-slate-300">Fit</span> to resize the map; scroll inside the frame if needed.
        </span>
        <span className="rounded-2xl border border-silver/30 bg-slate-950/50 px-3 py-1">
          <span className="font-semibold text-slate-300">All</span> = every incoming branch must be complete.
        </span>
        <span className="rounded-2xl border border-silver/30 bg-slate-950/50 px-3 py-1">
          Complete <span className="font-semibold text-slate-300">ECON 5</span> or{' '}
          <span className="font-semibold text-slate-300">PSTAT 120A</span> before UD electives unlock.
        </span>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Check prerequisites in{' '}
        <GoldLink href="https://my.sa.ucsb.edu/gold/" className="!border-0 !bg-transparent !px-0 !py-0 font-semibold underline underline-offset-2">
          Gaucho GOLD
        </GoldLink>
        , the{' '}
        <a
          className="font-semibold text-slate-300 underline-offset-2 hover:text-silver hover:underline"
          href="https://catalog.ucsb.edu/"
          target="_blank"
          rel="noreferrer"
        >
          UCSB General Catalog
        </a>
        , and with L&S and Economics advising. ECON 199RA does not count toward the UD major; max 4 units of ECON
        199 apply.
      </p>
    </div>
  )
}
