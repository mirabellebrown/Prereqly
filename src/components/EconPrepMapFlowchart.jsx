'use client'

import Link from 'next/link'
import { GoldLink } from './GoldLink'
import { useEffect, useMemo, useState } from 'react'
import { econPrepFlowchart } from '../mockData'
import {
 econPrepMapById,
 flowById,
 flowEdgePath,
 gateDiamondPoints,
 stripInvalidMapCompletions,
} from '../lib/econPrepFlowchartUtils'

const STORAGE_KEY = 'ucsb-silver-econ-map'
const LEGACY_STORAGE_KEY = 'prereqly-econ-map'

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

export function EconPrepMapFlowchart({ showBackLink = true }) {
 const [completedIds, setCompletedIds] = useState(() => readStoredIds() ?? stripInvalidMapCompletions(['econ1', 'math3a']))

 useEffect(() => {
 writeStoredIds(completedIds)
 }, [completedIds])

 const done = useMemo(() => new Set(completedIds), [completedIds])
 const { width, height, edges, nodes } = econPrepFlowchart

 const uniqueEdgeStrokes = useMemo(() => {
 const list = edges.map((e) => e.stroke || '#94a3b8')
 return [...new Set(list)]
 }, [edges])

 function isUnlockedCourse(node) {
 if (node.kind !== 'course') {
 return false
 }
 return (node.requires ?? []).every((id) => done.has(id))
 }

 function isCompleteCourse(node) {
 return node.kind === 'course' && done.has(node.id)
 }

 function missingLabels(node) {
 return (node.requires ?? [])
 .filter((id) => !done.has(id))
 .map((id) => econPrepMapById[id]?.label ?? id)
 }

 function courseStroke(node) {
 if (isCompleteCourse(node)) {
 return { fill: 'rgba(6, 78, 59, 0.45)', stroke: '#34d399' }
 }
 if (isUnlockedCourse(node)) {
 return { fill: 'rgba(30, 58, 138, 0.35)', stroke: '#7dd3fc' }
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
 if (!node || !(node.requires ?? []).every((reqId) => set.has(reqId))) {
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
 className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-silver/35 hover:text-silver"
 >
 ← Back to UCSB SILVER
 </Link>
 <p className="text-xs text-slate-500">Progress is saved only in this browser.</p>
 </div>
 )}

 <div className="overflow-x-auto rounded-2xl border border-silver/20 bg-[#0c1522] p-6 shadow-inner">
 <svg
 role="img"
 aria-label="Economics prerequisite flowchart"
 width={width}
 height={height}
 viewBox={`0 0 ${width} ${height}`}
 className="mx-auto min-w-0 font-sans"
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
 return (
 <g key={node.id}>
 <polygon
 points={gateDiamondPoints(node)}
 fill="rgba(248, 250, 252, 0.94)"
 stroke="rgba(100, 116, 139, 0.9)"
 strokeWidth="1.25"
 />
 <text
 x={node.x + node.w / 2}
 y={node.y + node.h / 2 + 4}
 textAnchor="middle"
 className="fill-slate-700 text-[12px] font-bold"
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
 rx={node.id === 'fullMajor' ? 16 : 14}
 fill={fill}
 stroke={stroke}
 strokeWidth="2"
 />
 <text x={node.x + 16} y={node.y + 32} className="fill-white text-[15px] font-semibold tracking-tight">
 {node.label}
 </text>
 <text x={node.x + 16} y={node.y + 54} className="fill-slate-400 text-[12px]">
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
 <span className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-1">
 Each arrow color matches one branch so you can follow paths when lines cross.
 </span>
 <span className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-1">
 <span className="font-semibold text-slate-300">All</span> = every incoming branch must be complete.
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
 , and with L&S and Economics advising.
 </p>
 </div>
 )
}
