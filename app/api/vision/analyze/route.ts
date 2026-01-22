import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export interface VisionAnalysisResult {
  success: boolean
  analysis?: {
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
  error?: string
}

const VIVR_CATEGORIES = [
  'salon',
  'chambre',
  'cuisine',
  'bureau',
  'salle-de-bain',
  'exterieur'
]

const SYSTEM_PROMPT = `Tu es un expert en décoration intérieure et design de mobilier pour VIVR, une boutique de décoration française.

Analyse l'image fournie et extrais les informations suivantes au format JSON:

{
  "objects": ["liste des objets/meubles détectés"],
  "colors": ["couleurs dominantes en français"],
  "style": ["styles de design: moderne, scandinave, industriel, bohème, minimaliste, classique, art déco, rustique, contemporain"],
  "materials": ["matériaux visibles: bois, métal, verre, tissu, cuir, céramique, rotin, marbre, béton"],
  "room": "pièce si identifiable: salon, chambre, cuisine, bureau, salle de bain, extérieur ou null",
  "mood": ["ambiance: chaleureux, épuré, cosy, luxueux, naturel, coloré, sobre"],
  "description": "Description courte et engageante en français de ce qu'on voit, style catalogue déco",
  "suggestedCategories": ["catégories VIVR pertinentes parmi: salon, chambre, cuisine, bureau, salle-de-bain, exterieur"]
}

Sois précis et exhaustif. Retourne UNIQUEMENT le JSON, sans texte autour.`

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')

  const contentType = response.headers.get('content-type') || 'image/jpeg'

  return {
    data: base64,
    mimeType: contentType
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, imageUrl } = body

    if (!image && !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image requise (base64 ou URL)' },
        { status: 400 }
      )
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Configuration Google Gemini manquante' },
        { status: 500 }
      )
    }

    // Prepare image data for Gemini
    let imageData: { data: string; mimeType: string }

    if (imageUrl) {
      // Fetch image from URL and convert to base64
      imageData = await fetchImageAsBase64(imageUrl)
    } else {
      // Handle base64 image
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:(.+);base64,(.+)$/)
        if (matches) {
          imageData = {
            mimeType: matches[1],
            data: matches[2]
          }
        } else {
          imageData = {
            mimeType: 'image/jpeg',
            data: image
          }
        }
      } else {
        imageData = {
          mimeType: 'image/jpeg',
          data: image
        }
      }
    }

    // Call Gemini Vision API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data
        }
      }
    ])

    const response = await result.response
    const content = response.text()

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Pas de réponse de Gemini' },
        { status: 500 }
      )
    }

    // Parse JSON response
    let analysis
    try {
      // Clean potential markdown formatting
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content)
      return NextResponse.json(
        { success: false, error: 'Erreur de parsing de l\'analyse' },
        { status: 500 }
      )
    }

    // Generate search keywords from analysis
    const searchKeywords = [
      ...analysis.objects || [],
      ...analysis.colors || [],
      ...analysis.style || [],
      ...analysis.materials || [],
      analysis.room
    ].filter(Boolean).map(k => k.toLowerCase())

    // Validate and filter suggested categories
    const validCategories = (analysis.suggestedCategories || [])
      .filter((cat: string) => VIVR_CATEGORIES.includes(cat.toLowerCase()))
      .map((cat: string) => cat.toLowerCase())

    const finalResult: VisionAnalysisResult = {
      success: true,
      analysis: {
        objects: analysis.objects || [],
        colors: analysis.colors || [],
        style: analysis.style || [],
        materials: analysis.materials || [],
        room: analysis.room || null,
        mood: analysis.mood || [],
        searchKeywords: [...new Set(searchKeywords)],
        description: analysis.description || '',
        suggestedCategories: validCategories.length > 0 ? validCategories : ['salon']
      }
    }

    return NextResponse.json(finalResult)

  } catch (error) {
    console.error('Gemini Vision API error:', error)

    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'analyse de l\'image' },
      { status: 500 }
    )
  }
}
