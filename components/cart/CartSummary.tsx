'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Truck, Tag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatPrice, cn } from '@/lib/utils'

interface CartSummaryProps {
  showCheckoutButton?: boolean
  className?: string
}

export function CartSummary({ showCheckoutButton = true, className }: CartSummaryProps) {
  const { items, total } = useCartStore()
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')

  const FREE_SHIPPING_THRESHOLD = 50
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : 4.99
  const discount = promoApplied ? total * 0.1 : 0 // 10% discount for demo
  const finalTotal = total - discount + shipping

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'bienvenue10') {
      setPromoApplied(true)
      setPromoError('')
    } else {
      setPromoError('Code promo invalide')
      setPromoApplied(false)
    }
  }

  return (
    <div className={cn('bg-bg-secondary rounded-2xl p-6', className)}>
      <h2 className="text-lg font-semibold text-text-primary mb-6">
        Résumé de la commande
      </h2>

      <div className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">
            Sous-total ({items.length} article{items.length > 1 ? 's' : ''})
          </span>
          <span className="font-medium text-text-primary">
            {formatPrice(total)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Livraison</span>
          <span className="font-medium text-text-primary">
            {shipping === 0 ? (
              <span className="text-success">Gratuite</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>

        {/* Free Shipping Progress */}
        {shipping > 0 && (
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
              <Truck className="h-4 w-4" />
              <span>
                Plus que {formatPrice(FREE_SHIPPING_THRESHOLD - total)} pour la livraison gratuite
              </span>
            </div>
            <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Promo Code */}
        <div className="pt-4 border-t border-border-light">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Code promo"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value)
                  setPromoError('')
                }}
                leftIcon={<Tag className="h-4 w-4" />}
                error={promoError}
              />
            </div>
            <Button
              variant="secondary"
              onClick={handleApplyPromo}
              disabled={!promoCode || promoApplied}
            >
              Appliquer
            </Button>
          </div>
          {promoApplied && (
            <p className="text-sm text-success mt-2">
              Code BIENVENUE10 appliqué (-10%)
            </p>
          )}
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-success">Réduction</span>
            <span className="font-medium text-success">
              -{formatPrice(discount)}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="pt-4 border-t border-border-light">
          <div className="flex justify-between">
            <span className="font-semibold text-text-primary">Total</span>
            <span className="text-xl font-bold text-text-primary">
              {formatPrice(finalTotal)}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            TVA incluse
          </p>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <div className="mt-6 space-y-3">
          <Link href="/checkout" className="block">
            <Button fullWidth size="lg">
              Passer la commande
            </Button>
          </Link>
          <Link
            href="/produits"
            className="block text-center text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Continuer mes achats
          </Link>
        </div>
      )}

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-border-light">
        <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
          <span>Paiement sécurisé</span>
          <span>•</span>
          <span>Retours gratuits</span>
          <span>•</span>
          <span>Livraison rapide</span>
        </div>
      </div>
    </div>
  )
}
