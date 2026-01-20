'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Product, Category } from '@/types'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

// Mock data
const mockCategories: Record<string, Category> = {
  salon: { id: '1', name: 'Salon', slug: 'salon', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200' },
  chambre: { id: '2', name: 'Chambre', slug: 'chambre', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200' },
  cuisine: { id: '3', name: 'Cuisine', slug: 'cuisine', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200' },
  bureau: { id: '4', name: 'Bureau', slug: 'bureau', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200' },
  'salle-de-bain': { id: '5', name: 'Salle de bain', slug: 'salle-de-bain', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200' },
  exterieur: { id: '6', name: 'Extérieur', slug: 'exterieur', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200' },
}

const sortOptions = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'popular', label: 'Populaires' },
]

interface Props {
  params: Promise<{ category: string }>
}

export default function CategoryPage({ params }: Props) {
  const { category: categorySlug } = use(params)
  const [sortBy, setSortBy] = useState('newest')

  const category = mockCategories[categorySlug]

  // Mock products for this category
  const mockProducts: Product[] = Array.from({ length: 8 }, (_, i) => ({
    id: `${categorySlug}-${i + 1}`,
    name: `Produit ${category?.name || ''} ${i + 1}`,
    slug: `produit-${categorySlug}-${i + 1}`,
    description: 'Description du produit',
    price: Math.floor(Math.random() * 200) + 20,
    comparePrice: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 200 : undefined,
    images: [`https://images.unsplash.com/photo-${1507473885765 + i * 100000}-e6ed057f782c?w=600`],
    category: category || { id: '1', name: 'Inconnu', slug: 'inconnu' },
    categoryId: category?.id || '1',
    stock: Math.floor(Math.random() * 50),
    featured: Math.random() > 0.7,
    reviews: [],
    createdAt: new Date(),
  }))

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          Catégorie non trouvée
        </h1>
        <p className="text-text-secondary mb-8">
          Cette catégorie n'existe pas ou a été supprimée.
        </p>
        <Link href="/produits">
          <Button>Voir tous les produits</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-64 lg:h-80">
        <Image
          src={category.image || '/images/placeholder.jpg'}
          alt={category.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl lg:text-5xl font-bold">{category.name}</h1>
            <p className="mt-2 text-lg text-white/80">
              Découvrez notre collection
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/categories" className="hover:text-text-primary transition-colors">
            Catégories
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-text-primary">{category.name}</span>
        </nav>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-text-secondary">
            {mockProducts.length} produit{mockProducts.length > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid products={mockProducts} columns={4} />
      </div>
    </div>
  )
}
