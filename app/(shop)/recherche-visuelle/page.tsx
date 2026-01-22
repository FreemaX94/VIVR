'use client'

import { useState, useCallback, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Upload,
  X,
  Sparkles,
  Search,
  Palette,
  Sofa,
  TreeDeciduous,
  Home,
  Loader2,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Product, Category } from '@/types'

interface AnalysisResult {
  objects: string[]
  colors: string[]
  style: string[]
  materials: string[]
  room: string | null
  mood: string[]
  searchKeywords: string[]
  description: string
  suggestedCategories: string[]
}

// Mock products for demonstration (will be replaced with API search)
const mockCategories: Category[] = [
  { id: '1', name: 'Salon', slug: 'salon' },
  { id: '2', name: 'Chambre', slug: 'chambre' },
  { id: '3', name: 'Cuisine', slug: 'cuisine' },
  { id: '4', name: 'Bureau', slug: 'bureau' },
]

const mockProducts: Product[] = [
  {
    id: 'vs-1',
    name: 'Canapé moderne gris',
    slug: 'canape-moderne-gris',
    description: 'Canapé 3 places design scandinave',
    price: 899,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'],
    category: mockCategories[0],
    categoryId: '1',
    stock: 5,
    featured: true,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: 'vs-2',
    name: 'Lampe suspension dorée',
    slug: 'lampe-suspension-doree',
    description: 'Suspension design en laiton',
    price: 189,
    images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80'],
    category: mockCategories[0],
    categoryId: '1',
    stock: 12,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: 'vs-3',
    name: 'Table basse en bois',
    slug: 'table-basse-bois',
    description: 'Table basse chêne massif',
    price: 349,
    images: ['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&q=80'],
    category: mockCategories[0],
    categoryId: '1',
    stock: 8,
    featured: true,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: 'vs-4',
    name: 'Fauteuil velours vert',
    slug: 'fauteuil-velours-vert',
    description: 'Fauteuil club en velours',
    price: 459,
    images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80'],
    category: mockCategories[0],
    categoryId: '1',
    stock: 3,
    featured: true,
    reviews: [],
    createdAt: new Date(),
  },
]

function VisualSearchContent() {
  const searchParams = useSearchParams()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [matchingProducts, setMatchingProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasInitialized = useRef(false)

  // Handle image URL from query params (from extension)
  useEffect(() => {
    if (hasInitialized.current) return

    const imageParam = searchParams.get('image')
    if (imageParam) {
      hasInitialized.current = true
      const decodedUrl = decodeURIComponent(imageParam)
      setSelectedImage(decodedUrl)
      // Auto-analyze the image
      analyzeImageFromUrl(decodedUrl)
    }
  }, [searchParams])

  const analyzeImageFromUrl = async (url: string) => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)
    setMatchingProducts([])

    try {
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'analyse')
      }

      setAnalysis(data.analysis)

      // Search for matching products
      await searchProducts(data.analysis)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse de l\'image')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const searchProducts = async (analysisData: AnalysisResult) => {
    try {
      const response = await fetch('/api/vision/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: analysisData.searchKeywords,
          categories: analysisData.suggestedCategories,
          limit: 12
        }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setMatchingProducts(data.data)
      } else {
        // Fallback to mock products if no results
        setMatchingProducts(mockProducts)
      }
    } catch (err) {
      console.error('Product search error:', err)
      // Fallback to mock products on error
      setMatchingProducts(mockProducts)
    }
  }

  const handleImageSelect = useCallback(async (file: File) => {
    setError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 10 Mo')
      return
    }

    // Read file as base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setSelectedImage(base64)
      await analyzeImage(base64)
    }
    reader.readAsDataURL(file)
  }, [])

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)
    setMatchingProducts([])

    try {
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'analyse')
      }

      setAnalysis(data.analysis)

      // Search for matching products based on analysis
      await searchProducts(data.analysis)

    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse de l\'image')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageSelect(file)
    }
  }, [handleImageSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }, [handleImageSelect])

  const resetSearch = () => {
    setSelectedImage(null)
    setAnalysis(null)
    setMatchingProducts([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Recherche par IA</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-text-primary mb-4">
                Trouvez des produits avec une photo
              </h1>
              <p className="text-lg text-text-secondary">
                Uploadez une photo d'intérieur et notre IA trouvera les produits VIVR
                qui correspondent à votre style
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {!selectedImage ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {/* Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-3xl p-12 lg:p-16 text-center cursor-pointer
                    transition-all duration-300
                    ${isDragging
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-border-light hover:border-purple-300 hover:bg-purple-50/50'
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center">
                    <div className={`
                      w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors
                      ${isDragging ? 'bg-purple-200' : 'bg-purple-100'}
                    `}>
                      <Camera className={`h-10 w-10 ${isDragging ? 'text-purple-700' : 'text-purple-600'}`} />
                    </div>

                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      {isDragging ? 'Déposez l\'image ici' : 'Glissez-déposez une image'}
                    </h3>
                    <p className="text-text-secondary mb-6">
                      ou cliquez pour sélectionner un fichier
                    </p>

                    <Button variant="secondary" leftIcon={<Upload className="h-4 w-4" />}>
                      Parcourir
                    </Button>

                    <p className="text-xs text-text-muted mt-4">
                      PNG, JPG ou WEBP jusqu'à 10 Mo
                    </p>
                  </div>
                </div>

                {/* Example Images */}
                <div className="mt-12">
                  <p className="text-sm text-text-secondary text-center mb-4">
                    Essayez avec une de ces images d'exemple :
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
                      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80',
                      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80',
                    ].map((url, index) => (
                      <button
                        key={index}
                        onClick={async () => {
                          setSelectedImage(url)
                          setIsAnalyzing(true)
                          try {
                            const response = await fetch('/api/vision/analyze', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ imageUrl: url }),
                            })
                            const data = await response.json()
                            if (data.success) {
                              setAnalysis(data.analysis)
                              setMatchingProducts(mockProducts)
                            } else {
                              setError(data.error)
                            }
                          } catch (err) {
                            setError('Erreur lors de l\'analyse')
                          } finally {
                            setIsAnalyzing(false)
                          }
                        }}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden group"
                      >
                        <Image
                          src={url}
                          alt={`Exemple ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Search className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Image Preview & Analysis */}
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                  {/* Uploaded Image */}
                  <div className="relative">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-bg-secondary">
                      <Image
                        src={selectedImage}
                        alt="Image analysée"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3" />
                            <p className="font-medium">Analyse en cours...</p>
                            <p className="text-sm text-white/70">Notre IA examine votre image</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={resetSearch}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Analysis Results */}
                  <div>
                    {error ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-700 font-medium mb-2">Erreur d'analyse</p>
                        <p className="text-red-600 text-sm mb-4">{error}</p>
                        <Button variant="secondary" onClick={resetSearch}>
                          Réessayer
                        </Button>
                      </div>
                    ) : analysis ? (
                      <div className="space-y-6">
                        {/* Description */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5">
                          <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            Analyse IA
                          </h3>
                          <p className="text-text-secondary">{analysis.description}</p>
                        </div>

                        {/* Tags Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Objects */}
                          {analysis.objects.length > 0 && (
                            <div className="bg-bg-secondary rounded-xl p-4">
                              <h4 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                                <Sofa className="h-4 w-4" />
                                Objets détectés
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {analysis.objects.slice(0, 5).map((obj, i) => (
                                  <span key={i} className="text-xs bg-white px-2 py-1 rounded-full">
                                    {obj}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Colors */}
                          {analysis.colors.length > 0 && (
                            <div className="bg-bg-secondary rounded-xl p-4">
                              <h4 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Couleurs
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {analysis.colors.slice(0, 5).map((color, i) => (
                                  <span key={i} className="text-xs bg-white px-2 py-1 rounded-full">
                                    {color}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Style */}
                          {analysis.style.length > 0 && (
                            <div className="bg-bg-secondary rounded-xl p-4">
                              <h4 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                Style
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {analysis.style.slice(0, 3).map((style, i) => (
                                  <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                    {style}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Materials */}
                          {analysis.materials.length > 0 && (
                            <div className="bg-bg-secondary rounded-xl p-4">
                              <h4 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                                <TreeDeciduous className="h-4 w-4" />
                                Matériaux
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {analysis.materials.slice(0, 4).map((mat, i) => (
                                  <span key={i} className="text-xs bg-white px-2 py-1 rounded-full">
                                    {mat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Suggested Categories */}
                        {analysis.suggestedCategories.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-text-muted mb-2">
                              Catégories suggérées
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {analysis.suggestedCategories.map((cat) => (
                                <Link
                                  key={cat}
                                  href={`/categories/${cat}`}
                                  className="inline-flex items-center gap-1 text-sm bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
                                >
                                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                                  <ArrowRight className="h-3 w-3" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-bg-secondary rounded-xl p-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-purple-600" />
                        <p className="text-text-secondary">Analyse de l'image...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Matching Products */}
                {matchingProducts.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-text-primary">
                          Produits similaires
                        </h2>
                        <p className="text-text-secondary">
                          {matchingProducts.length} produits correspondent à votre recherche
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={resetSearch}
                        leftIcon={<ImageIcon className="h-4 w-4" />}
                      >
                        Nouvelle recherche
                      </Button>
                    </div>
                    <ProductGrid products={matchingProducts} columns={4} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-bg-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-10">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: '1. Uploadez une image',
                description: 'Glissez-déposez ou sélectionnez une photo d\'intérieur qui vous inspire'
              },
              {
                icon: Sparkles,
                title: '2. Analyse IA',
                description: 'Notre intelligence artificielle analyse les objets, couleurs et styles'
              },
              {
                icon: Search,
                title: '3. Découvrez',
                description: 'Trouvez les produits VIVR qui correspondent à votre inspiration'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// Loading component for Suspense
function VisualSearchLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-purple-600" />
        <p className="text-text-secondary">Chargement...</p>
      </div>
    </div>
  )
}

export default function VisualSearchPage() {
  return (
    <Suspense fallback={<VisualSearchLoading />}>
      <VisualSearchContent />
    </Suspense>
  )
}
