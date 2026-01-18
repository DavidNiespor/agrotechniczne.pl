import type { Metadata } from 'next'
import Providers from '../components/Providers';

export const metadata: Metadata = {
  title: 'agrotechniczne.pl - Twój asystent w polu',
  description: 'Nowoczesny portal SaaS dla rolnictwa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <head>
        {/* Użycie CDN dla Tailwind aby zachować zgodność z oryginalnym index.html */}
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  sans: ['Inter', 'sans-serif'],
                },
                colors: {
                  agro: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                  }
                }
              }
            }
          }
        `}} />
        <style>{`body { background-color: #f3f4f6; }`}</style>
      </head>
      <body>
        <Providers>
          <div id="root">{children}</div>
        </Providers>
      </body>
    </html>
  )
}