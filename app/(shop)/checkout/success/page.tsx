'use client'

import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, Mail, Loader2 } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/Button'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const clearCart = useCartStore((state) => state.clearCart)

  // Clear cart on successful payment
  useEffect(() => {
    if (sessionId) {
      clearCart()
    }
  }, [sessionId, clearCart])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="h-12 w-12 text-success" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          Merci pour votre commande !
        </h1>
        <p className="text-text-secondary mb-8">
          Votre commande a été confirmée et sera expédiée dans les plus brefs délais.
        </p>

        {/* Order Info */}
        <div className="bg-bg-secondary rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Mail className="h-5 w-5 text-text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-text-primary">Email de confirmation</p>
              <p className="text-sm text-text-muted">
                Un email de confirmation vous a été envoyé
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Package className="h-5 w-5 text-text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-text-primary">Suivi de commande</p>
              <p className="text-sm text-text-muted">
                Vous recevrez un email avec le numéro de suivi
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link href="/compte/commandes">
            <Button fullWidth size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Voir mes commandes
            </Button>
          </Link>
          <Link href="/produits">
            <Button variant="secondary" fullWidth size="lg">
              Continuer mes achats
            </Button>
          </Link>
        </div>

        {/* Help */}
        <p className="mt-8 text-sm text-text-muted">
          Une question ?{' '}
          <Link href="/contact" className="text-accent hover:underline">
            Contactez-nous
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
