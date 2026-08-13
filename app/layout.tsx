// @ts-ignore: allow side-effect CSS import without declarations
import './globals.css'
import { Toaster } from 'react-hot-toast'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ztag - Memory Wall',
  description: 'Share private memories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}