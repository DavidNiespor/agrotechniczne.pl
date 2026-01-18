// @ts-nocheck
import type { Metadata } from 'next'
import Providers from '../components/Providers';

export const metadata: Metadata = {
  title: 'agrotechniczne.pl',
  description: 'System zarządzania gospodarstwem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}