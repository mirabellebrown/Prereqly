import './globals.css'
import { Analytics } from '@vercel/analytics/react'

export const metadata = {
  title: 'UCSB SILVER | Planning alongside Gaucho GOLD',
  description:
    'UCSB SILVER is a clickable UCSB Letters & Science planning prototype for course planning, degree progress, important dates, and Campus Q&A with official sources—designed to work alongside Gaucho GOLD.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
