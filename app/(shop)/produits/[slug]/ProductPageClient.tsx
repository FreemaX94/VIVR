'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  RefreshCw,
  Shield,
  Share2,
  ChevronRight,
} from 'lucide-react'
import { Product } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { toast } from '@/stores/toastStore'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductReviews } from '@/components/product/ProductReviews'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'

interface ProductPageClientProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductPageClient({ product, relatedProducts }: ProductPageClientProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')

  const addItem = useCartStore((state) => state.addItem)
  const isInCart = useCartStore((state) => state.isInCart(product.id))
  const toggleWishlist = useWishlistStore((state) => state.toggleItem)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id))

  const discount = product.comparePrice
    ? calculateDiscount(product.price, product.comparePrice)
    : 0

  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 0

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`${product.name} ajouté au panier`)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.info('Lien copié dans le presse-papier')
    }
  }

  return (
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
        <Link
          href={`/categories/${product.category.slug}`}
          className="hover:text-text-primary transition-colors"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="text-text-primary" aria-current="page">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-text-muted uppercase tracking-wider mb-2">
              {product.category.name}
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">
              {product.name}
            </h1>
          </div>

          {/* Reviews Summary */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex" aria-label={`Note: ${averageRating.toFixed(1)} sur 5`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={cn(
                      'h-5 w-5',
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    )}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-text-secondary">
                {averageRating.toFixed(1)} ({product.reviews.length} avis)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-text-primary">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <>
                <span className="text-xl text-text-muted line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <Badge variant="error">-{discount}%</Badge>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {product.stock > 0 ? (
              <span className="text-success text-sm font-medium">
                En stock ({product.stock} disponibles)
              </span>
            ) : (
              <span className="text-error text-sm font-medium">
                Rupture de stock
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <label htmlFor="quantity" className="text-sm font-medium text-text-primary">Quantité</label>
            <div className="flex items-center border border-border-light rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-text-muted hover:text-text-primary transition-colors"
                disabled={quantity <= 1}
                aria-label="Diminuer la quantité"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <input
                id="quantity"
                type="text"
                value={quantity}
                readOnly
                className="w-12 text-center font-medium bg-transparent"
                aria-live="polite"
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-3 text-text-muted hover:text-text-primary transition-colors"
                disabled={quantity >= product.stock}
                aria-label="Augmenter la quantité"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              leftIcon={<ShoppingBag className="h-5 w-5" />}
            >
              {isInCart ? 'Déjà dans le panier' : 'Ajouter au panier'}
            </Button>
            <Button
              variant={isInWishlist ? 'primary' : 'secondary'}
              size="lg"
              onClick={() => {
                toggleWishlist(product)
                toast.success(isInWishlist ? 'Retiré des favoris' : 'Ajouté aux favoris')
              }}
              aria-label={isInWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart className={cn('h-5 w-5', isInWishlist && 'fill-current')} aria-hidden="true" />
            </Button>
            <Button variant="secondary" size="lg" onClick={handleShare} aria-label="Partager ce produit">
              <Share2 className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border-light">
            <div className="text-center">
              <Truck className="h-6 w-6 mx-auto text-text-secondary mb-2" aria-hidden="true" />
              <p className="text-xs text-text-secondary">Livraison gratuite</p>
            </div>
            <div className="text-center">
              <RefreshCw className="h-6 w-6 mx-auto text-text-secondary mb-2" aria-hidden="true" />
              <p className="text-xs text-text-secondary">Retours 30 jours</p>
            </div>
            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto text-text-secondary mb-2" aria-hidden="true" />
              <p className="text-xs text-text-secondary">Garantie 2 ans</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex gap-8 border-b border-border-light" role="tablist">
          <button
            onClick={() => setActiveTab('description')}
            className={cn(
              'pb-4 text-sm font-medium transition-colors relative',
              activeTab === 'description'
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            )}
            role="tab"
            aria-selected={activeTab === 'description'}
            aria-controls="tab-description"
          >
            Description
            {activeTab === 'description' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={cn(
              'pb-4 text-sm font-medium transition-colors relative',
              activeTab === 'reviews'
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            )}
            role="tab"
            aria-selected={activeTab === 'reviews'}
            aria-controls="tab-reviews"
          >
            Avis ({product.reviews?.length || 0})
            {activeTab === 'reviews' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        </div>

        <div className="py-8">
          {activeTab === 'description' ? (
            <div id="tab-description" role="tabpanel" className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line text-text-secondary leading-relaxed">
                {product.description}
              </p>
            </div>
          ) : (
            <div id="tab-reviews" role="tabpanel">
              <ProductReviews
                reviews={product.reviews || []}
                productId={product.id}
                averageRating={averageRating}
              />
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16" aria-labelledby="related-products-title">
          <h2 id="related-products-title" className="text-2xl font-bold text-text-primary mb-8">
            Produits similaires
          </h2>
          <ProductGrid products={relatedProducts} columns={4} />
        </section>
      )}
    </div>
  )
}
