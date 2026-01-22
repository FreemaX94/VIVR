'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Percent, Tag, Timer, Flame } from 'lucide-react'
import { Product, Category } from '@/types'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { Select } from '@/components/ui/Select'

// Mock data - Products on sale
const mockCategories: Category[] = [
  { id: '1', name: 'Salon', slug: 'salon' },
  { id: '2', name: 'Chambre', slug: 'chambre' },
  { id: '3', name: 'Cuisine', slug: 'cuisine' },
  { id: '4', name: 'Bureau', slug: 'bureau' },
  { id: '5', name: 'Salle de bain', slug: 'salle-de-bain' },
  { id: '6', name: 'Extérieur', slug: 'exterieur' },
]

const promoProductImages = [
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80',
  'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600&q=80',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
  'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80',
]

const promoProductNames = [
  'Canapé 3 places Oslo',
  'Lampe design Copenhague',
  'Table de chevet Malmo',
  'Fauteuil club vintage',
  'Bibliothèque industrielle',
  'Suspension LED moderne',
  'Commode scandinave',
  'Miroir rectangulaire doré',
  'Coussin déco lin',
  'Cadre photo bois',
]

// Generate mock promotional products with discounts
const mockPromoProducts: Product[] = Array.from({ length: 10 }, (_, i) => {
  const originalPrice = Math.floor(Math.random() * 300) + 100
  const discountPercent = [20, 25, 30, 35, 40, 50][Math.floor(Math.random() * 6)]
  const salePrice = Math.floor(originalPrice * (1 - discountPercent / 100))

  return {
    id: `promo-${i + 1}`,
    name: promoProductNames[i],
    slug: promoProductNames[i].toLowerCase().replace(/\s+/g, '-').replace(/[éè]/g, 'e'),
    description: 'Profitez de cette offre exceptionnelle',
    price: salePrice,
    comparePrice: originalPrice,
    images: [promoProductImages[i]],
    category: mockCategories[i % mockCategories.length],
    categoryId: mockCategories[i % mockCategories.length].id,
    stock: Math.floor(Math.random() * 15) + 3,
    featured: i < 4,
    reviews: [],
    createdAt: new Date(),
  }
})

const sortOptions = [
  { value: 'discount', label: 'Meilleures réductions' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'newest', label: 'Plus récents' },
]

function PromotionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products] = useState<Product[]>(mockPromoProducts)

  const sortBy = searchParams.get('sort') || 'discount'

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/promotions?${params.toString()}`)
  }

  // Calculate discount percentage
  const getDiscount = (product: Product) => {
    if (!product.comparePrice) return 0
    return Math.round((1 - product.price / product.comparePrice) * 100)
  }

  // Calculate total savings
  const totalSavings = products.reduce((acc, product) => {
    if (product.comparePrice) {
      return acc + (product.comparePrice - product.price)
    }
    return acc
  }, 0)

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'discount':
        return getDiscount(b) - getDiscount(a)
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-600 via-pink-600 to-purple-700">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className="h-6 w-6 text-yellow-400 animate-pulse" />
              <span className="text-sm uppercase tracking-wider font-medium bg-white/20 px-3 py-1 rounded-full">
                Offres Limitées
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              Jusqu'à <span className="text-yellow-400">-50%</span>
            </h1>
            <p className="text-lg text-white/90 max-w-xl mx-auto">
              Profitez de nos meilleures offres sur une sélection de produits déco
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 text-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Percent className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-text-primary">-50%</p>
            <p className="text-sm text-text-secondary">Max. réduction</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Tag className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{products.length}</p>
            <p className="text-sm text-text-secondary">Produits en promo</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">€</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{totalSavings.toFixed(0)}€</p>
            <p className="text-sm text-text-secondary">Économies totales</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Timer className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-text-primary">48h</p>
            <p className="text-sm text-text-secondary">Livraison express</p>
          </div>
        </motion.div>

        {/* Urgent Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-black text-white rounded-xl p-4 mb-10 flex items-center justify-center gap-3"
        >
          <Flame className="h-5 w-5 text-orange-500" />
          <p className="text-sm font-medium">
            Stock limité ! Ces offres sont valables dans la limite des stocks disponibles
          </p>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-border-light">
          <div>
            <p className="text-text-secondary">
              {sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''} en promotion
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary hidden sm:inline">Trier par</span>
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => updateSort(e.target.value)}
              className="w-48"
            />
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid products={sortedProducts} columns={4} />

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 lg:p-12 text-center text-white"
        >
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            Ne ratez plus aucune promotion !
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Inscrivez-vous à notre newsletter et recevez en exclusivité nos meilleures offres avant tout le monde
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
              S'inscrire
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function PromotionsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={10} />}>
      <PromotionsContent />
    </Suspense>
  )
}
