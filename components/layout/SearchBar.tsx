'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
}

const popularSearches = [
  'Lampe design',
  'Canapé modulable',
  'Table basse',
  'Miroir rond',
  'Vase céramique',
]

export function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const saved = localStorage.getItem('vivr_recent_searches')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Validate that it's an array of strings
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
          setRecentSearches(parsed)
        }
      }
    } catch {
      // If localStorage data is corrupted, clear it
      localStorage.removeItem('vivr_recent_searches')
    }
  }, [])

  useEffect(() => {
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('vivr_recent_searches', JSON.stringify(updated))

    // Navigate to search results
    router.push(`/produits?search=${encodeURIComponent(searchQuery)}`)
    onClose()
    setQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('vivr_recent_searches')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 bg-white z-50 shadow-lg"
          >
            <div className="max-w-3xl mx-auto px-4 py-6">
              {/* Search Input */}
              <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className={cn(
                    'w-full bg-bg-secondary rounded-xl pl-12 pr-12 py-4 text-lg',
                    'placeholder:text-text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-black/10'
                  )}
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </form>

              {/* Suggestions */}
              <div className="mt-6 space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Recherches récentes
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-text-muted hover:text-text-primary"
                      >
                        Effacer
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="px-4 py-2 bg-bg-secondary rounded-full text-sm text-text-primary hover:bg-border-light transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Tendances
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="px-4 py-2 bg-bg-secondary rounded-full text-sm text-text-primary hover:bg-border-light transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
