'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Camera
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { cn } from '@/lib/utils'

// Dynamic import for SearchBar - reduces initial bundle
const SearchBar = dynamic(() => import('./SearchBar').then(mod => ({ default: mod.SearchBar })), {
  ssr: false,
  loading: () => null
})

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
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([])

  const cartItemCount = useCartStore((state) => state.itemCount)
  const wishlistCount = useWishlistStore((state) => state.items.length)

  const handleCategoryKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        setIsCategoriesOpen(prev => !prev)
        if (!isCategoriesOpen) {
          setFocusedIndex(0)
          setTimeout(() => menuItemsRef.current[0]?.focus(), 0)
        }
        break
      case 'Escape':
        setIsCategoriesOpen(false)
        setFocusedIndex(-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isCategoriesOpen) {
          setIsCategoriesOpen(true)
          setFocusedIndex(0)
          setTimeout(() => menuItemsRef.current[0]?.focus(), 0)
        } else {
          const nextIndex = focusedIndex < categories.length - 1 ? focusedIndex + 1 : 0
          setFocusedIndex(nextIndex)
          menuItemsRef.current[nextIndex]?.focus()
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (isCategoriesOpen) {
          const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : categories.length - 1
          setFocusedIndex(prevIndex)
          menuItemsRef.current[prevIndex]?.focus()
        }
        break
    }
  }, [isCategoriesOpen, focusedIndex])

  const handleMenuItemKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setIsCategoriesOpen(false)
        setFocusedIndex(-1)
        dropdownRef.current?.querySelector('button')?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        const nextIndex = index < categories.length - 1 ? index + 1 : 0
        setFocusedIndex(nextIndex)
        menuItemsRef.current[nextIndex]?.focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        const prevIndex = index > 0 ? index - 1 : categories.length - 1
        setFocusedIndex(prevIndex)
        menuItemsRef.current[prevIndex]?.focus()
        break
      case 'Tab':
        setIsCategoriesOpen(false)
        setFocusedIndex(-1)
        break
    }
  }, [])

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
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
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
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => {
                setIsCategoriesOpen(false)
                setFocusedIndex(-1)
              }}
            >
              <button
                className="flex items-center gap-1 text-sm font-medium text-text-primary hover:text-accent transition-colors"
                aria-expanded={isCategoriesOpen}
                aria-haspopup="menu"
                aria-controls="categories-menu"
                onKeyDown={handleCategoryKeyDown}
                onFocus={() => {}}
                onBlur={(e) => {
                  if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
                    setIsCategoriesOpen(false)
                    setFocusedIndex(-1)
                  }
                }}
              >
                Catégories
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isCategoriesOpen && "rotate-180"
                )} aria-hidden="true" />
              </button>

              <div
                id="categories-menu"
                role="menu"
                aria-label="Catégories de produits"
                className={cn(
                  "absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border-light overflow-hidden transition-all duration-150",
                  isCategoriesOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none"
                )}
              >
                {categories.map((category, index) => (
                  <Link
                    key={category.slug}
                    ref={(el) => { menuItemsRef.current[index] = el }}
                    href={`/categories/${category.slug}`}
                    role="menuitem"
                    tabIndex={isCategoriesOpen ? 0 : -1}
                    className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-secondary focus:bg-bg-secondary focus:outline-none transition-colors"
                    onKeyDown={(e) => handleMenuItemKeyDown(e, index)}
                    onClick={() => {
                      setIsCategoriesOpen(false)
                      setFocusedIndex(-1)
                    }}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
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

            {/* Visual Search */}
            <Link
              href="/recherche-visuelle"
              className="p-2 text-text-primary hover:text-purple-600 transition-colors"
              aria-label="Recherche visuelle"
              title="Recherche par image"
            >
              <Camera className="h-5 w-5" />
            </Link>

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
      <div
        id="mobile-menu"
        className={cn(
          "lg:hidden border-t border-border-light bg-white overflow-hidden transition-all duration-200",
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!isMenuOpen}
      >
        <nav className="px-4 py-4 space-y-2" aria-label="Menu mobile">
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
      </div>

      {/* Search Modal */}
      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}
