import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ATTRITION',
  description: 'Win the war by collapsing their ability to build the next army.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-surface text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  )
}
