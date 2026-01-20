'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
  Check,
  Lock,
  ShoppingBag,
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatPrice, cn } from '@/lib/utils'
import Image from 'next/image'

const steps = [
  { id: 'address', label: 'Adresse', icon: MapPin },
  { id: 'shipping', label: 'Livraison', icon: Truck },
  { id: 'payment', label: 'Paiement', icon: CreditCard },
]

const shippingOptions = [
  {
    id: 'standard',
    name: 'Livraison standard',
    description: '3-5 jours ouvrés',
    price: 4.99,
  },
  {
    id: 'express',
    name: 'Livraison express',
    description: '1-2 jours ouvrés',
    price: 9.99,
  },
  {
    id: 'free',
    name: 'Livraison gratuite',
    description: '5-7 jours ouvrés',
    price: 0,
    minOrder: 50,
  },
]

const countries = [
  { value: 'FR', label: 'France' },
  { value: 'BE', label: 'Belgique' },
  { value: 'CH', label: 'Suisse' },
  { value: 'LU', label: 'Luxembourg' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, total, clearCart } = useCartStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState('standard')

  // Address form state
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: 'FR',
  })

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/connexion?callbackUrl=/checkout')
    }
  }, [status, router])

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && status !== 'loading') {
      router.push('/panier')
    }
  }, [items, status, router])

  const shippingCost = shippingOptions.find((s) => s.id === selectedShipping)?.price || 0
  const finalTotal = total + shippingCost

  const handleAddressChange = (field: string, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.product.name,
            description: item.product.category.name,
            image: item.product.images[0],
            price: item.product.price,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (data.success && data.data.url) {
        window.location.href = data.data.url
      } else {
        alert(data.error || 'Une erreur est survenue')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Erreur lors du paiement')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
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
        <Link href="/panier" className="hover:text-text-primary transition-colors">
          Panier
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-text-primary">Checkout</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Main Content */}
        <div className="flex-1">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                      index <= currentStep
                        ? 'bg-black text-white'
                        : 'bg-bg-secondary text-text-muted'
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'ml-3 text-sm font-medium hidden sm:inline',
                      index <= currentStep ? 'text-text-primary' : 'text-text-muted'
                    )}
                  >
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'w-12 sm:w-24 h-0.5 mx-4',
                        index < currentStep ? 'bg-black' : 'bg-border-light'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-border-light p-6"
          >
            {/* Address Step */}
            {currentStep === 0 && (
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Adresse de livraison
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    value={address.firstName}
                    onChange={(e) => handleAddressChange('firstName', e.target.value)}
                    required
                  />
                  <Input
                    label="Nom"
                    value={address.lastName}
                    onChange={(e) => handleAddressChange('lastName', e.target.value)}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={address.email}
                    onChange={(e) => handleAddressChange('email', e.target.value)}
                    required
                  />
                  <Input
                    label="Téléphone"
                    type="tel"
                    value={address.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Adresse"
                      value={address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label="Appartement, étage, etc. (optionnel)"
                      value={address.apartment}
                      onChange={(e) => handleAddressChange('apartment', e.target.value)}
                    />
                  </div>
                  <Input
                    label="Ville"
                    value={address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    required
                  />
                  <Input
                    label="Code postal"
                    value={address.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    required
                  />
                  <Select
                    label="Pays"
                    options={countries}
                    value={address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Shipping Step */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Mode de livraison
                </h2>
                <div className="space-y-4">
                  {shippingOptions.map((option) => {
                    const isDisabled = !!(option.minOrder && total < option.minOrder)

                    return (
                      <label
                        key={option.id}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer',
                          selectedShipping === option.id
                            ? 'border-black bg-bg-secondary'
                            : 'border-border-light hover:border-border-medium',
                          isDisabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="shipping"
                            value={option.id}
                            checked={selectedShipping === option.id}
                            onChange={() => !isDisabled && setSelectedShipping(option.id)}
                            disabled={isDisabled}
                            className="w-4 h-4 text-accent border-border-medium focus:ring-accent"
                          />
                          <div>
                            <p className="font-medium text-text-primary">{option.name}</p>
                            <p className="text-sm text-text-muted">{option.description}</p>
                            {isDisabled && (
                              <p className="text-xs text-warning mt-1">
                                Minimum de commande : {formatPrice(option.minOrder!)}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold text-text-primary">
                          {option.price === 0 ? 'Gratuit' : formatPrice(option.price)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Paiement
                </h2>
                <div className="bg-bg-secondary rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="h-5 w-5 text-success" />
                    <span className="font-medium text-text-primary">
                      Paiement sécurisé par Stripe
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Vous serez redirigé vers la page de paiement sécurisée Stripe pour finaliser votre commande.
                    Nous acceptons les cartes Visa, Mastercard, American Express, ainsi que Apple Pay et Google Pay.
                  </p>
                </div>

                {/* Payment Methods Icons */}
                <div className="flex items-center gap-4 justify-center py-4">
                  <div className="bg-white rounded-lg p-2 border border-border-light">
                    <span className="text-xs font-semibold text-blue-600">VISA</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-border-light">
                    <span className="text-xs font-semibold text-red-500">MC</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-border-light">
                    <span className="text-xs font-semibold text-blue-500">AMEX</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-border-light">
                    <span className="text-xs font-semibold">Apple Pay</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-light">
              {currentStep > 0 ? (
                <Button variant="secondary" onClick={handlePrevStep}>
                  Retour
                </Button>
              ) : (
                <Link href="/panier">
                  <Button variant="secondary">Retour au panier</Button>
                </Link>
              )}

              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNextStep}>Continuer</Button>
              ) : (
                <Button onClick={handleCheckout} isLoading={isLoading}>
                  Payer {formatPrice(finalTotal)}
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-96">
          <div className="bg-bg-secondary rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-text-primary mb-6">
              Récapitulatif
            </h2>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                    <Image
                      src={item.product.images[0] || '/images/placeholder.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {item.product.category.name}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-4 border-t border-border-light">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Sous-total</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Livraison</span>
                <span className="font-medium">
                  {shippingCost === 0 ? 'Gratuit' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border-light">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">{formatPrice(finalTotal)}</span>
              </div>
              <p className="text-xs text-text-muted">TVA incluse</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
