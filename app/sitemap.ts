import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vivr.fr'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/produits`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/nouveautes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/promotions`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/a-propos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Pages de catégories dynamiques
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    })
    categoryPages = categories.map((category) => ({
      url: `${BASE_URL}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // Si la DB n'est pas disponible, on continue sans les catégories
  }

  // Pages de produits dynamiques
  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    })
    productPages = products.map((product) => ({
      url: `${BASE_URL}/produits/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // Si la DB n'est pas disponible, on continue sans les produits
  }

  return [...staticPages, ...categoryPages, ...productPages]
}
