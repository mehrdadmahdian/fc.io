import type { Metadata } from 'next'
import '@/styles/globals.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

export const metadata: Metadata = {
  title: 'NoName.io - Smart Flashcards',
  description: 'Master any subject with smart flashcards and spaced repetition',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 