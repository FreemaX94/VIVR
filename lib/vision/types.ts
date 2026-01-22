/**
 * Type definitions for VIVR Vision AI module
 */

// ============================================
// Visual Search Types
// ============================================

export interface VisualSearchResult {
  productId: string
  similarity: number
  matchReasons: string[]
}

export interface VisualSearchConfig {
  model: 'clip' | 'dinov2' | 'custom'
  vectorDimension: 512 | 768 | 1024
  topK: number
  minSimilarity: number
}

export interface ImageEmbedding {
  vector: number[]
  model: string
  createdAt: Date
}

// ============================================
// Auto-Tagging Types
// ============================================

export interface ProductAttributes {
  // Physical characteristics
  materials: Material[]
  finish: Finish[]
  dimensions?: {
    suggestedSize: 'petit' | 'moyen' | 'grand'
    aspectRatio?: 'carre' | 'rectangle' | 'rond' | 'irregulier'
  }

  // Style classification
  style: DecorationStyle[]
  aesthetic: Aesthetic[]

  // Room suggestions
  roomSuggestions: RoomType[]
  lightingType?: LightingType

  // Descriptive metadata
  keywords: string[]
  altText: string
  shortDescription?: string

  // Confidence scores
  confidence: {
    overall: number
    materials: number
    style: number
  }
}

export type Material =
  | 'bois'
  | 'metal'
  | 'tissu'
  | 'verre'
  | 'ceramique'
  | 'plastique'
  | 'rotin'
  | 'cuir'
  | 'marbre'
  | 'beton'
  | 'papier'
  | 'lin'
  | 'coton'
  | 'velours'
  | 'laiton'
  | 'acier'
  | 'bambou'

export type Finish =
  | 'mat'
  | 'brillant'
  | 'satine'
  | 'texture'
  | 'brut'
  | 'laque'
  | 'patine'
  | 'naturel'

export type DecorationStyle =
  | 'scandinave'
  | 'industriel'
  | 'boheme'
  | 'contemporain'
  | 'rustique'
  | 'art-deco'
  | 'minimaliste'
  | 'japonais'
  | 'mediterraneen'
  | 'vintage'
  | 'mid-century'
  | 'classique'
  | 'ethnique'
  | 'tropical'

export type Aesthetic =
  | 'minimaliste'
  | 'maximaliste'
  | 'cosy'
  | 'epure'
  | 'chaleureux'
  | 'moderne'
  | 'traditionnel'
  | 'eclectique'

export type RoomType =
  | 'salon'
  | 'chambre'
  | 'cuisine'
  | 'bureau'
  | 'entree'
  | 'salle-de-bain'
  | 'salle-a-manger'
  | 'terrasse'
  | 'chambre-enfant'

export type LightingType =
  | 'ambiance'
  | 'task'
  | 'accent'
  | 'decorative'
  | 'naturelle'

// ============================================
// Color Analysis Types
// ============================================

export interface ColorPalette {
  dominant: HexColor
  secondary: HexColor[]
  accent?: HexColor
  neutral?: HexColor
  mood: ColorMood
  harmony: ColorHarmony
  temperature: 'chaud' | 'froid' | 'neutre'
}

export type HexColor = `#${string}`

export type ColorMood =
  | 'energique'
  | 'apaisant'
  | 'elegant'
  | 'naturel'
  | 'moderne'
  | 'classique'
  | 'joyeux'
  | 'sophistique'

export type ColorHarmony =
  | 'monochrome'
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'split-complementary'
  | 'tetradic'

export interface ColorSearchOptions {
  targetColor: HexColor
  tolerance: number // 0-100, percentage of color distance allowed
  harmonyType?: ColorHarmony
  includeNeutrals?: boolean
}

// ============================================
// Style Classification Types
// ============================================

export interface StyleVector {
  scandinave: number
  industriel: number
  boheme: number
  contemporain: number
  rustique: number
  artDeco: number
  minimaliste: number
  japonais: number
  mediterraneen: number
  vintage: number
  midCentury: number
  classique: number
}

export interface StyleClassificationResult {
  primaryStyle: DecorationStyle
  confidence: number
  styleVector: StyleVector
  secondaryStyles: Array<{
    style: DecorationStyle
    score: number
  }>
}

// ============================================
// Image Optimization Types
// ============================================

export interface ImageOptimizationConfig {
  quality: number // 1-100
  format: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
  maxWidth?: number
  maxHeight?: number
  fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  background?: HexColor | 'transparent'
}

export interface ThumbnailConfig {
  name: string
  width: number
  height: number
  quality: number
  fit: 'cover' | 'contain'
}

export const THUMBNAIL_PRESETS: Record<string, ThumbnailConfig> = {
  cart: { name: 'cart', width: 80, height: 80, quality: 80, fit: 'cover' },
  productCard: { name: 'productCard', width: 400, height: 400, quality: 85, fit: 'cover' },
  productList: { name: 'productList', width: 200, height: 200, quality: 80, fit: 'cover' },
  productDetail: { name: 'productDetail', width: 800, height: 800, quality: 90, fit: 'contain' },
  zoom: { name: 'zoom', width: 1600, height: 1600, quality: 95, fit: 'contain' },
  og: { name: 'og', width: 1200, height: 630, quality: 85, fit: 'cover' },
  instagram: { name: 'instagram', width: 1080, height: 1080, quality: 90, fit: 'cover' },
}

export interface ProcessedImage {
  originalUrl: string
  optimizedUrl: string
  thumbnails: Record<string, string>
  blurHash: string
  metadata: {
    width: number
    height: number
    format: string
    size: number
  }
}

// ============================================
// AR/3D Types
// ============================================

export interface Model3D {
  glbUrl: string
  usdzUrl?: string // For iOS AR Quick Look
  thumbnailUrl: string
  dimensions: {
    width: number
    height: number
    depth: number
    unit: 'cm' | 'm' | 'inch'
  }
  generatedFrom: 'manual' | 'ai' | 'scan'
}

export interface ARPlacement {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: number
  surfaceType: 'floor' | 'wall' | 'table' | 'shelf'
}

export interface RoomVisualizationResult {
  compositeImageUrl: string
  depthMap: string
  placements: ARPlacement[]
  confidence: number
}

// ============================================
// Recommendation Types
// ============================================

export interface RecommendationContext {
  userId?: string
  currentProductId?: string
  roomType?: RoomType
  stylePreference?: DecorationStyle[]
  colorPreference?: HexColor[]
  priceRange?: { min: number; max: number }
  excludeIds?: string[]
}

export interface RecommendationResult {
  productId: string
  score: number
  reasons: RecommendationReason[]
}

export type RecommendationReason =
  | { type: 'style_match'; style: DecorationStyle; score: number }
  | { type: 'color_match'; color: HexColor; harmony: ColorHarmony }
  | { type: 'room_compatible'; room: RoomType }
  | { type: 'trending'; trendScore: number }
  | { type: 'frequently_bought_together'; productId: string }
  | { type: 'visual_similarity'; similarity: number }

// ============================================
// API Response Types
// ============================================

export interface VisionAPIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  metadata?: {
    processingTime: number
    model: string
    cached: boolean
  }
}

export interface BatchProcessingResult {
  successful: number
  failed: number
  results: Array<{
    id: string
    success: boolean
    error?: string
  }>
}
