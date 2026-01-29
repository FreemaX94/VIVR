import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Product } from '@/types'
import { ProductPageClient } from './ProductPageClient'
import { getProductSchema, getBreadcrumbSchema, JsonLd } from '@/lib/schema'
import prisma from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vivr.fr'

async function getProduct(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!product) return null

  return {
    ...product,
    images: JSON.parse(product.images),
    category: product.category || { id: '', name: 'Sans catégorie', slug: 'sans-categorie' },
    reviews: product.reviews.map((r) => ({
      ...r,
      user: r.user || { id: '', name: 'Anonyme', email: '' },
    })),
  } as Product
}

async function getRelatedProducts(categoryId: string | null, excludeId: string): Promise<Product[]> {
  if (!categoryId) return []

  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: excludeId },
    },
    take: 4,
    include: {
      category: true,
      reviews: true,
    },
  })

  return products.map((p) => ({
    ...p,
    images: JSON.parse(p.images),
    category: p.category || { id: '', name: 'Sans catégorie', slug: 'sans-categorie' },
  })) as Product[]
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
