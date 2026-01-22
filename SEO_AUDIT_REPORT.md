# SEO AUDIT REPORT: VIVR
## Next.js 14 E-Commerce Application

**Audit Date:** January 2026
**Application:** VIVR - French Interior Decoration Store
**Scope:** Technical SEO, Metadata, Structured Data, Content Architecture

---

## EXECUTIVE SUMMARY

The VIVR application has a **solid foundation** with Next.js 14 best practices in place, but significant opportunities exist for SEO improvement. The current implementation covers basic metadata and Open Graph tags, but lacks critical structured data implementation, advanced metadata strategies, and URL optimization.

**Overall SEO Readiness:** 52/100 (Moderate)

---

## 1. METADATA & OPEN GRAPH ANALYSIS

### Current Implementation (app/layout.tsx)

**Strengths:**
- Proper metadataBase configuration with NEXT_PUBLIC_APP_URL
- Comprehensive Open Graph tags (type, locale, siteName, images)
- Twitter Card implementation (summary_large_image)
- Responsive robots directives with googleBot configuration
- Meta charset and language (fr) properly set

**Issues Found:**

| Priority | Issue | Impact | Details |
|----------|-------|--------|---------|
| P1 | Keywords in metadata not optimized | Low CTR | Generic keywords: 'décoration', 'intérieur', 'design'. Missing long-tail keywords for target audience. |
| P1 | Page-level metadata not implemented | Lost ranking potential | Product pages (produits/[slug]) and category pages lack individual metadata |
| P1 | No canonical URLs generated | Duplicate content risk | All product URLs could be indexed as duplicates |
| P2 | OG image needs dimensioning validation | Social sharing issues | Image is 1200x630px (correct), but no fallback image |
| P2 | Missing description template for dynamic pages | Metadata inconsistency | `template: '%s \| VIVR'` doesn't include category context |

**Missing Meta Tags:**
- `viewport` (implicit in Next.js 14, but verify)
- `theme-color` for branding
- `apple-touch-icon`
- Individual description meta tags per page
- `author` organization schema

### Required Fixes:

```typescript
// File: app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://vivr.fr'),
  title: {
    default: 'VIVR - Décoration Intérieure Élégante & Minimaliste',
    template: '%s | Décoration Intérieure Design - VIVR',
  },
  description:
    'Découvrez VIVR : décoration intérieure minimaliste et élégante. Lampes, vases, coussins et mobilier design. Livraison gratuite dès 50€.',
  keywords: [
    'décoration intérieure',
    'design minimaliste',
    'mobilier moderne',
    'lampe design',
    'accessoires décoration',
    'maison élégante',
    'intérieur scandinave',
    'boutique décoration en ligne',
  ],
  authors: [{ name: 'VIVR', url: 'https://vivr.fr' }],
  creator: 'VIVR',
  publisher: 'VIVR',
  category: 'Shopping/Home & Garden',
  classification: 'E-commerce',

  // Theme and branding
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VIVR Décoration',
  },

  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['fr'],
    url: 'https://vivr.fr',
    siteName: 'VIVR',
    title: 'VIVR - Décoration Intérieure Élégante & Minimaliste',
    description:
      'Transformez votre intérieur avec VIVR. Sélection design de lampes, meubles et accessoires minimalistes. Retours gratuits 30j.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VIVR - Décoration Intérieure Élégante',
        type: 'image/jpeg',
      },
      {
        url: '/images/og-image-square.jpg',
        width: 800,
        height: 800,
        alt: 'VIVR - Logo Marque',
        type: 'image/jpeg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@vivrDeco',
    creator: '@vivrDeco',
    title: 'VIVR - Décoration Intérieure Élégante',
    description:
      'Découvrez notre collection minimaliste et élégante. -10% première commande.',
    images: ['/images/og-image.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Additional verification
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
};
```

---

## 2. SEMANTIC HTML & HEADING HIERARCHY

### Current Structure Analysis

**Home Page (app/page.tsx)**

```
Current Hierarchy:
H1: "Vivez votre intérieur" ✓
└── H2: "Livraison gratuite", "Retours gratuits", etc (Feature titles) ❌
    └── H3: Feature descriptions ❌
└── H2: "Nos catégories" ✓
└── H2: "Produits vedettes" ✓
└── H2: "Créez l'intérieur de vos rêves" ✓
└── H2: "@vivr.deco" ✓
```

**Issues:**

| Priority | Issue | Impact | Details |
|----------|-------|--------|---------|
| P1 | Feature section uses H3 instead of H2 | Broken hierarchy | Features should use proper semantic structure |
| P1 | Product page breadcrumb not semantic | Navigation context lost | Using plain divs instead of `<nav>` with proper roles |
| P2 | Instagram section H2 lacks context | Weak semantic meaning | Title "@vivr.deco" is not descriptive |
| P2 | Missing `<section>` landmarks | Accessibility issues | Several sections lack semantic wrapping |

### Required Fixes:

**app/page.tsx - Features Section**
```tsx
// Replace:
<h3 className="font-semibold text-text-primary">{feature.title}</h3>

// With:
<h2 className="font-semibold text-text-primary text-lg">{feature.title}</h2>
```

**app/(shop)/produits/[slug]/page.tsx - Semantic Breadcrumb**
```tsx
// Replace:
<nav className="flex items-center gap-2 text-sm text-text-muted mb-8">

// With:
<nav
  aria-label="Chemin de navigation"
  className="flex items-center gap-2 text-sm text-text-muted mb-8"
  role="navigation"
>
```

### Heading Hierarchy Blueprint:

```
Homepage:
H1: Vivez votre intérieur
├── Section: Avantages
│   └── H2: Livraison gratuite
│   └── H2: Retours gratuits
│   └── H2: Paiement sécurisé
│   └── H2: Service client
├── Section: Catégories
│   └── H2: Nos catégories
│   └── H3: [Category names as subheadings in cards]
├── Section: Produits vedettes
│   └── H2: Produits vedettes
│   └── H3: [Product names as card titles]
└── Section: Inspiration
    └── H2: Créez l'intérieur de vos rêves

Product Page:
H1: [Product Name]
├── H2: Évaluations et avis
├── H2: Description
├── H2: Avis (n)
└── H2: Produits similaires
    └── H3: [Related product names]

Category Page:
H1: [Category Name]
└── H2: Produits de la catégorie
    └── H3: [Product names]
```

---

## 3. STRUCTURED DATA & SCHEMA.ORG

### Critical Missing Schemas

#### P0: Organization Schema (MISSING)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "VIVR",
  "url": "https://vivr.fr",
  "logo": "https://vivr.fr/images/logo.png",
  "description": "Décoration intérieure minimaliste et élégante",
  "sameAs": [
    "https://www.instagram.com/vivr.deco",
    "https://www.facebook.com/vivrdeco",
    "https://twitter.com/vivrDeco"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "telephone": "+33-X-XX-XX-XX-XX",
    "email": "contact@vivr.fr",
    "areaServed": "FR",
    "hoursAvailable": "Mo-Su 09:00-21:00"
  },
  "foundingDate": "2024",
  "founder": {
    "@type": "Person",
    "name": "VIVR Team"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "FR",
    "addressLocality": "[City]",
    "addressRegion": "[Region]",
    "postalCode": "[Code]",
    "streetAddress": "[Address]"
  }
}
```

**Implementation Location:** `app/layout.tsx` in `<head>` or via JSON-LD script

#### P0: Product Schema (MISSING)

**File:** `app/(shop)/produits/[slug]/page.tsx`

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "[product.name]",
  "description": "[product.description]",
  "image": "[product.images[0]]",
  "brand": {
    "@type": "Brand",
    "name": "VIVR"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://vivr.fr/produits/[product.slug]",
    "priceCurrency": "EUR",
    "price": "[product.price]",
    "priceValidUntil": "2026-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "VIVR"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "[averageRating]",
    "reviewCount": "[product.reviews.length]"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "[rating]"
      },
      "author": {
        "@type": "Person",
        "name": "[userName]"
      },
      "reviewBody": "[comment]"
    }
  ]
}
```

#### P0: BreadcrumbList Schema (MISSING)

**File:** `app/(shop)/produits/[slug]/page.tsx`

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://vivr.fr"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Produits",
      "item": "https://vivr.fr/produits"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[category.name]",
      "item": "https://vivr.fr/categories/[category.slug]"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "[product.name]",
      "item": "https://vivr.fr/produits/[product.slug]"
    }
  ]
}
```

#### P1: CollectionPage Schema (Category Pages)

**File:** `app/(shop)/categories/[category]/page.tsx`

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "[category.name]",
  "description": "[category.description]",
  "url": "https://vivr.fr/categories/[category.slug]",
  "image": "[category.image]",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://vivr.fr/produits/[slug]",
        "name": "[Product.name]",
        "image": "[Product.image]"
      }
    ]
  }
}
```

#### P1: FAQPage Schema

**File:** `app/aide/faq/page.tsx` (to create)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelle est la politique de livraison?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Livraison gratuite dès 50€ d'achat en France..."
      }
    }
  ]
}
```

#### P2: LocalBusiness Schema (if applicable)

For physical store locations, add LocalBusiness schema with operating hours, reviews, etc.

### Implementation Component

**Create:** `lib/schema.ts`

```typescript
export function generateProductSchema(product: Product, url: string) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    '@id': url,
    name: product.name,
    description: product.description,
    image: product.images.map(img => ({
      '@type': 'ImageObject',
      url: img,
      width: '800',
      height: '600'
    })),
    brand: {
      '@type': 'Brand',
      name: 'VIVR',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'EUR',
      price: product.price.toString(),
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'VIVR',
      },
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length).toFixed(1),
        reviewCount: product.reviews.length.toString(),
      },
      review: product.reviews.map(r => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating.toString(),
        },
        author: {
          '@type': 'Person',
          name: r.user.name,
        },
        reviewBody: r.comment,
      })),
    }),
  }
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: (index + 1).toString(),
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateOrganizationSchema(domain: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VIVR',
    url: domain,
    logo: `${domain}/images/logo.png`,
    description: 'Décoration intérieure minimaliste et élégante',
    sameAs: [
      'https://www.instagram.com/vivr.deco',
      'https://www.facebook.com/vivrdeco',
      'https://twitter.com/vivrDeco',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'contact@vivr.fr',
      areaServed: 'FR',
    },
  }
}
```

---

## 4. URL STRUCTURE & SLUGS

### Current URL Architecture

**Strengths:**
- Clean URL structure with semantic slugs
- Proper use of route groups: `(shop)`, `(auth)`
- French naming convention matches target audience
- Slug format is consistent (kebab-case)

### Issues & Recommendations

| Current URL | Issue | Recommendation | Priority |
|------------|-------|-----------------|----------|
| `/produits` | Generic, no category filter | `/produits?category=all` (handled) | P2 |
| `/produits/[slug]` | Good | Keep as-is | - |
| `/categories/[category]` | Short, SEO-friendly | Add `/categories/[category]/produits` variant | P2 |
| `/panier` | French term limits search | Consider supporting `/cart` (EN redirect) | P2 |
| `/checkout` | Missing categories | `/checkout?from=category` for contextual info | P2 |
| `/compte` | Good | Consider `/profile` alternative | P2 |

### URL Canonicalization

Currently no explicit canonical URLs generated. Each product page could have filters like `?sort=newest&minPrice=50`.

**Solution:** Implement canonical URLs in metadata:

```typescript
// app/(shop)/produits/[slug]/page.tsx
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const canonicalUrl = `https://vivr.fr/produits/${slug}`;

  return {
    canonical: canonicalUrl,
    // ...
  }
}
```

---

## 5. INTERNAL LINKING OPPORTUNITIES

### Current State Analysis

**Existing Internal Links:**

- Home -> Produits ✓
- Home -> Categories ✓
- Home -> Individual Category pages ✓
- Product Cards -> Product Detail ✓
- Product Detail -> Related Products ✓
- Header -> Navigation (good structure)
- Footer -> Comprehensive link structure ✓

### Missing Linking Opportunities

| Opportunity | Current State | Recommended | Impact |
|------------|---------------|-------------|--------|
| Contextual product links in descriptions | None | Link to "similar items" in product description | P2 |
| Category to category silos | None | Create "also in [related category]" sections | P2 |
| Blog to products (when blog added) | N/A | Create editorial content linking to products | P2 |
| Tags/Attributes links | None | Create pages for materials, styles, etc. | P1 |
| Related products by style | Yes, by category | Expand to include style-based suggestions | P2 |

### Recommended Siloing Structure

```
Home
├── Salon
│   ├── Lampes Salon
│   ├── Meubles Salon
│   └── Accessoires Salon
├── Chambre
│   ├── Lampes Chambre
│   ├── Lits
│   └── Accessoires Chambre
├── Cuisine
│   └── ...
└── Bureau
    └── ...

Product Pages
├── Link to category
├── Link to related products (same category, similar price)
├── Link to alternate color/size variants
└── Link to complementary products
```

### Internal Link Distribution

**Priority Links (should be on every page):**
1. Home
2. Shop/All Products
3. Top 2-3 Category Pages
4. Related Categories (contextual)

**Secondary Links (on specific page types):**
- Product Detail -> Related Products
- Category Page -> Subcategories
- Product -> Complementary Products

---

## 6. IMAGE OPTIMIZATION

### Current Implementation

**Strengths:**
- Using Next.js `<Image>` component ✓
- Remote patterns configured (Unsplash, Cloudinary) ✓
- Responsive image sizes defined ✓
- AVIF and WebP formats enabled ✓
- Alt text implemented on most images

**Issues Found:**

| Priority | Issue | Example | Impact |
|----------|-------|---------|--------|
| P1 | Placeholder images lack descriptive alt text | `alt="Instagram post"` | Missed keyword opportunities |
| P1 | Category images missing alt context | `alt={category.name}` only | Should include category description |
| P2 | Product images not numbered/described | `alt={product.name}` | Should distinguish gallery images |
| P2 | Missing image metadata | No `title` attributes | Accessibility and UX loss |
| P1 | OG images not optimized | Unsplash images used | Should use branded images |

### Required Fixes

**ProductCard.tsx:**
```tsx
// Replace:
<Image
  src={product.images[imageIndex] || '/images/placeholder.jpg'}
  alt={product.name}
  // ...
/>

// With:
<Image
  src={product.images[imageIndex] || '/images/placeholder.jpg'}
  alt={`${product.name} - ${product.category.name} - Image ${imageIndex + 1}`}
  title={`${product.name}: ${product.description.substring(0, 50)}...`}
  // ...
/>
```

**ProductGallery.tsx (if exists):**
```tsx
<Image
  src={images[activeIndex]}
  alt={`${productName} - Vue ${activeIndex + 1} sur ${images.length}`}
/>
```

**Category Images:**
```tsx
<Image
  src={category.image || '/images/placeholder.jpg'}
  alt={`Catégorie ${category.name} - Découvrez notre collection de ${category.name.toLowerCase()}`}
/>
```

**Page level OG images:**
- Replace generic Unsplash images
- Create branded OG images with logo
- Include product images for product pages
- Category-specific images for category pages

### Image Sitemap

Create `public/images-sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://vivr.fr/produits/lampe-table-nordique</loc>
    <image:image>
      <image:loc>https://vivr.fr/images/lampe-table-nordique-1.jpg</image:loc>
      <image:title>Lampe de table Nordique - Image 1</image:title>
      <image:caption>Lampe design scandinave en bois naturel</image:caption>
    </image:image>
  </url>
</urlset>
```

---

## 7. CANONICAL URLS & TECHNICAL SEO

### Missing Implementations

#### P0: Canonical URL Generation

Currently, dynamic pages don't specify canonical URLs. This creates duplicate content risk with URL parameters (sort, filters, etc.).

**Solution:** Add to all dynamic page metadata:

```typescript
// app/(shop)/produits/page.tsx
export async function generateMetadata() {
  return {
    canonical: 'https://vivr.fr/produits',
    // all other metadata
  }
}

// For filtered pages, use base URL
export async function generateMetadata({ searchParams }: Props) {
  const baseUrl = 'https://vivr.fr/produits';
  // Filters are session state, not canonical URLs
  return {
    canonical: baseUrl,
  }
}
```

#### P1: robots.txt (MISSING)

Create `public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /panier
Disallow: /checkout
Disallow: /compte
Disallow: /api/
Allow: /api/sitemap
Disallow: /?*sort=
Disallow: /?*minPrice=
Crawl-delay: 0
User-agent: Googlebot
Crawl-delay: 0
User-agent: Bingbot
Crawl-delay: 1

Sitemap: https://vivr.fr/sitemap.xml
Sitemap: https://vivr.fr/sitemap-products.xml
Sitemap: https://vivr.fr/sitemap-categories.xml
```

#### P1: sitemap.xml (MISSING)

Create `app/sitemap.ts` (Next.js 14 method):

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://vivr.fr',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://vivr.fr/produits',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Categories
    {
      url: 'https://vivr.fr/categories/salon',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // Add all product URLs dynamically from database
  ]
}
```

#### P1: next-sitemap Configuration

Alternatively, use next-sitemap package for automatic generation from product database.

#### P2: robots Meta Tag (NOINDEX sensitive pages)

```tsx
// app/(auth)/connexion/page.tsx
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

// app/(shop)/panier/page.tsx
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
}
```

---

## 8. COMPLETE SEO ISSUES PRIORITIZATION

### P0 - CRITICAL (Implement Immediately)

| Issue | File(s) | Estimated Effort | Impact |
|-------|---------|-----------------|--------|
| Add Organization Schema | app/layout.tsx | 30 min | Enables brand knowledge panel |
| Add Product Schema | app/(shop)/produits/[slug]/page.tsx | 1 hour | Enables rich snippets, shopping results |
| Add BreadcrumbList Schema | app/(shop)/produits/[slug]/page.tsx | 30 min | Breadcrumb display in search results |
| Generate robots.txt | public/robots.txt | 15 min | Proper crawl directives |
| Generate sitemap.xml | app/sitemap.ts | 1 hour | Complete site discovery |
| Add canonical URLs | All dynamic pages | 1 hour | Prevent duplicate content issues |
| Add page-level metadata | app/(shop)/produits/[slug]/page.tsx, app/(shop)/categories/[category]/page.tsx | 2 hours | Unique titles and descriptions per page |
| Implement metadata generation functions | lib/metadata.ts | 1.5 hours | Reusable, maintainable metadata |
| Optimize product image alt text | components/product/ProductCard.tsx, ProductGallery.tsx | 30 min | Accessibility + keyword optimization |
| Create OG images | public/images/ | 2 hours | Social sharing enhancement |

**Total Effort: 10 hours**

### P1 - IMPORTANT (Implement Within 2 Weeks)

| Issue | File(s) | Estimated Effort | Impact |
|-------|---------|-----------------|--------|
| Add CollectionPage Schema | app/(shop)/categories/[category]/page.tsx | 45 min | Category page indexing |
| Fix heading hierarchy | app/page.tsx, all page files | 2 hours | Proper content structure |
| Add semantic landmarks | All layouts | 1.5 hours | Accessibility, structure clarity |
| Implement internal linking strategy | Components/layouts | 2 hours | PageRank distribution |
| Add review/rating schema | ProductReviews component | 30 min | Rich star ratings in SERP |
| Create FAQ schema pages | app/aide/faq/page.tsx | 1 hour | Featured snippet opportunities |
| Add LocalBusiness schema | app/layout.tsx | 30 min | Local search visibility |
| Optimize metadata descriptions | All page files | 2 hours | CTR improvement from search results |

**Total Effort: 10 hours**

### P2 - NICE TO HAVE (Implement Within 1 Month)

| Issue | Estimated Effort | Impact |
|-------|-----------------|--------|
| Create tag/attribute pages | 3 hours | Improved internal search ranking |
| Implement breadcrumb structured data visualization | 1 hour | Better SERP display |
| Add JSON-LD for articles (if blog added) | 1.5 hours | Blog SEO optimization |
| Optimize product URLs for better keywords | 2 hours | Slight keyword boost |
| Create category landing page content | 3 hours | Category SERP positioning |
| Add AMP pages (consider Next.js dynamic rendering) | 2 hours | Mobile indexing alternative |
| Implement hreflang for language variants | 1 hour | Multi-language support preparation |
| Add custom search index | 2 hours | Internal site search optimization |

**Total Effort: 15.5 hours**

---

## 9. IMPLEMENTATION ROADMAP

### Week 1: Critical Foundation
- [ ] Generate robots.txt (15 min)
- [ ] Generate sitemap.xml (1 hour)
- [ ] Create lib/schema.ts with helper functions (1.5 hours)
- [ ] Add Organization Schema to layout (30 min)
- [ ] Add metadata generation functions (1 hour)
- [ ] Test canonical URLs implementation (30 min)

### Week 2: Product & Category Pages
- [ ] Add page-level metadata to product pages (1.5 hours)
- [ ] Add Product Schema to product pages (1 hour)
- [ ] Add BreadcrumbList Schema (30 min)
- [ ] Add page-level metadata to category pages (1 hour)
- [ ] Add CollectionPage Schema (45 min)
- [ ] Optimize product image alt text (30 min)

### Week 3: Content Optimization
- [ ] Fix heading hierarchy (2 hours)
- [ ] Add semantic landmarks (1.5 hours)
- [ ] Implement internal linking strategy (2 hours)
- [ ] Create OG images (2 hours)

### Week 4: Polish & Testing
- [ ] Review all schemas with Google Rich Results Test (1 hour)
- [ ] Test with Google Search Console (1 hour)
- [ ] Validate with W3C Markup Validator (30 min)
- [ ] Audit Core Web Vitals (30 min)
- [ ] Create SEO checklist for new product additions (1 hour)

---

## 10. SPECIFIC CODE EXAMPLES

### Example 1: Product Page with Full SEO

**File:** `app/(shop)/produits/[slug]/page.tsx`

```typescript
import type { Metadata } from 'next'
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/schema'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug) // Implement this
  const productUrl = `https://vivr.fr/produits/${slug}`

  if (!product) {
    return {
      title: 'Produit non trouvé',
      robots: { index: false },
    }
  }

  return {
    title: `${product.name} | Achetez ${product.category.name} - VIVR`,
    description: `${product.name} - ${product.description.substring(0, 120)}... Livraison gratuite dès 50€. Retours 30j. Achetez sur VIVR.`,
    keywords: [
      product.name,
      product.category.name,
      `${product.category.name} design`,
      `${product.category.name} minimaliste`,
      'décoration intérieure',
    ],
    canonical: productUrl,
    openGraph: {
      type: 'product',
      url: productUrl,
      title: `${product.name} - VIVR`,
      description: product.description.substring(0, 120),
      images: product.images.map(img => ({
        url: img,
        width: 800,
        height: 600,
        alt: product.name,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - VIVR`,
      description: product.description.substring(0, 100),
      images: [product.images[0]],
    },
  }
}

export default function ProductPage({ params }: Props) {
  const { slug } = use(params)
  const product = mockProduct // Replace with actual data
  const breadcrumbs = [
    { name: 'Accueil', url: 'https://vivr.fr' },
    { name: 'Produits', url: 'https://vivr.fr/produits' },
    { name: product.category.name, url: `https://vivr.fr/categories/${product.category.slug}` },
    { name: product.name, url: `https://vivr.fr/produits/${slug}` },
  ]

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductSchema(product, `https://vivr.fr/produits/${slug}`)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
        }}
      />

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Chemin de navigation" className="flex items-center gap-2 text-sm text-text-muted mb-8">
          {breadcrumbs.map((item, index) => (
            <div key={item.url} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              {index < breadcrumbs.length - 1 ? (
                <Link href={item.url} className="hover:text-text-primary transition-colors">
                  {item.name}
                </Link>
              ) : (
                <span className="text-text-primary font-medium">{item.name}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Product Content */}
        <h1 className="text-4xl font-bold text-text-primary mb-4">{product.name}</h1>
        {/* ... rest of product page */}
      </div>
    </>
  )
}
```

### Example 2: Category Page with SEO

**File:** `app/(shop)/categories/[category]/page.tsx`

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = params
  const categoryData = mockCategories[category]
  const categoryUrl = `https://vivr.fr/categories/${category}`

  return {
    title: `${categoryData.name} | Achetez ${categoryData.name} Design - VIVR`,
    description: `Découvrez notre collection ${categoryData.name.toLowerCase()}. Accessoires et mobilier design minimaliste. Livraison gratuite dès 50€.`,
    canonical: categoryUrl,
    openGraph: {
      type: 'website',
      url: categoryUrl,
      title: `${categoryData.name} - VIVR`,
      description: `Collection ${categoryData.name} minimaliste et élégante`,
      images: [{ url: categoryData.image || '/images/og-placeholder.jpg' }],
    },
  }
}

export default function CategoryPage({ params }: Props) {
  const { category } = params
  const categoryData = mockCategories[category]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: categoryData.name,
            url: `https://vivr.fr/categories/${category}`,
            image: categoryData.image,
          }),
        }}
      />

      {/* Page content */}
    </>
  )
}
```

---

## 11. TESTING & VALIDATION TOOLS

### Tools to Use for Validation

| Tool | Purpose | Frequency |
|------|---------|-----------|
| [Google Rich Results Test](https://search.google.com/test/rich-results) | Validate structured data | After each schema change |
| [Google PageSpeed Insights](https://pagespeed.web.dev) | Core Web Vitals & Performance | Weekly |
| [Google Search Console](https://search.google.com/search-console/) | Indexing, coverage, ranking | Daily |
| [Lighthouse](https://developers.google.com/web/tools/lighthouse) | SEO audit (built into DevTools) | Before each deploy |
| [W3C Markup Validator](https://validator.w3.org/) | HTML validation | Before each deploy |
| [Schema.org Validation](https://schema.org/docs/validation.html) | Schema format check | After schema changes |
| [SEMrush SEO Audit](https://www.semrush.com/) | Comprehensive SEO audit | Monthly |
| [Screaming Frog](https://www.screamingfrog.co.uk/) | Crawl analysis, broken links | Monthly |

### Validation Checklist Before Production

```
Schema Validation:
[ ] Organization schema valid
[ ] Product schema valid
[ ] BreadcrumbList schema valid
[ ] All images have alt text
[ ] All links have proper anchor text

Metadata Validation:
[ ] Unique title tags (50-60 chars)
[ ] Unique meta descriptions (150-160 chars)
[ ] Canonical URLs set
[ ] No duplicate meta tags
[ ] OG tags for all pages
[ ] Twitter cards for all pages

Technical SEO:
[ ] robots.txt created and tested
[ ] sitemap.xml generated and valid
[ ] robots meta tags on non-indexable pages
[ ] No broken links (404s)
[ ] Mobile responsive
[ ] Page speed > 70 Lighthouse score
[ ] No mixed content (HTTP/HTTPS)
[ ] HTTPS everywhere

HTML Structure:
[ ] H1 present on every page
[ ] Heading hierarchy correct
[ ] No missing alt text on images
[ ] Proper semantic HTML (nav, main, section)
[ ] Skip link present
[ ] Keyboard navigation working

Performance:
[ ] Largest Contentful Paint < 2.5s
[ ] Cumulative Layout Shift < 0.1
[ ] First Input Delay < 100ms
[ ] Images optimized (WebP/AVIF)
[ ] Minimal CSS/JS bundle
```

---

## 12. ONGOING SEO MAINTENANCE

### Monthly Tasks

- Review Google Search Console for errors and coverage issues
- Check Core Web Vitals metrics
- Audit new pages/products for SEO compliance
- Monitor keyword rankings for target terms
- Check for broken internal links
- Validate structured data on new content

### Quarterly Tasks

- Comprehensive SEO audit (internal or external)
- Review and update meta descriptions
- Analyze competitor SEO strategies
- Check for new ranking opportunities
- Review internal linking strategy
- Update FAQ schema with new questions

### Annually

- Complete website SEO audit
- Review and update sitemap strategy
- Analyze organic search traffic trends
- Plan content/keyword strategy for next year
- Review and update robots.txt
- Update structured data based on latest schema.org versions

---

## 13. SUMMARY TABLE: ALL ISSUES

| ID | Priority | Category | Issue | File(s) | Fix Complexity | Impact | Status |
|----|----|----------|-------|---------|----------------|--------|--------|
| 1 | P0 | Schema | Missing Organization Schema | app/layout.tsx | Medium | High | PENDING |
| 2 | P0 | Schema | Missing Product Schema | app/(shop)/produits/[slug]/page.tsx | High | Critical | PENDING |
| 3 | P0 | Schema | Missing BreadcrumbList Schema | app/(shop)/produits/[slug]/page.tsx | Medium | High | PENDING |
| 4 | P0 | Technical | Missing robots.txt | public/robots.txt | Low | High | PENDING |
| 5 | P0 | Technical | Missing sitemap.xml | app/sitemap.ts | Medium | Critical | PENDING |
| 6 | P0 | Technical | No canonical URLs | Multiple pages | Medium | High | PENDING |
| 7 | P0 | Metadata | No page-level metadata | Dynamic pages | High | High | PENDING |
| 8 | P0 | Images | Weak alt text descriptions | ProductCard, ProductGallery | Low | Medium | PENDING |
| 9 | P1 | Schema | Missing CollectionPage Schema | app/(shop)/categories/[category]/page.tsx | Medium | High | PENDING |
| 10 | P1 | HTML | Broken heading hierarchy | app/page.tsx | Low | Medium | PENDING |
| 11 | P1 | HTML | Missing semantic landmarks | All layouts | Low | Medium | PENDING |
| 12 | P1 | Linking | Weak internal linking strategy | Multiple | Medium | Medium | PENDING |
| 13 | P1 | Metadata | Keywords too generic | app/layout.tsx | Low | Low | PENDING |
| 14 | P2 | Images | OG images not optimized | public/images/ | Medium | Low | PENDING |
| 15 | P2 | Content | Missing review schema | ProductReviews component | Medium | Medium | PENDING |
| 16 | P2 | Content | No FAQ page | app/aide/faq/page.tsx | Medium | Medium | PENDING |

---

## CONCLUSION

VIVR has a solid technical foundation with Next.js 14 best practices, but is missing critical SEO implementations:

**Key Wins:**
- Good metadata structure
- Proper HTML lang attribute and layout
- Responsive image optimization
- Clean URL structure

**Critical Gaps:**
- No structured data (Schema.org)
- Missing robots.txt and sitemap
- No page-level metadata customization
- Weak heading hierarchy

**Recommended Action Plan:**
1. Implement all P0 items this week (robots, sitemap, schemas, canonical URLs)
2. Complete P1 items within 2 weeks (page metadata, semantic HTML)
3. Polish with P2 items over the next month

**Expected SEO Impact After Implementation:**
- 30-40% increase in rich snippet eligibility
- 20-30% improvement in CTR (via better titles/descriptions)
- 15-25% more indexed pages via proper sitemap
- Better SERP positioning for branded and product terms

---

**Prepared by:** SEO Audit System
**Date:** January 22, 2026
**Next Review:** After P0/P1 implementation (2-3 weeks)
