const STATUS_STYLES = {
  completed: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-100',
  transfer: 'border-silver/30 bg-silver/12 text-silver-bright',
  planned: 'border-sky-400/30 bg-sky-400/12 text-sky-100',
  needed: 'border-silver/35 bg-slate-950/50 text-slate-400',
}

/**
 * @param {{ source: string, status: string }} item
 */
export function getRequirementStatusDisplay(item) {
  if (item.source === 'transfer') {
    return { label: 'Transfer', tone: 'transfer' }
  }
  if (item.status === 'completed') {
    return { label: 'Completed', tone: 'completed' }
  }
  if (item.status === 'planned') {
    return { label: 'In planner', tone: 'planned' }
  }
  return { label: 'Still needed', tone: 'needed' }
}

export function requirementStatusClassName(tone) {
  return STATUS_STYLES[tone] ?? STATUS_STYLES.needed
}
