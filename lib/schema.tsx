import { Product } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vivr.fr'

// Schema Organization pour le site
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VIVR',
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    description: 'Boutique de décoration intérieure minimaliste et élégante',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'French',
    },
    sameAs: [
      'https://www.facebook.com/vivr.fr',
      'https://www.instagram.com/vivr.fr',
      'https://www.pinterest.fr/vivr_fr',
    ],
  }
}

// Schema WebSite pour la recherche
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VIVR',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/produits?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// Schema Product pour les pages produit
export function getProductSchema(product: Product) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'VIVR',
    },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/produits/${product.slug}`,
      priceCurrency: 'EUR',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'VIVR',
      },
    },
  }

  // Ajouter le prix barré si disponible
  if (product.comparePrice) {
    schema.offers = {
      ...(schema.offers as object),
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: product.price,
        priceCurrency: 'EUR',
      },
    }
  }

  return schema
}

// Schema BreadcrumbList pour la navigation
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Schema CollectionPage pour les pages de catégorie
export function getCollectionSchema(
  name: string,
  description: string,
  url: string,
  products: { name: string; url: string; image: string; price: number }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: product.url,
        name: product.name,
        image: product.image,
      })),
    },
  }
}

// Composant pour injecter le JSON-LD
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
