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
  ExternalLink,
  ShoppingBag,
  Star,
  RefreshCw,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

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

interface WebProduct {
  name: string
  description: string
  price: string
  store: string
  url: string
  imageUrl: string
  similarity: number
}

function VisualSearchContent() {
  const searchParams = useSearchParams()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSearchingWeb, setIsSearchingWeb] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [webProducts, setWebProducts] = useState<WebProduct[]>([])
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
      analyzeImageFromUrl(decodedUrl)
    }
  }, [searchParams])

  const searchWebProducts = async (analysisData: AnalysisResult) => {
    setIsSearchingWeb(true)
    try {
      const response = await fetch('/api/vision/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: analysisData }),
      })

      const data = await response.json()

      if (data.success && data.products) {
        setWebProducts(data.products)
      }
    } catch (err) {
      console.error('Web search error:', err)
    } finally {
      setIsSearchingWeb(false)
    }
  }

  const analyzeImageFromUrl = async (url: string) => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)
    setWebProducts([])

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
      await searchWebProducts(data.analysis)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse de l\'image')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImageSelect = useCallback(async (file: File) => {
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 10 Mo')
      return
    }

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
    setWebProducts([])

    try {
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'analyse')
      }

      setAnalysis(data.analysis)
      await searchWebProducts(data.analysis)
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
    setWebProducts([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-16 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium text-white">Powered by AI</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Trouvez l'inspiration parfaite
              </h1>
              <p className="text-lg text-white/80">
                Uploadez une photo et notre IA trouvera les produits similaires
                sur les meilleurs sites de décoration
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {!selectedImage ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="-mt-16 relative z-10"
              >
                {/* Drop Zone Card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-purple-500/10 p-8 lg:p-12">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                      transition-all duration-300
                      ${isDragging
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50/50'
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
                        w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all
                        ${isDragging ? 'bg-purple-500 scale-110' : 'bg-gradient-to-br from-purple-500 to-fuchsia-500'}
                      `}>
                        <Camera className="h-10 w-10 text-white" />
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {isDragging ? 'Déposez l\'image ici' : 'Déposez votre image'}
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md">
                        ou cliquez pour parcourir vos fichiers
                      </p>

                      <Button
                        variant="primary"
                        leftIcon={<Upload className="h-4 w-4" />}
                        className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700"
                      >
                        Choisir une image
                      </Button>

                      <p className="text-xs text-gray-400 mt-4">
                        PNG, JPG ou WEBP • Max 10 Mo
                      </p>
                    </div>
                  </div>

                  {/* Example Images */}
                  <div className="mt-10">
                    <p className="text-sm text-gray-500 text-center mb-6">
                      Ou essayez avec une de ces inspirations :
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80', label: 'Chambre' },
                        { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', label: 'Salon' },
                        { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80', label: 'Moderne' },
                        { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80', label: 'Bureau' },
                      ].map((item, index) => (
                        <button
                          key={index}
                          onClick={async () => {
                            setSelectedImage(item.url)
                            await analyzeImageFromUrl(item.url)
                          }}
                          className="relative aspect-square rounded-2xl overflow-hidden group ring-2 ring-transparent hover:ring-purple-500 transition-all"
                        >
                          <Image
                            src={item.url}
                            alt={item.label}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <span className="text-white font-medium text-sm">{item.label}</span>
                          </div>
                          <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/20 transition-colors flex items-center justify-center">
                            <Search className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="-mt-16 relative z-10"
              >
                {/* Results Card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden">
                  {/* Image & Analysis Section */}
                  <div className="grid lg:grid-cols-5 gap-0">
                    {/* Uploaded Image - 2 cols */}
                    <div className="lg:col-span-2 relative bg-gray-100">
                      <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative">
                        <Image
                          src={selectedImage}
                          alt="Image analysée"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin mx-auto mb-4" />
                              <p className="font-semibold text-lg">Analyse en cours...</p>
                              <p className="text-sm text-white/70">Notre IA examine votre image</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={resetSearch}
                        className="absolute top-4 right-4 p-2.5 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                      >
                        <X className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>

                    {/* Analysis Results - 3 cols */}
                    <div className="lg:col-span-3 p-6 lg:p-8">
                      {error ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <X className="h-8 w-8 text-red-500" />
                            </div>
                            <p className="text-red-700 font-semibold mb-2">Erreur d'analyse</p>
                            <p className="text-red-600 text-sm mb-4">{error}</p>
                            <Button variant="secondary" onClick={resetSearch}>
                              Réessayer
                            </Button>
                          </div>
                        </div>
                      ) : analysis ? (
                        <div className="space-y-5">
                          {/* AI Description */}
                          <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl p-5 border border-purple-100">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                              </div>
                              <h3 className="font-bold text-gray-900">Analyse IA</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{analysis.description}</p>
                          </div>

                          {/* Tags Grid - 2x2 */}
                          <div className="grid grid-cols-2 gap-3">
                            {/* Objects */}
                            {analysis.objects.length > 0 && (
                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sofa className="h-4 w-4 text-purple-600" />
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Objets</h4>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {analysis.objects.slice(0, 4).map((obj, i) => (
                                    <span key={i} className="text-xs bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
                                      {obj}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Colors */}
                            {analysis.colors.length > 0 && (
                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Palette className="h-4 w-4 text-pink-600" />
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Couleurs</h4>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {analysis.colors.slice(0, 4).map((color, i) => (
                                    <span key={i} className="text-xs bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
                                      {color}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Style */}
                            {analysis.style.length > 0 && (
                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Home className="h-4 w-4 text-indigo-600" />
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Style</h4>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {analysis.style.slice(0, 3).map((style, i) => (
                                    <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                                      {style}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Materials */}
                            {analysis.materials.length > 0 && (
                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <TreeDeciduous className="h-4 w-4 text-emerald-600" />
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Matériaux</h4>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {analysis.materials.slice(0, 4).map((mat, i) => (
                                    <span key={i} className="text-xs bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
                                      {mat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Categories */}
                          {analysis.suggestedCategories.length > 0 && (
                            <div className="flex items-center gap-3 pt-2">
                              <span className="text-sm text-gray-500">Explorer :</span>
                              {analysis.suggestedCategories.map((cat) => (
                                <Link
                                  key={cat}
                                  href={`/categories/${cat}`}
                                  className="inline-flex items-center gap-1.5 text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium"
                                >
                                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-purple-600" />
                            <p className="text-gray-500">Analyse de l'image...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Products Section */}
                  {(isSearchingWeb || webProducts.length > 0) && (
                    <div className="border-t border-gray-100 p-6 lg:p-8 bg-gray-50/50">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                            <Globe className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">Produits similaires</h2>
                            <p className="text-sm text-gray-500">
                              {isSearchingWeb ? 'Recherche en cours...' : `${webProducts.length} produits trouvés sur le web`}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={resetSearch}
                          leftIcon={<RefreshCw className="h-4 w-4" />}
                        >
                          Nouvelle recherche
                        </Button>
                      </div>

                      {isSearchingWeb ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-3 animate-pulse">
                              <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
                              <div className="h-4 bg-gray-200 rounded mb-2" />
                              <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {webProducts.map((product, index) => (
                            <motion.a
                              key={index}
                              href={product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="group bg-white rounded-2xl p-3 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-purple-200"
                            >
                              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  unoptimized
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* Similarity Badge */}
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs font-semibold text-gray-700">{product.similarity}%</span>
                                </div>
                                {/* External Link Icon */}
                                <div className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="h-3.5 w-3.5 text-gray-700" />
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase">
                                    {product.store}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-purple-700 transition-colors">
                                  {product.name}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                                  {product.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-900">{product.price}</span>
                                  <span className="text-xs text-purple-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Voir <ArrowRight className="h-3 w-3" />
                                  </span>
                                </div>
                              </div>
                            </motion.a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* How it works - Only show when no image selected */}
      {!selectedImage && (
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
              Comment ça fonctionne ?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Upload,
                  color: 'from-purple-500 to-violet-500',
                  title: '1. Uploadez',
                  description: 'Glissez ou sélectionnez une photo de décoration qui vous inspire'
                },
                {
                  icon: Sparkles,
                  color: 'from-fuchsia-500 to-pink-500',
                  title: '2. Analyse IA',
                  description: 'Notre intelligence artificielle analyse styles, couleurs et objets'
                },
                {
                  icon: ShoppingBag,
                  color: 'from-violet-500 to-purple-600',
                  title: '3. Découvrez',
                  description: 'Trouvez les produits similaires chez vos enseignes préférées'
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
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function VisualSearchLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
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
