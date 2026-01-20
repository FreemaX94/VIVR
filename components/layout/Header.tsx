'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { SearchBar } from './SearchBar'
import { cn } from '@/lib/utils'

const categories = [
  { name: 'Salon', slug: 'salon' },
  { name: 'Chambre', slug: 'chambre' },
  { name: 'Cuisine', slug: 'cuisine' },
  { name: 'Salle de bain', slug: 'salle-de-bain' },
  { name: 'Bureau', slug: 'bureau' },
  { name: 'Extérieur', slug: 'exterieur' },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)

  const cartItemCount = useCartStore((state) => state.itemCount)
  const wishlistCount = useWishlistStore((state) => state.items.length)

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-border-light">
      {/* Top Bar - Promo */}
      <div className="bg-black text-white text-center py-2 text-xs">
        Livraison gratuite dès 50€ d'achat | Retours gratuits sous 30 jours
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-text-primary hover:text-accent"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">VIVR</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/produits"
              className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
            >
              Tous les produits
            </Link>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-text-primary hover:text-accent transition-colors">
                Catégories
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isCategoriesOpen && "rotate-180"
                )} />
              </button>

              <AnimatePresence>
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border-light overflow-hidden"
                  >
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/categories/${category.slug}`}
                        className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-secondary transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/nouveautes"
              className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
            >
              Nouveautés
            </Link>
            <Link
              href="/promotions"
              className="text-sm font-medium text-error hover:text-red-600 transition-colors"
            >
              Promotions
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-text-primary hover:text-accent transition-colors"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-text-primary hover:text-accent transition-colors"
              aria-label="Liste de souhaits"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href="/compte"
              className="p-2 text-text-primary hover:text-accent transition-colors"
              aria-label="Mon compte"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/panier"
              className="relative p-2 text-text-primary hover:text-accent transition-colors"
              aria-label="Panier"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border-light bg-white"
          >
            <nav className="px-4 py-4 space-y-2">
              <Link
                href="/produits"
                className="block py-3 text-base font-medium text-text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Tous les produits
              </Link>
              <div className="py-2">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Catégories
                </span>
                <div className="mt-2 space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className="block py-2 pl-4 text-sm text-text-secondary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="/nouveautes"
                className="block py-3 text-base font-medium text-text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Nouveautés
              </Link>
              <Link
                href="/promotions"
                className="block py-3 text-base font-medium text-error"
                onClick={() => setIsMenuOpen(false)}
              >
                Promotions
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}
