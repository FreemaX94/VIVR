'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { CartItem as CartItemType } from '@/stores/cartStore'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice, cn } from '@/lib/utils'

interface CartItemProps {
  item: CartItemType
  compact?: boolean
}

export function CartItem({ item, compact = false }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= item.product.stock) {
      updateQuantity(item.product.id, newQuantity)
    }
  }

  return (
    <div className={cn('flex gap-4', compact ? 'py-3' : 'py-6')}>
      {/* Image */}
      <Link
        href={`/produits/${item.product.slug}`}
        className={cn(
          'relative flex-shrink-0 rounded-lg overflow-hidden bg-bg-secondary',
          compact ? 'w-16 h-16' : 'w-24 h-24 sm:w-32 sm:h-32'
        )}
      >
        <Image
          src={item.product.images[0] || '/images/placeholder.jpg'}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes={compact ? '64px' : '128px'}
        />
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <Link
            href={`/produits/${item.product.slug}`}
            className={cn(
              'font-medium text-text-primary hover:text-accent transition-colors line-clamp-1',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {item.product.name}
          </Link>
          {!compact && (
            <p className="text-sm text-text-muted mt-1">
              {item.product.category.name}
            </p>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center border border-border-light rounded-lg">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                'text-text-muted hover:text-text-primary transition-colors disabled:opacity-50',
                compact ? 'p-1.5' : 'p-2'
              )}
            >
              <Minus className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
            </button>
            <span className={cn(
              'text-center font-medium',
              compact ? 'w-6 text-xs' : 'w-10 text-sm'
            )}>
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.product.stock}
              className={cn(
                'text-text-muted hover:text-text-primary transition-colors disabled:opacity-50',
                compact ? 'p-1.5' : 'p-2'
              )}
            >
              <Plus className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
            </button>
          </div>

          {!compact && (
            <button
              onClick={() => removeItem(item.product.id)}
              className="text-text-muted hover:text-error transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end justify-between">
        <span className={cn(
          'font-semibold text-text-primary',
          compact ? 'text-sm' : 'text-base'
        )}>
          {formatPrice(item.product.price * item.quantity)}
        </span>
        {item.quantity > 1 && (
          <span className="text-xs text-text-muted">
            {formatPrice(item.product.price)} / unité
          </span>
        )}
        {compact && (
          <button
            onClick={() => removeItem(item.product.id)}
            className="text-text-muted hover:text-error transition-colors mt-1"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
