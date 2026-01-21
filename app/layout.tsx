import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ToastContainer } from '@/components/ui/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'VIVR - Décoration Intérieure Élégante',
    template: '%s | VIVR',
  },
  description:
    'Découvrez notre collection de décoration intérieure minimaliste et élégante. Transformez votre espace de vie avec VIVR.',
  keywords: [
    'décoration',
    'intérieur',
    'design',
    'mobilier',
    'maison',
    'minimaliste',
    'élégant',
  ],
  authors: [{ name: 'VIVR' }],
  creator: 'VIVR',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://vivr.fr',
    siteName: 'VIVR',
    title: 'VIVR - Décoration Intérieure Élégante',
    description:
      'Découvrez notre collection de décoration intérieure minimaliste et élégante.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VIVR - Décoration Intérieure',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VIVR - Décoration Intérieure Élégante',
    description:
      'Découvrez notre collection de décoration intérieure minimaliste et élégante.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  )
}
