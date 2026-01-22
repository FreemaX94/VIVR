'use client'

import { useEffect, useRef, useCallback, useId } from 'react'
import Link from 'next/link'
import { X, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { CartItem } from './CartItem'
import { Button } from '@/components/ui/Button'
import { formatPrice, cn } from '@/lib/utils'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, total, itemCount } = useCartStore()
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const titleId = useId()

  // Focus trap
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!drawerRef.current || e.key !== 'Tab') return

    const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement?.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement?.focus()
    }
  }, [])

  // Handle escape key and focus management
  useEffect(() => {
    if (!isOpen) return

    // Store currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus the close button
    const closeButton = drawerRef.current?.querySelector<HTMLButtonElement>('button')
    closeButton?.focus()

    // Escape key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', trapFocus)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', trapFocus)

      // Restore focus
      previousActiveElement.current?.focus()
    }
  }, [isOpen, onClose, trapFocus])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col',
          'animate-slide-in-from-right'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h2
            id={titleId}
            className="text-lg font-semibold text-text-primary flex items-center gap-2"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            Panier ({itemCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Fermer le panier"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6">
              <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-text-muted" aria-hidden="true" />
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
      </div>
    </>
  )
}
