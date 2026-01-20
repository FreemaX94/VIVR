'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, ChevronRight, ShoppingBag, Trash2 } from 'lucide-react'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useCartStore } from '@/stores/cartStore'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/utils'
import Image from 'next/image'

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const addToCart = useCartStore((state) => state.addItem)

  const handleAddToCart = (productId: string) => {
    const item = items.find((i) => i.product.id === productId)
    if (item) {
      addToCart(item.product)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-text-muted" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Votre liste de souhaits est vide
          </h1>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Ajoutez des articles à votre liste de souhaits en cliquant sur le coeur de vos produits préférés.
          </p>
          <Link href="/produits">
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Découvrir nos produits
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-text-primary transition-colors">
          Accueil
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-text-primary">Ma liste de souhaits</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
            Ma liste de souhaits
          </h1>
          <p className="mt-1 text-text-secondary">
            {items.length} article{items.length > 1 ? 's' : ''} sauvegardé{items.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={clearWishlist}
          className="text-sm text-text-muted hover:text-error transition-colors"
        >
          Tout supprimer
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="group bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-card transition-all"
          >
            {/* Image */}
            <Link
              href={`/produits/${item.product.slug}`}
              className="relative block aspect-square bg-bg-secondary"
            >
              <Image
                src={item.product.images[0] || '/images/placeholder.jpg'}
                alt={item.product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </Link>

            {/* Info */}
            <div className="p-4">
              <Link
                href={`/produits/${item.product.slug}`}
                className="font-medium text-text-primary hover:text-accent transition-colors line-clamp-1"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-text-muted mt-1">
                {item.product.category.name}
              </p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <span className="font-semibold text-text-primary">
                    {formatPrice(item.product.price)}
                  </span>
                  {item.product.comparePrice && (
                    <span className="ml-2 text-sm text-text-muted line-through">
                      {formatPrice(item.product.comparePrice)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-text-muted">
                  Ajouté le {formatDate(item.addedAt)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-border-light">
                <Button
                  size="sm"
                  fullWidth
                  onClick={() => handleAddToCart(item.product.id)}
                  disabled={item.product.stock === 0}
                  leftIcon={<ShoppingBag className="h-4 w-4" />}
                >
                  {item.product.stock === 0 ? 'Rupture' : 'Ajouter au panier'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => removeItem(item.product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
