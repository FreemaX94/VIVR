import { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vivr.fr'

export const metadata: Metadata = {
  title: 'Tous les Produits - Décoration Intérieure',
  description: 'Parcourez notre catalogue complet de décoration intérieure : meubles, luminaires, accessoires et plus encore. Livraison gratuite dès 50€.',
  keywords: [
    'décoration intérieure',
    'meubles',
    'luminaires',
    'accessoires déco',
    'mobilier design',
    'VIVR',
  ],
  openGraph: {
    title: 'Tous les Produits | VIVR',
    description: 'Parcourez notre catalogue complet de décoration intérieure : meubles, luminaires, accessoires et plus encore.',
    url: `${BASE_URL}/produits`,
    siteName: 'VIVR',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tous les Produits | VIVR',
    description: 'Parcourez notre catalogue complet de décoration intérieure.',
  },
  alternates: {
    canonical: `${BASE_URL}/produits`,
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
