import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Robotica Analytics | Mission Control',
  description: 'Newsletter performance dashboard for Robotica Weekly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  )
}
