'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, Clock, ArrowRight } from 'lucide-react'
import { Product, Category } from '@/types'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { Select } from '@/components/ui/Select'

// Mock data - New arrivals (products from last 30 days)
const mockCategories: Category[] = [
  { id: '1', name: 'Salon', slug: 'salon' },
  { id: '2', name: 'Chambre', slug: 'chambre' },
  { id: '3', name: 'Cuisine', slug: 'cuisine' },
  { id: '4', name: 'Bureau', slug: 'bureau' },
  { id: '5', name: 'Salle de bain', slug: 'salle-de-bain' },
  { id: '6', name: 'Extérieur', slug: 'exterieur' },
]

const newProductImages = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80',
  'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80',
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80',
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80',
]

const newProductNames = [
  'Lampe suspendue design',
  'Fauteuil velours émeraude',
  'Table basse en marbre',
  'Étagère murale modulable',
  'Set de vases céramique',
  'Tapis berbère authentique',
  'Miroir art déco',
  'Pouf en cuir naturel',
]

// Generate mock new products
const mockNewProducts: Product[] = Array.from({ length: 8 }, (_, i) => {
  const daysAgo = Math.floor(Math.random() * 14) + 1 // Products from last 14 days
  const createdAt = new Date()
  createdAt.setDate(createdAt.getDate() - daysAgo)

  return {
    id: `new-${i + 1}`,
    name: newProductNames[i],
    slug: newProductNames[i].toLowerCase().replace(/\s+/g, '-').replace(/[éè]/g, 'e'),
    description: 'Nouvelle arrivée dans notre collection',
    price: Math.floor(Math.random() * 200) + 49,
    comparePrice: undefined,
    images: [newProductImages[i]],
    category: mockCategories[i % mockCategories.length],
    categoryId: mockCategories[i % mockCategories.length].id,
    stock: Math.floor(Math.random() * 30) + 5,
    featured: i < 3,
    isNew: true,
    reviews: [],
    createdAt,
  }
})

const sortOptions = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
]

function NouveautesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products] = useState<Product[]>(mockNewProducts)

  const sortBy = searchParams.get('sort') || 'newest'

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/nouveautes?${params.toString()}`)
  }

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80"
            alt="Nouveautés VIVR"
            fill
            priority
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <span className="text-sm uppercase tracking-wider font-medium">
                Nouvelle Collection
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Nouveautés</h1>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Découvrez nos dernières arrivées et soyez les premiers à adopter les tendances déco du moment
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-10 flex items-center gap-4"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Mis à jour régulièrement</h3>
            <p className="text-sm text-text-secondary">
              Notre collection s'enrichit chaque semaine de nouvelles pièces sélectionnées avec soin
            </p>
          </div>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-border-light">
          <div>
            <p className="text-text-secondary">
              {sortedProducts.length} nouveau{sortedProducts.length > 1 ? 'x' : ''} produit{sortedProducts.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary hidden sm:inline">Trier par</span>
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => updateSort(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid products={sortedProducts} columns={4} />

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Vous ne trouvez pas votre bonheur ?
          </h2>
          <p className="text-text-secondary mb-6">
            Explorez notre catalogue complet avec plus de 500 références
          </p>
          <a
            href="/produits"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Voir tous les produits
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </div>
  )
}

export default function NouveautesPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={8} />}>
      <NouveautesContent />
    </Suspense>
  )
}
