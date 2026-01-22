import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface VisionAnalysisResult {
  success: boolean
  analysis?: {
    objects: string[]           // Detected objects (lamp, sofa, table, etc.)
    colors: string[]            // Dominant colors
    style: string[]             // Design styles (modern, scandinavian, industrial, etc.)
    materials: string[]         // Materials detected (wood, metal, fabric, etc.)
    room: string | null         // Room type if detectable
    mood: string[]              // Ambiance keywords
    searchKeywords: string[]    // Combined keywords for product search
    description: string         // Natural language description
    suggestedCategories: string[] // VIVR categories that match
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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Configuration OpenAI manquante' },
        { status: 500 }
      )
    }

    // Prepare image content for OpenAI
    let imageContent: OpenAI.Chat.Completions.ChatCompletionContentPartImage

    if (imageUrl) {
      imageContent = {
        type: 'image_url',
        image_url: {
          url: imageUrl,
          detail: 'high'
        }
      }
    } else {
      // Base64 image
      const base64Data = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
      imageContent = {
        type: 'image_url',
        image_url: {
          url: base64Data,
          detail: 'high'
        }
      }
    }

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyse cette image pour trouver des produits de décoration similaires.'
            },
            imageContent
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Pas de réponse de l\'API Vision' },
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
      console.error('Failed to parse Vision response:', content)
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

    const result: VisionAnalysisResult = {
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

    return NextResponse.json(result)

  } catch (error) {
    console.error('Vision API error:', error)

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { success: false, error: `Erreur OpenAI: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'analyse de l\'image' },
      { status: 500 }
    )
  }
}
