import Image from 'next/image'
import Link from 'next/link'

const LOGO_ASPECT = 1020 / 224

/**
 * @param {{
 *   height?: number
 *   className?: string
 *   priority?: boolean
 *   href?: string | null
 *   onClick?: () => void
 * }} props
 */
export function SilverLogo({
  height = 40,
  className = '',
  priority = false,
  href = '/',
  onClick,
}) {
  const width = Math.round(height * LOGO_ASPECT)
  const wrapperClass =
    'inline-flex shrink-0 items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-silver/50'

  const image = (
    <Image
      src="/silver-logo.png"
      alt="UCSB SILVER"
      width={width}
      height={height}
      priority={priority}
      className={`object-contain ${className}`.trim()}
      style={{ height, width: 'auto', maxWidth: `min(100%, ${width}px)` }}
    />
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={wrapperClass} aria-label="Back to dashboard">
        {image}
      </button>
    )
  }

  if (href) {
    return (
      <Link href={href} className={wrapperClass} aria-label="UCSB SILVER home">
        {image}
      </Link>
    )
  }

  return image
}
