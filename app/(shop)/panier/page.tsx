'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { Button } from '@/components/ui/Button'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Product, Category } from '@/types'

// Mock recommended products
const mockCategory: Category = { id: '1', name: 'Salon', slug: 'salon' }
const recommendedProducts: Product[] = [
  {
    id: '10',
    name: 'Bougie parfumée artisanale',
    slug: 'bougie-parfumee-artisanale',
    description: '',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1602607753821-2a8b6c47b573?w=600'],
    category: mockCategory,
    categoryId: '1',
    stock: 30,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: '11',
    name: 'Plaid en laine mérinos',
    slug: 'plaid-laine-merinos',
    description: '',
    price: 89.00,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],
    category: mockCategory,
    categoryId: '1',
    stock: 15,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: '12',
    name: 'Cadre photo minimaliste',
    slug: 'cadre-photo-minimaliste',
    description: '',
    price: 19.99,
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600'],
    category: mockCategory,
    categoryId: '1',
    stock: 45,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: '13',
    name: 'Horloge murale en bois',
    slug: 'horloge-murale-bois',
    description: '',
    price: 49.00,
    images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600'],
    category: mockCategory,
    categoryId: '1',
    stock: 20,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  },
]

export default function CartPage() {
  const { items, itemCount, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-text-muted" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Votre panier est vide
          </h1>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Découvrez notre collection et ajoutez vos articles préférés à votre panier.
          </p>
          <Link href="/produits">
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Découvrir nos produits
            </Button>
          </Link>
        </motion.div>

        {/* Recommended Products */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-text-primary mb-8">
            Vous pourriez aimer
          </h2>
          <ProductGrid products={recommendedProducts} columns={4} />
        </section>
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
        <span className="text-text-primary">Panier</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
              Panier ({itemCount})
            </h1>
            <button
              onClick={clearCart}
              className="text-sm text-text-muted hover:text-error transition-colors"
            >
              Vider le panier
            </button>
          </div>

          <div className="divide-y divide-border-light">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CartItem item={item} />
              </motion.div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="mt-6 pt-6 border-t border-border-light">
            <Link
              href="/produits"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Continuer mes achats
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-96">
          <div className="sticky top-24">
            <CartSummary />
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <section className="mt-16 pt-16 border-t border-border-light">
        <h2 className="text-2xl font-bold text-text-primary mb-8">
          Complétez votre commande
        </h2>
        <ProductGrid products={recommendedProducts} columns={4} />
      </section>
    </div>
  )
}
