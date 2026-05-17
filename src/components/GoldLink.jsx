const GOLD_URL = 'https://my.sa.ucsb.edu/gold/'

export function GoldLink({
 href = GOLD_URL,
 children,
 className = '',
 variant = 'pill',
}) {
 const base =
 variant === 'button'
 ? 'btn-gold inline-flex items-center justify-center gap-2'
 : 'link-gold inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-xs font-semibold'

 return (
 <a href={href} target="_blank" rel="noreferrer" className={`${base} ${className}`.trim()}>
 {children}
 </a>
 )
}

export function GoldSourceChip({ href, label }) {
 return (
 <a
 href={href}
 target="_blank"
 rel="noreferrer"
 className="link-gold rounded-sm px-3 py-2 text-xs font-semibold"
 >
 {label}
 </a>
 )
}
