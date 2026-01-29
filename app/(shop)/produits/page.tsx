'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Product, Category } from '@/types'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { cn, formatPrice } from '@/lib/utils'

// Mock data for development
const mockCategories: Category[] = [
  { id: '1', name: 'Salon', slug: 'salon' },
  { id: '2', name: 'Chambre', slug: 'chambre' },
  { id: '3', name: 'Cuisine', slug: 'cuisine' },
  { id: '4', name: 'Bureau', slug: 'bureau' },
  { id: '5', name: 'Salle de bain', slug: 'salle-de-bain' },
  { id: '6', name: 'Extérieur', slug: 'exterieur' },
]

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg'

const sortOptions = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'popular', label: 'Populaires' },
]

const priceRanges = [
  { label: 'Moins de 50€', min: 0, max: 50 },
  { label: '50€ - 100€', min: 50, max: 100 },
  { label: '100€ - 200€', min: 100, max: 200 },
  { label: 'Plus de 200€', min: 200, max: undefined },
]

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Get filter values from URL
  const categoryFilter = searchParams.get('category')
  const sortBy = searchParams.get('sort') || 'newest'
  const search = searchParams.get('search')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('limit', '50')
        if (categoryFilter) params.set('category', categoryFilter)
        if (search) params.set('search', search)
        if (sortBy) params.set('sort', sortBy)
        if (minPrice) params.set('minPrice', minPrice)
        if (maxPrice) params.set('maxPrice', maxPrice)

        const res = await fetch(`/api/products?${params.toString()}`)
        const data = await res.json()

        if (data.success && data.data) {
          const mapped = data.data.map((p: any) => ({
            ...p,
            images: Array.isArray(p.images) && p.images.length > 0
              ? p.images
              : [PLACEHOLDER_IMAGE],
            category: p.category || { id: '', name: 'Sans catégorie', slug: 'sans-categorie' },
            reviews: p.reviews || [],
            createdAt: new Date(p.createdAt),
          }))
          setProducts(mapped)
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [categoryFilter, sortBy, search, minPrice, maxPrice])

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/produits?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/produits')
  }

  const hasActiveFilters = categoryFilter || minPrice || maxPrice || search

  // Products are already filtered and sorted by the API
  const sortedProducts = products

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">
          {search ? `Résultats pour "${search}"` : 'Tous nos produits'}
        </h1>
        <p className="mt-2 text-text-secondary">
          {sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''} trouvé{sortedProducts.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-border-light">
        <div className="flex items-center gap-4">
          {/* Mobile Filter Toggle */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          >
            Filtres
          </Button>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="hidden lg:flex items-center gap-2">
              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-bg-secondary rounded-full text-sm">
                  {categories.find((c) => c.slug === categoryFilter)?.name}
                  <button
                    onClick={() => updateFilters('category', null)}
                    className="ml-1 text-text-muted hover:text-text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-bg-secondary rounded-full text-sm">
                  {minPrice && maxPrice
                    ? `${formatPrice(parseFloat(minPrice))} - ${formatPrice(parseFloat(maxPrice))}`
                    : minPrice
                      ? `Plus de ${formatPrice(parseFloat(minPrice))}`
                      : `Moins de ${formatPrice(parseFloat(maxPrice!))}`}
                  <button
                    onClick={() => {
                      updateFilters('minPrice', null)
                      updateFilters('maxPrice', null)
                    }}
                    className="ml-1 text-text-muted hover:text-text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Effacer tout
              </button>
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary hidden sm:inline">Trier par</span>
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-text-primary mb-4">Catégories</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => updateFilters('category', null)}
                    className={cn(
                      'text-sm transition-colors',
                      !categoryFilter
                        ? 'text-text-primary font-medium'
                        : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    Toutes les catégories
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => updateFilters('category', category.slug)}
                      className={cn(
                        'text-sm transition-colors',
                        categoryFilter === category.slug
                          ? 'text-text-primary font-medium'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-text-primary mb-4">Prix</h3>
              <ul className="space-y-2">
                {priceRanges.map((range) => (
                  <li key={range.label}>
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString())
                        if (range.min) params.set('minPrice', String(range.min))
                        else params.delete('minPrice')
                        if (range.max) params.set('maxPrice', String(range.max))
                        else params.delete('maxPrice')
                        router.push(`/produits?${params.toString()}`)
                      }}
                      className={cn(
                        'text-sm transition-colors',
                        (minPrice === String(range.min) || (!minPrice && !range.min)) &&
                        (maxPrice === String(range.max) || (!maxPrice && !range.max))
                          ? 'text-text-primary font-medium'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      {range.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Mobile Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filtres</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-text-muted hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-semibold text-text-primary mb-4">Catégories</h3>
                <ul className="space-y-3">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => {
                          updateFilters('category', category.slug)
                          setShowFilters(false)
                        }}
                        className={cn(
                          'text-sm transition-colors',
                          categoryFilter === category.slug
                            ? 'text-text-primary font-medium'
                            : 'text-text-secondary'
                        )}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="font-semibold text-text-primary mb-4">Prix</h3>
                <ul className="space-y-3">
                  {priceRanges.map((range) => (
                    <li key={range.label}>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString())
                          if (range.min) params.set('minPrice', String(range.min))
                          else params.delete('minPrice')
                          if (range.max) params.set('maxPrice', String(range.max))
                          else params.delete('maxPrice')
                          router.push(`/produits?${params.toString()}`)
                          setShowFilters(false)
                        }}
                        className="text-sm text-text-secondary"
                      >
                        {range.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    clearFilters()
                    setShowFilters(false)
                  }}
                >
                  Effacer les filtres
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <ProductGrid products={sortedProducts} columns={3} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={12} />}>
      <ProductsContent />
    </Suspense>
  )
}
