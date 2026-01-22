import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Product, Category } from '@/types'
import { CategoryPageClient } from './CategoryPageClient'
import { getBreadcrumbSchema, getCollectionSchema, JsonLd } from '@/lib/schema'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vivr.fr'

// Mock categories data
const mockCategories: Record<string, Category> = {
  salon: { id: '1', name: 'Salon', slug: 'salon', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200' },
  chambre: { id: '2', name: 'Chambre', slug: 'chambre', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200' },
  cuisine: { id: '3', name: 'Cuisine', slug: 'cuisine', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200' },
  bureau: { id: '4', name: 'Bureau', slug: 'bureau', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200' },
  'salle-de-bain': { id: '5', name: 'Salle de bain', slug: 'salle-de-bain', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200' },
  exterieur: { id: '6', name: 'Extérieur', slug: 'exterieur', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200' },
}

// Valid Unsplash photo IDs for mock products
const mockProductImages = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
  'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600',
  'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600',
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600',
]

// Fetch category data
async function getCategory(slug: string): Promise<Category | null> {
  // TODO: Replace with actual API/DB call
  return mockCategories[slug] || null
}

// Fetch products for category
async function getCategoryProducts(categorySlug: string, category: Category): Promise<Product[]> {
  // TODO: Replace with actual API/DB call
  return Array.from({ length: 8 }, (_, i) => ({
    id: `${categorySlug}-${i + 1}`,
    name: `Produit ${category.name} ${i + 1}`,
    slug: `produit-${categorySlug}-${i + 1}`,
    description: `Découvrez ce magnifique produit de notre collection ${category.name}`,
    price: Math.floor(Math.random() * 200) + 20,
    comparePrice: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 200 : undefined,
    images: [mockProductImages[i]],
    category: category,
    categoryId: category.id,
    stock: Math.floor(Math.random() * 50),
    featured: Math.random() > 0.7,
    reviews: [],
    createdAt: new Date(),
  }))
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  const category = await getCategory(params.category)

  if (!category) {
    return {
      title: 'Catégorie non trouvée',
    }
  }

  const title = `${category.name} - Décoration Intérieure`
  const description = `Découvrez notre collection ${category.name} : mobilier, accessoires et décoration pour votre intérieur. Livraison gratuite dès 50€.`

  return {
    title,
    description,
    keywords: [
      category.name,
      `décoration ${category.name.toLowerCase()}`,
      'mobilier',
      'décoration intérieure',
      'VIVR',
    ],
    openGraph: {
      title: `${title} | VIVR`,
      description,
      url: `${BASE_URL}/categories/${category.slug}`,
      siteName: 'VIVR',
      images: category.image ? [
        {
          url: category.image,
          width: 1200,
          height: 630,
          alt: `Collection ${category.name}`,
        },
      ] : [],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | VIVR`,
      description,
      images: category.image ? [category.image] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/categories/${category.slug}`,
    },
  }
}

interface Props {
  params: { category: string }
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory(params.category)

  if (!category) {
    notFound()
  }

  const products = await getCategoryProducts(params.category, category)

  // Breadcrumb schema
  const breadcrumbData = getBreadcrumbSchema([
    { name: 'Accueil', url: BASE_URL },
    { name: 'Produits', url: `${BASE_URL}/produits` },
    { name: category.name, url: `${BASE_URL}/categories/${category.slug}` },
  ])

  // Collection schema
  const collectionSchema = getCollectionSchema(
    `Collection ${category.name}`,
    `Découvrez notre sélection de produits ${category.name} pour la décoration intérieure`,
    `${BASE_URL}/categories/${category.slug}`,
    products.map(p => ({
      name: p.name,
      url: `${BASE_URL}/produits/${p.slug}`,
      image: p.images[0],
      price: p.price,
    }))
  )

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={collectionSchema} />
      <CategoryPageClient category={category} products={products} />
    </>
  )
}
