import { NextRequest, NextResponse } from 'next/server'
import { getJson } from 'serpapi'

interface WebProduct {
  name: string
  description: string
  price: string
  store: string
  url: string
  imageUrl: string
  similarity: number
}

interface ShoppingResult {
  title: string
  link: string
  product_link?: string
  source: string
  price: string
  extracted_price?: number
  thumbnail: string
  snippet?: string
}

// Build search query from analysis
function buildSearchQuery(analysis: {
  objects?: string[]
  colors?: string[]
  style?: string[]
  materials?: string[]
  room?: string
}): string {
  const parts: string[] = []

  // Add main object (first one is usually the most relevant)
  if (analysis.objects && analysis.objects.length > 0) {
    parts.push(analysis.objects[0])
  }

  // Add primary color
  if (analysis.colors && analysis.colors.length > 0) {
    parts.push(analysis.colors[0])
  }

  // Add style
  if (analysis.style && analysis.style.length > 0) {
    parts.push(analysis.style[0])
  }

  // Add material if relevant
  if (analysis.materials && analysis.materials.length > 0) {
    parts.push(analysis.materials[0])
  }

  return parts.join(' ') + ' décoration'
}

// Calculate similarity based on matching attributes
function calculateSimilarity(product: ShoppingResult, analysis: {
  objects?: string[]
  colors?: string[]
  style?: string[]
}): number {
  let score = 60 // Base score
  const title = product.title.toLowerCase()
  const snippet = (product.snippet || '').toLowerCase()
  const combined = title + ' ' + snippet

  // Check for object matches
  analysis.objects?.forEach(obj => {
    if (combined.includes(obj.toLowerCase())) {
      score += 10
    }
  })

  // Check for color matches
  analysis.colors?.forEach(color => {
    if (combined.includes(color.toLowerCase())) {
      score += 8
    }
  })

  // Check for style matches
  analysis.style?.forEach(style => {
    if (combined.includes(style.toLowerCase())) {
      score += 7
    }
  })

  return Math.min(score, 98) // Cap at 98%
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis } = body

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: 'Analyse requise' },
        { status: 400 }
      )
    }

    // Check for SerpAPI key
    const serpApiKey = process.env.SERPAPI_KEY

    if (!serpApiKey) {
      // Fallback to generated results if no API key
      return await generateFallbackResults(analysis)
    }

    // Build search query from analysis
    const searchQuery = buildSearchQuery(analysis)

    try {
      // Search Google Shopping via SerpAPI
      const results = await getJson({
        engine: 'google_shopping',
        q: searchQuery,
        location: 'France',
        hl: 'fr',
        gl: 'fr',
        api_key: serpApiKey
      })

      const shoppingResults: ShoppingResult[] = results.shopping_results || []

      if (shoppingResults.length === 0) {
        return await generateFallbackResults(analysis)
      }

      // Transform results to our format
      const products: WebProduct[] = shoppingResults.slice(0, 8).map((item) => ({
        name: item.title,
        description: item.snippet || `Produit disponible chez ${item.source}`,
        price: item.price || 'Prix non disponible',
        store: item.source,
        url: item.product_link || item.link || `https://www.google.fr/search?q=${encodeURIComponent(item.title)}`,
        imageUrl: item.thumbnail || `https://picsum.photos/seed/${item.title.length}/400/400`,
        similarity: calculateSimilarity(item, analysis)
      }))

      // Sort by similarity
      products.sort((a, b) => b.similarity - a.similarity)

      return NextResponse.json({
        success: true,
        products,
        source: 'google_shopping'
      })

    } catch (serpError) {
      console.error('SerpAPI error:', serpError)
      return await generateFallbackResults(analysis)
    }

  } catch (error) {
    console.error('Web search error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}

// Fallback function using Gemini to generate realistic search URLs
async function generateFallbackResults(analysis: {
  objects?: string[]
  colors?: string[]
  style?: string[]
  materials?: string[]
  room?: string
}): Promise<NextResponse> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')

  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!geminiKey) {
    return NextResponse.json(
      { success: false, error: 'Configuration API manquante' },
      { status: 500 }
    )
  }

  const genAI = new GoogleGenerativeAI(geminiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  // Build search terms for real URLs
  const mainObject = analysis.objects?.[0] || 'meuble'
  const color = analysis.colors?.[0] || ''
  const style = analysis.style?.[0] || ''
  const rawSearchTerm = `${mainObject} ${color} ${style}`.trim()

  const prompt = `Tu es un expert shopping. Génère 8 produits de décoration similaires à: ${analysis.objects?.join(', ')} en style ${analysis.style?.join(', ')}, couleurs ${analysis.colors?.join(', ')}.

Pour chaque produit, utilise le magasin indiqué et construis l'URL de recherche.
Terme de recherche à utiliser: "${rawSearchTerm}"

Les magasins disponibles sont: IKEA, Maisons du Monde, La Redoute, Conforama, BUT, Amazon, Cdiscount, Leroy Merlin

Retourne UNIQUEMENT ce JSON:
{
  "products": [
    {
      "name": "Nom descriptif du produit",
      "description": "Description courte",
      "price": "XXX €",
      "store": "Nom du magasin (ex: IKEA)",
      "searchTerm": "terme de recherche spécifique pour ce produit",
      "similarity": 85
    }
  ]
}

Varie les magasins (au moins 5 différents). Le prix doit être réaliste.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const productsData = JSON.parse(cleanContent)

    // Store URL templates
    const storeUrls: Record<string, (term: string) => string> = {
      'ikea': (t) => `https://www.ikea.com/fr/fr/search/?q=${encodeURIComponent(t)}`,
      'maisons du monde': (t) => `https://www.maisonsdumonde.com/FR/fr/search/${encodeURIComponent(t)}/`,
      'la redoute': (t) => `https://www.laredoute.fr/prlst/s/?kw=${encodeURIComponent(t)}`,
      'conforama': (t) => `https://www.conforama.fr/search?q=${encodeURIComponent(t)}`,
      'but': (t) => `https://www.but.fr/recherche?q=${encodeURIComponent(t)}`,
      'amazon': (t) => `https://www.amazon.fr/s?k=${encodeURIComponent(t)}`,
      'cdiscount': (t) => `https://www.cdiscount.com/search/10/${encodeURIComponent(t)}.html`,
      'leroy merlin': (t) => `https://www.leroymerlin.fr/search?q=${encodeURIComponent(t)}`
    }

    // Build products with real URLs and images
    const productsWithImages: WebProduct[] = (productsData.products || []).map((product: { name: string; description: string; price: string; store: string; searchTerm?: string; similarity: number }, index: number) => {
      const storeLower = product.store.toLowerCase()
      const searchTerm = product.searchTerm || product.name

      // Find matching store URL builder
      const urlBuilder = Object.entries(storeUrls).find(([key]) => storeLower.includes(key))?.[1]
      const url = urlBuilder ? urlBuilder(searchTerm) : `https://www.google.fr/search?q=${encodeURIComponent(searchTerm + ' achat')}`

      // Generate seed for placeholder image
      const seed = product.name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) + index

      return {
        name: product.name,
        description: product.description,
        price: product.price,
        store: product.store,
        url,
        imageUrl: `https://picsum.photos/seed/${seed}/400/400`,
        similarity: product.similarity
      }
    })

    return NextResponse.json({
      success: true,
      products: productsWithImages,
      source: 'ai_generated',
      note: 'Les liens mènent vers des pages de recherche sur les sites marchands'
    })

  } catch (parseError) {
    console.error('Failed to generate fallback results:', parseError)
    return NextResponse.json(
      { success: false, error: 'Erreur de génération' },
      { status: 500 }
    )
  }
}
