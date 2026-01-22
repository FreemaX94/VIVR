# Vision AI Roadmap for VIVR Home Decoration E-commerce

## Executive Summary

This document outlines a comprehensive Vision AI strategy for VIVR, a French home decoration e-commerce platform built with Next.js 14, Prisma, and PostgreSQL. The roadmap covers visual search capabilities, image processing automation, AR/VR experiences, visual recommendations, and image optimization - all tailored for the home decoration vertical.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Phase 1: Image Search & Visual Discovery](#phase-1-image-search--visual-discovery)
3. [Phase 2: Product Image Automation](#phase-2-product-image-automation)
4. [Phase 3: AR/VR Experiences](#phase-3-arvr-experiences)
5. [Phase 4: Visual Recommendations](#phase-4-visual-recommendations)
6. [Phase 5: Image Optimization Pipeline](#phase-5-image-optimization-pipeline)
7. [Technical Architecture](#technical-architecture)
8. [Model Selection Guide](#model-selection-guide)
9. [Cost Analysis & Optimization](#cost-analysis--optimization)
10. [Implementation Timeline](#implementation-timeline)

---

## Current State Analysis

### Existing Infrastructure

```
Platform: Next.js 14 with App Router
Database: PostgreSQL with Prisma ORM
Images: Cloudinary + Unsplash (configured in next.config.js)
Auth: NextAuth.js
Payments: Stripe
State: Zustand
```

### Current Image Handling

- Products have `images: String[]` array in Prisma schema
- Using Next.js `<Image>` component with responsive sizes
- No visual search capabilities
- No automated tagging or categorization
- Basic text-based search only

### Opportunities Identified

1. **Visual Search Gap**: Users cannot search by uploading/taking photos
2. **Manual Tagging**: No automated product attribute extraction
3. **No AR Preview**: Missing "see in your room" functionality
4. **Basic Recommendations**: No style-based or visual similarity matching
5. **Image Optimization**: Basic setup, room for improvement

---

## Phase 1: Image Search & Visual Discovery

### 1.1 Visual Search for Products

**Goal**: Allow users to upload or capture photos to find similar products

#### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Upload    │────▶│  Image Encoding  │────▶│  Vector Search  │
│  (Camera/File)  │     │  (CLIP/DINOv2)   │     │  (pgvector)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                 ┌─────────────────┐
                                                 │  Product Results│
                                                 │  (Top-K Similar)│
                                                 └─────────────────┘
```

#### Recommended Models

| Model | Use Case | Pros | Cons |
|-------|----------|------|------|
| **OpenAI CLIP** | General visual search | Excellent text-image alignment | API costs |
| **Meta DINOv2** | Feature extraction | Self-supervised, open-source | Requires hosting |
| **Google ViT** | Image classification | Fast inference | Less versatile |
| **Replicate CLIP** | Quick prototyping | Easy API | Per-request pricing |

#### Implementation Strategy

```typescript
// lib/vision/visualSearch.ts
interface VisualSearchConfig {
  model: 'clip' | 'dinov2' | 'custom'
  vectorDimension: number
  topK: number
  minSimilarity: number
}

// Database extension (Prisma migration)
// Add pgvector extension and embedding column
model Product {
  // ... existing fields
  embedding Float[] @db.Array(Float) // Vector embedding
  // Alternatively use pgvector native type
}
```

#### API Endpoint Design

```typescript
// app/api/visual-search/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const image = formData.get('image') as File

  // 1. Preprocess image (resize, normalize)
  // 2. Generate embedding via vision model
  // 3. Query pgvector for similar products
  // 4. Return ranked results with similarity scores
}
```

### 1.2 "Find Similar" Feature

**Goal**: One-click discovery of visually similar products

#### Implementation

```typescript
// components/product/SimilarProducts.tsx
interface SimilarProduct {
  product: Product
  similarity: number
  matchReasons: string[] // "Similar color", "Same style", etc.
}

// Pre-compute embeddings during product import
// Store in PostgreSQL with pgvector extension
// Query: SELECT * FROM products
//        ORDER BY embedding <-> $1
//        LIMIT 10
```

### 1.3 Style Matching Engine

**Goal**: Match products by interior design style

#### Style Categories for Home Decoration

```typescript
const DECORATION_STYLES = [
  'Scandinave',      // Nordic minimalism
  'Industriel',      // Industrial, metal, raw
  'Boheme',          // Bohemian, eclectic
  'Contemporain',    // Modern, clean lines
  'Rustique',        // Country, natural wood
  'Art Deco',        // Geometric, luxurious
  'Minimaliste',     // Ultra-minimal
  'Japonais',        // Japandi, zen
  'Mediterraneen',   // Coastal, bright
  'Vintage',         // Retro, mid-century
] as const
```

#### Style Classification Model

```typescript
// lib/vision/styleClassifier.ts
async function classifyProductStyle(imageUrl: string): Promise<{
  primaryStyle: string
  confidence: number
  secondaryStyles: Array<{ style: string; score: number }>
}> {
  // Option 1: Fine-tuned CLIP with style prompts
  // Option 2: Custom CNN trained on interior design dataset
  // Option 3: GPT-4 Vision with structured output
}
```

### 1.4 Color-Based Search

**Goal**: Find products by dominant colors

#### Color Extraction Pipeline

```typescript
// lib/vision/colorAnalysis.ts
interface ColorPalette {
  dominant: string      // HEX
  secondary: string[]   // Top 5 colors
  mood: string         // "Warm", "Cool", "Neutral"
  harmony: string      // "Monochrome", "Complementary", etc.
}

// Use vibrant.js or custom K-means clustering
// Store extracted colors in product metadata
```

#### Prisma Schema Extension

```prisma
model Product {
  // ... existing
  dominantColor    String?
  colorPalette     Json?    // Array of hex colors
  colorMood        String?  // "warm" | "cool" | "neutral"
}
```

---

## Phase 2: Product Image Automation

### 2.1 Auto-Tagging System

**Goal**: Automatically extract product attributes from images

#### Attribute Categories

```typescript
interface ProductAttributes {
  // Physical
  material: string[]     // "bois", "metal", "tissu", "verre"
  finish: string[]       // "mat", "brillant", "texturé"

  // Style
  style: string[]        // "moderne", "vintage", "boheme"
  aesthetic: string[]    // "minimaliste", "maximaliste"

  // Functional
  roomSuggestion: string[] // "salon", "chambre", "bureau"
  lightingType?: string   // For lamps: "ambiance", "task", "accent"

  // Descriptive
  keywords: string[]     // AI-generated search keywords
  altText: string        // Accessibility description
}
```

#### Implementation Options

| Approach | Model | Cost | Accuracy |
|----------|-------|------|----------|
| **Cloud API** | GPT-4 Vision | $0.01-0.03/image | 95%+ |
| **Cloud API** | Claude 3 Vision | $0.008-0.024/image | 94%+ |
| **Hosted** | LLaVA 1.6 34B | GPU hosting | 90%+ |
| **Specialized** | Google Vision AI | $1.50/1000 images | 85% |

#### GPT-4 Vision Implementation

```typescript
// lib/vision/autoTagger.ts
import OpenAI from 'openai'

const openai = new OpenAI()

async function autoTagProduct(imageUrl: string): Promise<ProductAttributes> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: `Analyze this home decoration product image and extract:

          Return JSON with:
          - material: array of materials (bois, metal, tissu, verre, ceramique, plastique)
          - finish: surface finish (mat, brillant, satiné, texturé)
          - style: design style (scandinave, industriel, boheme, contemporain, etc.)
          - roomSuggestion: ideal rooms (salon, chambre, cuisine, bureau, entree)
          - colorDescription: main colors in French
          - keywords: 10 search keywords in French
          - altText: accessibility description in French (max 150 chars)

          Be specific to French home decoration terminology.`
        },
        {
          type: "image_url",
          image_url: { url: imageUrl }
        }
      ]
    }],
    response_format: { type: "json_object" },
    max_tokens: 500
  })

  return JSON.parse(response.choices[0].message.content)
}
```

### 2.2 Background Removal

**Goal**: Create clean product images with transparent/white backgrounds

#### Service Comparison

| Service | Quality | Speed | Cost |
|---------|---------|-------|------|
| **Remove.bg** | Excellent | Fast | $0.09-0.40/image |
| **Photoroom API** | Excellent | Fast | $0.08-0.20/image |
| **Rembg (Open Source)** | Good | Medium | Free (GPU hosting) |
| **Segment Anything** | Excellent | Slow | Free (GPU hosting) |

#### Implementation

```typescript
// lib/vision/backgroundRemoval.ts
import Replicate from 'replicate'

const replicate = new Replicate()

async function removeBackground(imageUrl: string): Promise<{
  transparentUrl: string
  whiteBackgroundUrl: string
}> {
  // Use Replicate's rembg or SAM model
  const output = await replicate.run(
    "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
    { input: { image: imageUrl } }
  )

  return {
    transparentUrl: output as string,
    whiteBackgroundUrl: await addWhiteBackground(output as string)
  }
}
```

### 2.3 Image Enhancement

**Goal**: Improve product photo quality automatically

#### Enhancement Pipeline

```typescript
// lib/vision/imageEnhancement.ts
interface EnhancementOptions {
  upscale?: boolean       // 2x or 4x upscaling
  denoise?: boolean       // Remove grain
  colorCorrect?: boolean  // Auto white balance
  sharpen?: boolean       // Edge enhancement
  lighting?: boolean      // Fix exposure
}

// Model options:
// - Real-ESRGAN for upscaling
// - Topaz-style enhancement via Replicate
// - Adobe Firefly (commercial)
```

### 2.4 Thumbnail Generation

**Goal**: Generate optimized thumbnails for various contexts

#### Thumbnail Specifications

```typescript
interface ThumbnailConfig {
  sizes: {
    cart: { width: 80, height: 80 }
    productCard: { width: 400, height: 400 }
    productList: { width: 200, height: 200 }
    zoom: { width: 1200, height: 1200 }
    og: { width: 1200, height: 630 }  // Social sharing
  }
  format: 'webp' | 'avif'
  quality: number  // 75-90
  fit: 'cover' | 'contain'
}
```

#### Cloudinary Integration

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

function generateThumbnails(publicId: string): Record<string, string> {
  return {
    cart: cloudinary.url(publicId, {
      width: 80,
      height: 80,
      crop: 'fill',
      format: 'webp',
      quality: 80
    }),
    productCard: cloudinary.url(publicId, {
      width: 400,
      height: 400,
      crop: 'fill',
      format: 'webp',
      quality: 85,
      dpr: 'auto'
    }),
    // ... other sizes
  }
}
```

---

## Phase 3: AR/VR Experiences

### 3.1 AR Furniture Preview

**Goal**: "See in your room" functionality for furniture and decor

#### Technology Stack

| Technology | Platform | Complexity | Notes |
|------------|----------|------------|-------|
| **WebXR** | Web browser | Medium | Requires HTTPS, limited iOS |
| **AR.js** | Web browser | Low | Marker-based, good fallback |
| **model-viewer** | Web browser | Low | Google's solution, excellent |
| **8th Wall** | Web browser | High | Commercial, best quality |
| **Native AR** | iOS/Android | High | ARKit/ARCore, requires app |

#### Recommended: model-viewer Implementation

```tsx
// components/ar/ProductAR.tsx
'use client'

import { useEffect, useRef } from 'react'

interface ProductARProps {
  modelUrl: string      // .glb or .gltf
  posterUrl: string     // Fallback image
  productName: string
}

export function ProductAR({ modelUrl, posterUrl, productName }: ProductARProps) {
  return (
    <model-viewer
      src={modelUrl}
      poster={posterUrl}
      alt={`Modèle 3D de ${productName}`}
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      shadow-intensity="1"
      exposure="0.8"
      style={{ width: '100%', height: '400px' }}
    >
      <button slot="ar-button" className="ar-button">
        Voir dans votre pièce
      </button>
    </model-viewer>
  )
}

// Script tag needed in layout.tsx:
// <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js" />
```

#### 3D Model Pipeline

```
Product Photo ──▶ 3D Scan/Modeling ──▶ GLB Export ──▶ CDN Storage
      │                                      │
      ▼                                      ▼
  AI Generation                        Optimization
  (Meshy.ai,                          (gltf-pipeline)
   TripoSR)
```

#### AI-Generated 3D Models

```typescript
// lib/vision/3dGeneration.ts
// Using Meshy.ai or Replicate's 3D models

async function generateProductModel(imageUrl: string): Promise<{
  glbUrl: string
  usdzUrl: string  // For iOS AR Quick Look
}> {
  // Option 1: Meshy.ai API
  // Option 2: Replicate TripoSR
  // Option 3: OpenAI's rumored 3D model

  const output = await replicate.run(
    "camenduru/triposr:...",
    { input: { image: imageUrl } }
  )

  return {
    glbUrl: output.glb,
    usdzUrl: output.usdz
  }
}
```

### 3.2 Room Visualization

**Goal**: Upload room photo, see products placed in context

#### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Room Photo     │────▶│  Scene Analysis  │────▶│  Product        │
│  Upload         │     │  (Depth, Layout) │     │  Placement      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                 ┌─────────────────┐
                                                 │  Composite      │
                                                 │  Rendering      │
                                                 └─────────────────┘
```

#### Implementation with Depth Estimation

```typescript
// lib/vision/roomVisualization.ts
import Replicate from 'replicate'

async function analyzeRoom(imageUrl: string): Promise<{
  depthMap: string
  segmentation: RoomSegmentation
  suggestedPlacements: Placement[]
}> {
  // 1. Depth estimation (MiDaS or Depth Anything)
  const depth = await replicate.run(
    "cjwbw/midas:...",
    { input: { image: imageUrl } }
  )

  // 2. Room segmentation (SAM + classification)
  const segments = await segmentRoom(imageUrl)

  // 3. Identify placement zones
  const placements = calculatePlacements(depth, segments)

  return { depthMap: depth, segmentation: segments, suggestedPlacements: placements }
}
```

### 3.3 Virtual Showroom

**Goal**: 360-degree virtual store experience

#### Technologies

| Solution | Type | Cost | Quality |
|----------|------|------|---------|
| **Matterport** | Scan-based | $$$ | Photo-realistic |
| **Three.js** | Custom built | $ | Customizable |
| **A-Frame** | WebVR | Free | Good |
| **Unity WebGL** | Game engine | $$ | Best |

#### Basic Three.js Showroom

```typescript
// components/showroom/VirtualShowroom.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'

export function VirtualShowroom({ products }: { products: Product[] }) {
  return (
    <Canvas camera={{ position: [0, 2, 5] }}>
      <Environment preset="apartment" />
      <OrbitControls />

      {/* Room shell */}
      <RoomModel />

      {/* Products on display */}
      {products.map((product, i) => (
        <ProductDisplay key={product.id} product={product} position={[i * 2, 0, 0]} />
      ))}
    </Canvas>
  )
}
```

### 3.4 3D Product Views

**Goal**: Interactive 360-degree product viewing

#### Implementation Options

1. **Pre-rendered 360 Images**: Simple, 36-72 photos stitched
2. **3D Models**: Interactive, requires GLB/GLTF
3. **Neural Radiance Fields**: From few photos (cutting edge)

```typescript
// components/product/Product360.tsx
import { useGLTF, OrbitControls, Stage } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

export function Product360({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl)

  return (
    <Canvas>
      <Stage environment="city" intensity={0.5}>
        <primitive object={scene} />
      </Stage>
      <OrbitControls autoRotate />
    </Canvas>
  )
}
```

---

## Phase 4: Visual Recommendations

### 4.1 Style-Based Suggestions

**Goal**: "Complete the look" recommendations based on style coherence

#### Algorithm Design

```typescript
// lib/recommendations/styleEngine.ts
interface StyleVector {
  scandinave: number
  industriel: number
  boheme: number
  // ... other styles
}

function calculateStyleCompatibility(
  product1: StyleVector,
  product2: StyleVector
): number {
  // Cosine similarity between style vectors
  return cosineSimilarity(
    Object.values(product1),
    Object.values(product2)
  )
}

async function getStyleRecommendations(
  productId: string,
  limit: number = 8
): Promise<Product[]> {
  const product = await getProductWithStyle(productId)

  // Query products with similar style vectors
  return prisma.$queryRaw`
    SELECT p.*,
           1 - (p.style_vector <-> ${product.styleVector}) as similarity
    FROM products p
    WHERE p.id != ${productId}
    ORDER BY p.style_vector <-> ${product.styleVector}
    LIMIT ${limit}
  `
}
```

### 4.2 Room Compatibility Engine

**Goal**: Suggest products that work together in specific rooms

#### Room Context Modeling

```typescript
// lib/recommendations/roomContext.ts
interface RoomContext {
  type: 'salon' | 'chambre' | 'cuisine' | 'bureau' | 'entree' | 'salle-de-bain'
  size: 'petit' | 'moyen' | 'grand'
  style: string
  existingProducts?: string[]  // Product IDs already in room
  lightingCondition: 'lumineux' | 'moyen' | 'sombre'
}

async function getRoomCompatibleProducts(
  context: RoomContext
): Promise<Product[]> {
  // 1. Filter by room type suitability
  // 2. Consider size constraints (don't suggest large sofa for small room)
  // 3. Match style preferences
  // 4. Avoid duplicates of existing products
  // 5. Suggest complementary pieces
}
```

### 4.3 Color Coordination

**Goal**: Recommend products that match or complement existing colors

#### Color Harmony Rules

```typescript
// lib/vision/colorHarmony.ts
type HarmonyType =
  | 'complementary'    // Opposite on color wheel
  | 'analogous'        // Adjacent colors
  | 'triadic'          // Three evenly spaced
  | 'split-complementary'
  | 'monochromatic'

function getHarmoniousProducts(
  baseColor: string,  // HEX
  harmonyType: HarmonyType,
  products: Product[]
): Product[] {
  const targetColors = calculateHarmonyColors(baseColor, harmonyType)

  return products.filter(product => {
    const productColors = product.colorPalette
    return targetColors.some(target =>
      productColors.some(pc => colorDistance(pc, target) < THRESHOLD)
    )
  })
}
```

### 4.4 Trend Detection

**Goal**: Identify and surface trending styles and products

#### Data Sources

1. **Internal**: View counts, cart additions, purchases, search queries
2. **External**: Pinterest trends, Instagram hashtags, Google Trends
3. **Industry**: Design magazines, trade shows, influencer content

#### Implementation

```typescript
// lib/recommendations/trendDetection.ts
interface TrendSignal {
  source: 'internal' | 'pinterest' | 'instagram' | 'google'
  keyword: string
  momentum: number  // Rate of increase
  volume: number
}

async function detectTrends(): Promise<{
  risingSstyles: string[]
  trendingColors: string[]
  hotProducts: Product[]
}> {
  // Aggregate signals from multiple sources
  // Weight by relevance to home decoration
  // Identify acceleration patterns
}

// Scheduled job to update trend scores
// cron: "0 0 * * *"  // Daily at midnight
async function updateTrendScores() {
  const trends = await detectTrends()

  // Update product trend scores in database
  for (const product of await prisma.product.findMany()) {
    const trendScore = calculateTrendScore(product, trends)
    await prisma.product.update({
      where: { id: product.id },
      data: { trendScore }
    })
  }
}
```

---

## Phase 5: Image Optimization Pipeline

### 5.1 Responsive Images

**Goal**: Serve optimal image sizes for all devices

#### Next.js Image Configuration

```javascript
// next.config.js (enhanced)
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
}
```

#### Responsive Image Component

```tsx
// components/ui/OptimizedImage.tsx
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  priority?: boolean
  sizes?: string
}

export function OptimizedImage({ src, alt, priority, sizes }: OptimizedImageProps) {
  // Generate Cloudinary URL with optimizations
  const optimizedSrc = getCloudinaryUrl(src, {
    format: 'auto',
    quality: 'auto',
    dpr: 'auto',
  })

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
      placeholder="blur"
      blurDataURL={generateBlurHash(src)}
    />
  )
}
```

### 5.2 WebP/AVIF Format Strategy

**Goal**: Use modern formats with fallbacks

#### Format Selection Logic

```typescript
// lib/images/formatSelection.ts
interface FormatConfig {
  avif: { quality: 80, effort: 4 }  // Smallest, best quality
  webp: { quality: 85 }             // Wide support
  jpeg: { quality: 90 }             // Universal fallback
}

// Cloudinary automatically handles format negotiation
// f_auto parameter selects best supported format

function getOptimalImageUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',  // Automatic format selection
    quality: 'auto:best',   // Adaptive quality
    flags: 'progressive',   // Progressive loading
  })
}
```

### 5.3 Lazy Loading Implementation

**Goal**: Load images only when needed

#### Native + Intersection Observer Strategy

```tsx
// components/ui/LazyImage.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export function LazyImage({ src, alt, ...props }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }  // Start loading 200px before viewport
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative">
      {isVisible ? (
        <Image
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...props}
        />
      ) : (
        <div className="bg-gray-200 animate-pulse" style={{ aspectRatio: '1/1' }} />
      )}
    </div>
  )
}
```

### 5.4 CDN Optimization

**Goal**: Minimize latency for global users

#### Multi-CDN Strategy

```typescript
// lib/images/cdn.ts
const CDN_CONFIG = {
  primary: {
    provider: 'cloudinary',
    baseUrl: 'https://res.cloudinary.com/vivr/',
    transformations: true,
  },
  fallback: {
    provider: 'vercel',  // Vercel Edge Network
    baseUrl: '/_next/image',
  },
  regions: {
    eu: 'cloudinary',
    us: 'cloudinary',
    asia: 'cloudinary',  // Consider regional CDN for expansion
  }
}

// Implement health checks and automatic failover
async function getImageUrl(publicId: string, options: TransformOptions): Promise<string> {
  const primaryUrl = buildCloudinaryUrl(publicId, options)

  // Optional: Implement CDN health check
  // If primary fails, fallback to origin

  return primaryUrl
}
```

#### Caching Strategy

```typescript
// Headers configuration for CDN caching
const imageCacheHeaders = {
  // Browser cache
  'Cache-Control': 'public, max-age=31536000, immutable',

  // CDN cache
  'CDN-Cache-Control': 'public, max-age=31536000',

  // Stale-while-revalidate for updates
  'stale-while-revalidate': '86400',
}
```

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           VIVR Vision AI Platform                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Frontend   │  │   Backend    │  │   Workers    │              │
│  │  (Next.js)   │  │  (API Routes)│  │  (Queues)    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                        │
│         └────────┬────────┴────────┬────────┘                        │
│                  │                 │                                  │
│         ┌────────▼────────┐ ┌──────▼──────┐                         │
│         │  Vision APIs    │ │  PostgreSQL │                         │
│         │  (GPT-4V, CLIP) │ │  (pgvector) │                         │
│         └─────────────────┘ └─────────────┘                         │
│                                                                      │
│         ┌─────────────────┐ ┌─────────────┐                         │
│         │   Cloudinary    │ │  S3/R2      │                         │
│         │   (Transform)   │ │  (Storage)  │                         │
│         └─────────────────┘ └─────────────┘                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Database Schema Extensions

```prisma
// prisma/schema.prisma additions

model Product {
  // ... existing fields

  // Visual AI fields
  embedding           Float[]       // Vector embedding for similarity search
  dominantColor       String?       // Primary color hex
  colorPalette        Json?         // Array of colors
  styleVector         Json?         // Style classification scores
  autoTags            Json?         // AI-generated tags
  trendScore          Float?        @default(0)

  // 3D/AR fields
  model3dUrl          String?       // GLB/GLTF URL
  modelUsdzUrl        String?       // iOS AR URL

  // Optimized images
  thumbnails          Json?         // Pre-generated thumbnail URLs
  blurHash            String?       // BlurHash for placeholder

  // Indexes for vector search
  @@index([dominantColor])
}

model VisualSearchLog {
  id          String   @id @default(cuid())
  userId      String?
  imageHash   String   // Hash of uploaded image
  results     Json     // Returned product IDs
  clicked     String?  // Product ID clicked
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}

model StylePreference {
  id          String   @id @default(cuid())
  userId      String
  styleVector Json     // Learned style preferences
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])

  @@unique([userId])
}
```

### API Structure

```
app/api/
├── vision/
│   ├── search/route.ts          # Visual search endpoint
│   ├── similar/[productId]/route.ts  # Find similar
│   ├── analyze/route.ts         # Image analysis
│   └── ar/
│       ├── generate-model/route.ts  # 3D model generation
│       └── room-placement/route.ts  # Room visualization
├── images/
│   ├── upload/route.ts          # Image upload with processing
│   ├── optimize/route.ts        # On-demand optimization
│   └── thumbnails/route.ts      # Thumbnail generation
└── recommendations/
    ├── style/route.ts           # Style-based recommendations
    ├── room/route.ts            # Room-based recommendations
    └── trending/route.ts        # Trending products
```

---

## Model Selection Guide

### Decision Matrix

| Use Case | Recommended Model | Alternative | Fallback |
|----------|------------------|-------------|----------|
| **Visual Search** | CLIP (OpenAI) | DINOv2 | Img2Vec |
| **Auto-Tagging** | GPT-4 Vision | Claude 3.5 Vision | LLaVA 1.6 |
| **Style Classification** | Fine-tuned CLIP | GPT-4V + Prompts | Custom CNN |
| **Color Extraction** | Vibrant.js | K-Means | OpenCV |
| **Background Removal** | Rembg | SAM | Remove.bg |
| **Image Enhancement** | Real-ESRGAN | Topaz API | Cloudinary |
| **3D Generation** | TripoSR | Meshy.ai | Manual Modeling |
| **Depth Estimation** | Depth Anything | MiDaS | ZoeDepth |

### Model Hosting Options

```typescript
// lib/vision/modelConfig.ts
export const MODEL_CONFIG = {
  // Cloud APIs (pay per use)
  cloud: {
    visualSearch: 'openai/clip',
    tagging: 'openai/gpt-4-vision',
    backgroundRemoval: 'replicate/rembg',
  },

  // Self-hosted (fixed cost)
  selfHosted: {
    visualSearch: 'laion/CLIP-ViT-L-14',
    tagging: 'llava-hf/llava-1.6-34b',
    backgroundRemoval: 'danielgatis/rembg',
  },

  // Hybrid (balance)
  hybrid: {
    visualSearch: 'cloud',      // Low volume, use API
    tagging: 'cloud',           // Occasional use
    backgroundRemoval: 'self',  // High volume, self-host
  }
}
```

---

## Cost Analysis & Optimization

### Monthly Cost Estimates (10,000 products, 50,000 users)

| Feature | API Costs | Infrastructure | Total/Month |
|---------|-----------|----------------|-------------|
| Visual Search | $50-100 | $0 (pgvector) | $50-100 |
| Auto-Tagging | $100-300 | $0 | $100-300 |
| Background Removal | $200-400 | $0 | $200-400 |
| Image Hosting | $0 | $50-100 (Cloudinary) | $50-100 |
| AR/3D Models | $0-500 | $50-100 (Storage) | $50-600 |
| **TOTAL** | $350-1300 | $100-200 | **$450-1500** |

### Cost Optimization Strategies

1. **Batch Processing**: Process images during off-peak hours
2. **Caching**: Cache embeddings and analysis results
3. **Tiered Models**: Use cheaper models for low-stakes tasks
4. **Self-Hosting**: Host open-source models for high-volume features
5. **Lazy Processing**: Generate thumbnails and analysis on-demand

```typescript
// lib/vision/costOptimizer.ts
const COST_TIERS = {
  cheap: ['vibrant.js', 'rembg-local', 'clip-local'],
  moderate: ['gpt-3.5-vision', 'replicate-rembg'],
  expensive: ['gpt-4-vision', 'claude-3-opus'],
}

function selectModel(task: string, budget: 'low' | 'medium' | 'high') {
  const taskModels = MODEL_MAPPING[task]
  return taskModels[budget] || taskModels.default
}
```

---

## Implementation Timeline

### Phase 1: Foundation (Months 1-2)

**Week 1-2: Infrastructure Setup**
- [ ] Set up pgvector extension in PostgreSQL
- [ ] Configure Cloudinary for image optimization
- [ ] Create base Vision API structure

**Week 3-4: Visual Search MVP**
- [ ] Implement CLIP embedding generation
- [ ] Create visual search API endpoint
- [ ] Build search UI component

**Week 5-6: Auto-Tagging**
- [ ] Implement GPT-4 Vision tagging pipeline
- [ ] Process existing product catalog
- [ ] Update search with tag filters

**Week 7-8: Color Search**
- [ ] Implement color extraction
- [ ] Add color-based filtering UI
- [ ] Create color palette displays

### Phase 2: Enhancement (Months 3-4)

**Week 9-10: Background Removal**
- [ ] Integrate Rembg or Remove.bg
- [ ] Create admin tool for image editing
- [ ] Batch process existing images

**Week 11-12: Image Optimization**
- [ ] Implement responsive image pipeline
- [ ] Add WebP/AVIF support
- [ ] Set up CDN caching

**Week 13-14: Similar Products**
- [ ] Build similarity recommendation engine
- [ ] Add "Find Similar" buttons
- [ ] Implement style matching

**Week 15-16: Testing & Refinement**
- [ ] Performance optimization
- [ ] A/B testing visual search
- [ ] User feedback collection

### Phase 3: AR/VR (Months 5-6)

**Week 17-18: 3D Model Pipeline**
- [ ] Research 3D generation options
- [ ] Create pilot with 10-20 products
- [ ] Set up GLB hosting

**Week 19-20: model-viewer Integration**
- [ ] Implement AR component
- [ ] Add to product pages
- [ ] iOS/Android testing

**Week 21-22: Room Visualization**
- [ ] Implement depth estimation
- [ ] Build room upload feature
- [ ] Create composite rendering

**Week 23-24: Virtual Showroom**
- [ ] Design virtual space
- [ ] Implement Three.js showroom
- [ ] Add product interactions

### Phase 4: Intelligence (Months 7-8)

**Week 25-26: Style Recommendations**
- [ ] Build style classification model
- [ ] Implement "Complete the Look"
- [ ] Add style quiz for users

**Week 27-28: Room-Based Suggestions**
- [ ] Create room context engine
- [ ] Implement room compatibility
- [ ] Add "Shop by Room" feature

**Week 29-30: Trend Detection**
- [ ] Set up trend data collection
- [ ] Implement trend scoring
- [ ] Create "Trending" section

**Week 31-32: Personalization**
- [ ] Build user style profiles
- [ ] Implement personalized recommendations
- [ ] A/B test recommendation quality

---

## Success Metrics

### KPIs to Track

| Metric | Current | Target (6mo) | Target (12mo) |
|--------|---------|--------------|---------------|
| Visual Search Usage | 0% | 10% of users | 25% of users |
| Search-to-Cart Rate | 3% | 5% | 8% |
| AR Feature Usage | 0% | 5% of product views | 15% |
| Recommendation Click Rate | 2% | 5% | 10% |
| Image Load Time (LCP) | ~2.5s | <1.5s | <1.0s |
| Bounce Rate (Products) | 45% | 35% | 25% |

### Tracking Implementation

```typescript
// lib/analytics/visionMetrics.ts
import { analytics } from '@/lib/analytics'

export const trackVisionEvent = (event: VisionEvent) => {
  analytics.track({
    event: event.type,
    properties: {
      feature: event.feature,  // 'visual_search', 'ar_preview', etc.
      productId: event.productId,
      userId: event.userId,
      resultCount: event.resultCount,
      clickedIndex: event.clickedIndex,
      duration: event.duration,
    }
  })
}
```

---

## Quick Start Implementation

### Immediate Actions (This Week)

1. **Install pgvector**: Enable vector similarity search

```bash
# In PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

# In Prisma migration
npx prisma migrate dev --name add_pgvector
```

2. **Add Cloudinary transformations**: Update image URLs

```javascript
// next.config.js
images: {
  loader: 'cloudinary',
  path: 'https://res.cloudinary.com/vivr/',
}
```

3. **Create Visual Search API skeleton**:

```typescript
// app/api/vision/search/route.ts
export async function POST(request: Request) {
  const { image } = await request.json()

  // TODO: Implement CLIP embedding
  // TODO: Query pgvector for similar products

  return Response.json({ products: [], similarity: [] })
}
```

---

## Conclusion

This Vision AI roadmap positions VIVR as a leader in the French home decoration e-commerce space. By implementing visual search, AR previews, and intelligent recommendations, VIVR can significantly differentiate from competitors while improving conversion rates and customer satisfaction.

**Priority Recommendations**:
1. Start with Visual Search (highest ROI)
2. Implement Image Optimization (quick wins)
3. Add AR for flagship products (differentiation)
4. Build recommendation engine (long-term value)

The modular architecture allows incremental implementation while maintaining a clear path to a fully integrated Vision AI platform.
