'use client'

import { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  columns?: 2 | 3 | 4
  className?: string
}

export function ProductGrid({
  products,
  isLoading = false,
  columns = 4,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={8} />
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-secondary">Aucun produit trouvé</p>
      </div>
    )
  }

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  )
}
