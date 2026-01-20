'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { CartItem } from './CartItem'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, total, itemCount } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Panier ({itemCount})
              </h2>
              <button
                onClick={onClose}
                className="p-2 -m-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 px-6">
                  <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 text-text-muted" />
                  </div>
                  <p className="text-text-secondary mb-6">Votre panier est vide</p>
                  <Button onClick={onClose}>
                    Découvrir nos produits
                  </Button>
                </div>
              ) : (
                <div className="px-6 divide-y divide-border-light">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} compact />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border-light p-6 bg-bg-secondary">
                <div className="flex justify-between mb-4">
                  <span className="text-text-secondary">Sous-total</span>
                  <span className="font-semibold text-text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-xs text-text-muted mb-4">
                  Frais de livraison calculés à l'étape suivante
                </p>
                <div className="space-y-3">
                  <Link href="/checkout" onClick={onClose}>
                    <Button fullWidth>
                      Passer la commande
                    </Button>
                  </Link>
                  <Link href="/panier" onClick={onClose}>
                    <Button variant="secondary" fullWidth>
                      Voir le panier
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  )
}
