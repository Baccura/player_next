import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'

// Initialiser les services automatiques côté serveur
if (typeof window === 'undefined') {
  import('@/lib/init-services')
}

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Transmission Manager',
  description: 'Gestionnaire de fichiers Transmission avec intégration Plex',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
