'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Instagram, Facebook, Twitter, Youtube, Send } from 'lucide-react'
import { toast } from '@/stores/toastStore'

const footerLinks = {
  shop: [
    { name: 'Tous les produits', href: '/produits' },
    { name: 'Nouveautés', href: '/nouveautes' },
    { name: 'Promotions', href: '/promotions' },
    { name: 'Collections', href: '/collections' },
  ],
  categories: [
    { name: 'Salon', href: '/categories/salon' },
    { name: 'Chambre', href: '/categories/chambre' },
    { name: 'Cuisine', href: '/categories/cuisine' },
    { name: 'Bureau', href: '/categories/bureau' },
  ],
  help: [
    { name: 'FAQ', href: '/aide/faq' },
    { name: 'Livraison', href: '/aide/livraison' },
    { name: 'Retours', href: '/aide/retours' },
    { name: 'Contact', href: '/contact' },
  ],
  company: [
    { name: 'À propos', href: '/a-propos' },
    { name: 'Carrières', href: '/carrieres' },
    { name: 'Presse', href: '/presse' },
    { name: 'Blog', href: '/blog' },
  ],
}

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setEmail('')
        toast.success(data.message)
      } else {
        setMessage({ type: 'error', text: data.error })
        toast.error(data.error)
      }
    } catch {
      setMessage({ type: 'error', text: 'Une erreur est survenue' })
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className="bg-bg-secondary border-t border-border-light">
      {/* Newsletter Section */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold">
                Rejoignez la communauté VIVR
              </h3>
              <p className="mt-2 text-white/70">
                -10% sur votre première commande + accès aux ventes privées
              </p>
            </div>

            {message?.type === 'success' ? (
              <p className="text-green-400 font-medium">
                {message.text}
              </p>
            ) : (
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <form onSubmit={handleSubscribe} className="flex gap-3">
                  <div className="flex-1 md:w-80">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre email"
                      required
                      disabled={isLoading}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 disabled:opacity-50"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isLoading}
                    className="bg-white text-black hover:bg-white/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {isLoading ? '...' : "S'inscrire"}
                  </Button>
                </form>
                {message?.type === 'error' && (
                  <p className="text-red-400 text-sm">{message.text}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tight">VIVR</span>
            </Link>
            <p className="mt-4 text-sm text-text-secondary">
              Décoration intérieure élégante et accessible. Transformez votre espace de vie.
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full text-text-secondary hover:text-accent hover:shadow-md transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Boutique</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Catégories</h4>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Aide</h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">VIVR</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-muted">
              © {new Date().getFullYear()} VIVR. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/mentions-legales"
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Mentions légales
              </Link>
              <Link
                href="/confidentialite"
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Confidentialité
              </Link>
              <Link
                href="/cgv"
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                CGV
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <img src="/images/payment/visa.svg" alt="Visa" className="h-6" />
              <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-6" />
              <img src="/images/payment/amex.svg" alt="American Express" className="h-6" />
              <img src="/images/payment/paypal.svg" alt="PayPal" className="h-6" />
              <img src="/images/payment/apple-pay.svg" alt="Apple Pay" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
