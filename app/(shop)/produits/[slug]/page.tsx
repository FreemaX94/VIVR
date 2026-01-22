import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Product, Category, Review } from '@/types'
import { ProductPageClient } from './ProductPageClient'
import { getProductSchema, getBreadcrumbSchema, JsonLd } from '@/lib/schema'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vivr.fr'

// Mock data for development - will be replaced with API/DB calls
const mockCategory: Category = { id: '1', name: 'Salon', slug: 'salon' }

const mockProduct: Product = {
  id: '1',
  name: 'Lampe de table Nordique',
  slug: 'lampe-table-nordique',
  description: `Illuminez votre intérieur avec cette lampe de table au design scandinave épuré. Fabriquée en bois de chêne naturel et métal noir mat, elle apporte une touche de chaleur et d'élégance à n'importe quelle pièce.

Caractéristiques :
• Hauteur : 45 cm
• Diamètre abat-jour : 25 cm
• Matériaux : Bois de chêne, métal, tissu
• Ampoule : E27 (non incluse)
• Câble : 1.8m avec interrupteur

Parfaite pour votre salon, bureau ou chambre à coucher.`,
  price: 89.99,
  comparePrice: 129.99,
  images: [
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800',
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800',
    'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800',
  ],
  category: mockCategory,
  categoryId: '1',
  stock: 15,
  featured: true,
  reviews: [
    {
      id: '1',
      userId: '1',
      user: { id: '1', name: 'Marie L.', email: '' },
      productId: '1',
      rating: 5,
      title: 'Magnifique !',
      comment: 'Cette lampe est exactement ce que je cherchais. La qualité est au rendez-vous.',
      verified: true,
      createdAt: new Date('2024-01-15'),
    } as Review,
    {
      id: '2',
      userId: '2',
      user: { id: '2', name: 'Pierre M.', email: '' },
      productId: '1',
      rating: 4,
      comment: 'Très belle lampe, bien emballée. Seul bémol : la livraison un peu longue.',
      verified: true,
      createdAt: new Date('2024-01-10'),
    } as Review,
  ],
  createdAt: new Date(),
}

const mockRelatedProducts: Product[] = [
  {
    id: '2',
    name: 'Vase céramique minimal',
    slug: 'vase-ceramique-minimal',
    description: '',
    price: 45.00,
    images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600'],
    category: mockCategory,
    categoryId: '1',
    stock: 25,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Coussin lin naturel',
    slug: 'coussin-lin-naturel',
    description: '',
    price: 35.00,
    images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600'],
    category: mockCategory,
    categoryId: '1',
    stock: 50,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Miroir rond doré',
    slug: 'miroir-rond-dore',
    description: '',
    price: 159.00,
    images: ['https://images.unsplash.com/photo-1618220179428-22790b461013?w=600'],
    category: mockCategory,
    categoryId: '1',
    stock: 8,
    featured: true,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Table basse scandinave',
    slug: 'table-basse-scandinave',
    description: '',
    price: 249.00,
    images: ['https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=600'],
    category: mockCategory,
    categoryId: '1',
    stock: 12,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  },
]

// Fetch product data (mock for now)
async function getProduct(slug: string): Promise<Product | null> {
  // TODO: Replace with actual API/DB call
  // const product = await prisma.product.findUnique({ where: { slug } })
  if (slug === mockProduct.slug) {
    return mockProduct
  }
  return null
}

async function getRelatedProducts(categoryId: string, excludeId: string): Promise<Product[]> {
  // TODO: Replace with actual API/DB call
  return mockRelatedProducts.filter(p => p.id !== excludeId)
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: 'Produit non trouvé',
    }
  }

  const description = product.description.slice(0, 160).replace(/\n/g, ' ')

  return {
    title: product.name,
    description,
    keywords: [
      product.name,
      product.category.name,
      'décoration',
      'intérieur',
      'VIVR',
    ],
    openGraph: {
      title: `${product.name} | VIVR`,
      description,
      url: `${BASE_URL}/produits/${product.slug}`,
      siteName: 'VIVR',
      images: product.images.map((image) => ({
        url: image,
        width: 800,
        height: 800,
        alt: product.name,
      })),
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | VIVR`,
      description,
      images: [product.images[0]],
    },
    alternates: {
      canonical: `${BASE_URL}/produits/${product.slug}`,
    },
  }
}

interface Props {
  params: { slug: string }
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id)

  // Breadcrumb schema data
  const breadcrumbData = getBreadcrumbSchema([
    { name: 'Accueil', url: BASE_URL },
    { name: 'Produits', url: `${BASE_URL}/produits` },
    { name: product.category.name, url: `${BASE_URL}/categories/${product.category.slug}` },
    { name: product.name, url: `${BASE_URL}/produits/${product.slug}` },
  ])

  // Product schema data
  const productSchema = getProductSchema(product)

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={productSchema} />
      <ProductPageClient product={product} relatedProducts={relatedProducts} />
    </>
  )
}
