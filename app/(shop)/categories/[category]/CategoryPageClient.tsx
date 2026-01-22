'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Product, Category } from '@/types'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

const sortOptions = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'popular', label: 'Populaires' },
]

interface CategoryPageClientProps {
  category: Category
  products: Product[]
}

export function CategoryPageClient({ category, products }: CategoryPageClientProps) {
  const [sortBy, setSortBy] = useState('newest')

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'popular':
        return (b.reviews?.length || 0) - (a.reviews?.length || 0)
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-64 lg:h-80">
        <Image
          src={category.image || '/images/placeholder.jpg'}
          alt={`Collection ${category.name} - Décoration intérieure VIVR`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white animate-fade-in">
            <h1 className="text-4xl lg:text-5xl font-bold">{category.name}</h1>
            <p className="mt-2 text-lg text-white/80">
              Découvrez notre collection
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <Link href="/produits" className="hover:text-text-primary transition-colors">
            Produits
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="text-text-primary" aria-current="page">{category.name}</span>
        </nav>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-text-secondary">
            {sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" className="lg:hidden" aria-label="Ouvrir les filtres">
              <SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden="true" />
              Filtres
            </Button>
            <label htmlFor="sort-select" className="sr-only">Trier par</label>
            <Select
              id="sort-select"
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid products={sortedProducts} columns={4} />
      </div>
    </div>
  )
}
