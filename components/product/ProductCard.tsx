'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { Product } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)

  const addItem = useCartStore((state) => state.addItem)
  const isInCart = useCartStore((state) => state.isInCart(product.id))
  const toggleWishlist = useWishlistStore((state) => state.toggleItem)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id))

  const discount = product.comparePrice
    ? calculateDiscount(product.price, product.comparePrice)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <motion.article
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setImageIndex(0)
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/produits/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-bg-secondary">
          {/* Main Image */}
          <Image
            src={product.images[imageIndex] || '/images/placeholder.jpg'}
            alt={product.name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Image Navigation Dots (if multiple images) */}
          {product.images.length > 1 && isHovered && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {product.images.slice(0, 4).map((_, index) => (
                <button
                  key={index}
                  onMouseEnter={() => setImageIndex(index)}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    imageIndex === index
                      ? 'bg-white w-3'
                      : 'bg-white/60 hover:bg-white/80'
                  )}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge variant="error" size="sm">
                -{discount}%
              </Badge>
            )}
            {product.featured && (
              <Badge variant="primary" size="sm">
                Vedette
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="secondary" size="sm">
                Rupture
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute top-3 right-3 flex flex-col gap-2"
          >
            <button
              onClick={handleToggleWishlist}
              className={cn(
                'p-2 rounded-full backdrop-blur-sm transition-all',
                isInWishlist
                  ? 'bg-black text-white'
                  : 'bg-white/90 text-text-primary hover:bg-white'
              )}
              aria-label={isInWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart
                className={cn('h-4 w-4', isInWishlist && 'fill-current')}
              />
            </button>
            <Link
              href={`/produits/${product.slug}`}
              className="p-2 rounded-full bg-white/90 text-text-primary hover:bg-white backdrop-blur-sm transition-all"
              aria-label="Voir le produit"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Add to Cart Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            className="absolute bottom-3 left-3 right-3"
          >
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={cn(
                'w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all',
                product.stock === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : isInCart
                    ? 'bg-success text-white'
                    : 'bg-black text-white hover:bg-accent-hover'
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              {product.stock === 0
                ? 'Indisponible'
                : isInCart
                  ? 'Dans le panier'
                  : 'Ajouter au panier'}
            </button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="mt-4 space-y-1">
          <p className="text-xs text-text-muted uppercase tracking-wider">
            {product.category.name}
          </p>
          <h3 className="font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-text-muted line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
