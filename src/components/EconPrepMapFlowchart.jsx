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
const ZOOM_MIN = 0.4
const ZOOM_MAX = 1.45
const ZOOM_STEP = 0.08
const ZOOM_DEFAULT = 0.58

const ZONE_STYLES = {
  admission: {
    fill: 'rgba(37, 99, 235, 0.28)',
    stroke: '#60a5fa',
    headerFill: '#1d4ed8',
    stepFill: '#3b82f6',
    titleClass: 'fill-white',
    subClass: 'fill-blue-100',
  },
  prep: {
    fill: 'rgba(13, 148, 136, 0.24)',
    stroke: '#2dd4bf',
    headerFill: '#0f766e',
    stepFill: '#14b8a6',
    titleClass: 'fill-white',
    subClass: 'fill-teal-100',
  },
  major: {
    fill: 'rgba(146, 64, 14, 0.32)',
    stroke: '#fbbf24',
    headerFill: '#b45309',
    stepFill: '#f59e0b',
    titleClass: 'fill-white',
    subClass: 'fill-amber-100',
  },
}

const TRACK_STYLES = {
  admission: {
    locked: { fill: 'rgba(30, 58, 138, 0.75)', stroke: '#60a5fa' },
    unlocked: { fill: 'rgba(59, 130, 246, 0.45)', stroke: '#93c5fd' },
    complete: { fill: 'rgba(37, 99, 235, 0.5)', stroke: '#bfdbfe' },
  },
  prep: {
    locked: { fill: 'rgba(15, 60, 55, 0.8)', stroke: '#2dd4bf' },
    unlocked: { fill: 'rgba(20, 120, 110, 0.5)', stroke: '#5eead4' },
    complete: { fill: 'rgba(13, 148, 136, 0.45)', stroke: '#99f6e4' },
  },
  major: {
    locked: { fill: 'rgba(69, 45, 10, 0.75)', stroke: '#fbbf24' },
    unlocked: { fill: 'rgba(180, 120, 20, 0.5)', stroke: '#fde047' },
    complete: { fill: 'rgba(146, 64, 14, 0.55)', stroke: '#fcd34d' },
  },
}


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

export function EconPrepMapFlowchart({ showBackLink = true, variant = 'standalone' }) {
  const [completedIds, setCompletedIds] = useState(
    () => readStoredIds() ?? stripInvalidMapCompletions(['econ1', 'math3a']),
  )
  const [zoom, setZoom] = useState(ZOOM_DEFAULT)

  useEffect(() => {
    writeStoredIds(completedIds)
  }, [completedIds])

  const done = useMemo(() => new Set(completedIds), [completedIds])
  const {
    width,
    height,
    edges,
    nodes,
    zones = [],
    dividerX = 632,
    stepDividerY = 228,
  } = econPrepFlowchart
  const isStandalone = variant === 'standalone'

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
    const track = node.track ?? (node.phase === 'upper' ? 'major' : 'prep')
    const palette = TRACK_STYLES[track] ?? TRACK_STYLES.prep

    if (isCompleteCourse(node)) {
      return palette.complete
    }
    if (isUnlockedCourse(node)) {
      return palette.unlocked
    }
    return palette.locked
  }

  function renderZone(zone) {
    const style = ZONE_STYLES[zone.track] ?? ZONE_STYLES.prep
    const headerH = 48

    return (
      <g key={zone.id}>
        <rect
          x={zone.x}
          y={zone.y}
          width={zone.w}
          height={zone.h}
          rx={16}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={2}
        />
        <rect
          x={zone.x}
          y={zone.y}
          width={zone.w}
          height={headerH}
          rx={16}
          fill={style.headerFill}
        />
        <rect x={zone.x} y={zone.y + 38} width={zone.w} height={12} fill={style.headerFill} />
        <rect
          x={zone.x + 12}
          y={zone.y + 10}
          width={64}
          height={20}
          rx={5}
          fill={style.stepFill}
        />
        <text
          x={zone.x + 44}
          y={zone.y + 24}
          textAnchor="middle"
          className="fill-white text-[9px] font-bold uppercase tracking-[0.1em]"
        >
          {zone.step}
        </text>
        <text x={zone.x + 84} y={zone.y + 22} className={`text-[13px] font-bold ${style.titleClass}`}>
          {zone.label}
        </text>
        <text x={zone.x + 84} y={zone.y + 38} className={`text-[10px] ${style.subClass}`}>
          {zone.sublabel}
        </text>
      </g>
    )
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
    <div className="space-y-6 pt-1">
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

      {isStandalone && (
        <p className="text-sm leading-6 text-slate-400">
          {ECON_MAJOR_SHEET_LABEL} Economics B.A. — blue/teal = pre-major path; gold = upper division. Zoom
          with <strong className="font-semibold text-slate-200">− / +</strong>, then scroll the map.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-silver/30 bg-slate-950/40 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/40 bg-blue-500/15 px-2 py-1 text-blue-200">
            Step 1 · Admission
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400/40 bg-teal-500/15 px-2 py-1 text-teal-200">
            Step 2 · Prep
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/15 px-2 py-1 text-amber-200">
            Step 3 · Major
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

      <div
        className={`overflow-auto rounded-2xl border border-silver/30 bg-slate-950/40 p-6 shadow-inner ${
          isStandalone ? 'max-h-[min(88vh,920px)] min-h-[420px]' : 'max-h-[min(72vh,620px)]'
        }`}
      >
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

          {zones.map(renderZone)}

          <line
            x1={24}
            y1={stepDividerY}
            x2={616}
            y2={stepDividerY}
            stroke="#2dd4bf"
            strokeWidth={1.5}
            strokeDasharray="8 5"
            strokeOpacity={0.45}
          />

          <line
            x1={dividerX}
            y1={24}
            x2={dividerX}
            y2={height - 24}
            stroke="rgba(251, 191, 36, 0.2)"
            strokeWidth={10}
          />
          <line
            x1={dividerX}
            y1={24}
            x2={dividerX}
            y2={height - 24}
            stroke="#fbbf24"
            strokeWidth={2.5}
            strokeOpacity={0.85}
          />
          <text
            x={dividerX + 12}
            y={height / 2}
            className="fill-amber-200/90 text-[10px] font-bold uppercase tracking-[0.1em]"
            transform={`rotate(-90 ${dividerX + 12} ${height / 2})`}
          >
            Declare major →
          </text>

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
            const opacity = headDone ? 0.9 : 0.55
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={d}
                fill="none"
                stroke={stroke}
                strokeOpacity={opacity}
                strokeWidth="1.5"
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
                    className={`text-[10px] font-bold ${isOr ? 'fill-amber-800' : 'fill-slate-700'}`}
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
                  rx={10}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.75}
                />
                <text
                  x={node.x + 10}
                  y={node.y + 22}
                  className="fill-white text-[12px] font-semibold tracking-tight"
                >
                  {node.label}
                </text>
                <text x={node.x + 10} y={node.y + 40} className="fill-slate-300 text-[9px]">
                  {node.subtitle}
                </text>
                {complete && (
                  <text
                    x={node.x + node.w - 8}
                    y={node.y + node.h - 8}
                    textAnchor="end"
                    className="fill-emerald-300 text-[8px] font-bold uppercase tracking-[0.1em]"
                  >
                    Done
                  </text>
                )}
                {!complete && unlocked && (
                  <text
                    x={node.x + node.w - 8}
                    y={node.y + node.h - 8}
                    textAnchor="end"
                    className="fill-sky-200 text-[8px] font-bold uppercase tracking-[0.1em]"
                  >
                    Tap
                  </text>
                )}
                {!unlocked && !complete && (
                  <text
                    x={node.x + node.w - 8}
                    y={node.y + node.h - 8}
                    textAnchor="end"
                    className="fill-slate-500 text-[8px] font-bold uppercase tracking-[0.1em]"
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
