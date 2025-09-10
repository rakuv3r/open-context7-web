import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'open-context7 - Up-to-date documentation for LLMs and AI code editors',
  description: 'Up-to-date, version-specific documentation and code examples for LLMs and AI code editors.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="font-system antialiased">
      <body className="min-h-screen bg-stone-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}