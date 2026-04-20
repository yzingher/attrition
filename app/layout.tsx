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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-surface text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  )
}
