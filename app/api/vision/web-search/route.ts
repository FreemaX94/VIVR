import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

interface WebProduct {
  name: string
  description: string
  price: string
  store: string
  url: string
  imageUrl: string
  similarity: number
}

const SEARCH_PROMPT = `Tu es un expert en shopping et décoration intérieure.

À partir de l'analyse d'image suivante, génère une liste de 8 produits similaires qu'on pourrait trouver sur des sites e-commerce français (IKEA, Maisons du Monde, La Redoute, AM.PM, Zara Home, Conforama, BUT, Made.com).

Analyse reçue:
- Objets détectés: {objects}
- Couleurs: {colors}
- Style: {style}
- Matériaux: {materials}
- Pièce: {room}

Pour chaque produit, invente un résultat réaliste avec:
- Un nom de produit précis
- Une description courte (1 phrase)
- Un prix réaliste en euros
- Le nom du magasin
- Une URL plausible vers le produit (format: https://www.store.fr/product-name)
- Un score de similarité (60-98%)

Retourne UNIQUEMENT un JSON valide au format:
{
  "products": [
    {
      "name": "Nom du produit",
      "description": "Description courte",
      "price": "XXX €",
      "store": "Nom du magasin",
      "url": "https://www.example.com/product",
      "similarity": 85
    }
  ]
}

Fais varier les magasins et les types de produits (principal + accessoires). Sois créatif et réaliste.`

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

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Configuration API manquante' },
        { status: 500 }
      )
    }

    // Build the prompt with analysis data
    const prompt = SEARCH_PROMPT
      .replace('{objects}', analysis.objects?.join(', ') || 'non spécifié')
      .replace('{colors}', analysis.colors?.join(', ') || 'non spécifié')
      .replace('{style}', analysis.style?.join(', ') || 'non spécifié')
      .replace('{materials}', analysis.materials?.join(', ') || 'non spécifié')
      .replace('{room}', analysis.room || 'non spécifié')

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Pas de réponse' },
        { status: 500 }
      )
    }

    // Parse JSON response
    let productsData
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      productsData = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse products response:', content)
      return NextResponse.json(
        { success: false, error: 'Erreur de parsing' },
        { status: 500 }
      )
    }

    // Add placeholder images based on the object type
    const productsWithImages: WebProduct[] = (productsData.products || []).map((product: Omit<WebProduct, 'imageUrl'>, index: number) => {
      // Generate a relevant Unsplash image URL based on product name
      const searchTerm = encodeURIComponent(product.name.split(' ').slice(0, 2).join(' '))
      return {
        ...product,
        imageUrl: `https://source.unsplash.com/400x400/?${searchTerm},furniture,decor&sig=${index}`
      }
    })

    return NextResponse.json({
      success: true,
      products: productsWithImages
    })

  } catch (error) {
    console.error('Web search error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
