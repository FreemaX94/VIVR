# VIVR SEO IMPLEMENTATION CHECKLIST

**Quick Reference Guide for SEO Improvements**

---

## PHASE 1: CRITICAL (Week 1) - 10 Hours

### 1. Robots.txt
- [ ] Create `/public/robots.txt`
- [ ] Test with Google Search Console
- [ ] Verify disallow rules work correctly

```
# Copy from SEO_AUDIT_REPORT.md section 7
```

**Time:** 15 minutes
**File:** `public/robots.txt`

---

### 2. Sitemap.xml
- [ ] Create `app/sitemap.ts` using Next.js 14 method
- [ ] Include homepage, static pages, product routes, category routes
- [ ] Test XML validity
- [ ] Add to robots.txt
- [ ] Submit to Google Search Console

**Time:** 1 hour
**File:** `app/sitemap.ts`

---

### 3. Schema Library
- [ ] Create `lib/schema.ts` with helper functions
- [ ] Implement `generateProductSchema()`
- [ ] Implement `generateBreadcrumbSchema()`
- [ ] Implement `generateOrganizationSchema()`
- [ ] Test schema output

**Time:** 1.5 hours
**File:** `lib/schema.ts`

**Functions to Create:**
- `generateProductSchema(product, url)`
- `generateBreadcrumbSchema(items)`
- `generateOrganizationSchema(domain)`
- `generateCollectionPageSchema(category)`

---

### 4. Organization Schema
- [ ] Add to `app/layout.tsx` in `<head>`
- [ ] Update company contact info
- [ ] Add social media URLs
- [ ] Add business address (if applicable)
- [ ] Test with Rich Results Test

**Time:** 30 minutes
**File:** `app/layout.tsx`

**Location:** Add `<script type="application/ld+json">` with Organization schema

---

### 5. Canonical URLs
- [ ] Add canonical to `app/layout.tsx` (homepage)
- [ ] Add canonical to `app/(shop)/produits/page.tsx`
- [ ] Add canonical to `app/(shop)/categories/[category]/page.tsx`
- [ ] Add canonical to `app/(shop)/produits/[slug]/page.tsx`
- [ ] Test duplicates resolved in Search Console

**Time:** 1 hour
**Files:** Multiple page files

**Pattern:**
```typescript
export async function generateMetadata() {
  return {
    canonical: 'https://vivr.fr/path',
  }
}
```

---

### 6. Product Page Metadata
- [ ] Add dynamic `generateMetadata()` to product pages
- [ ] Implement product-specific titles (50-60 chars)
- [ ] Implement product-specific descriptions (150-160 chars)
- [ ] Add product keywords
- [ ] Test with Lighthouse

**Time:** 1.5 hours
**File:** `app/(shop)/produits/[slug]/page.tsx`

**What to Update:**
- `title` - unique per product
- `description` - unique per product + CTA
- `keywords` - product name, category, materials, style
- `openGraph` - product images, description
- `twitter` - similar to OG

---

### 7. Category Page Metadata
- [ ] Add dynamic `generateMetadata()` to category pages
- [ ] Implement category-specific titles
- [ ] Implement category-specific descriptions
- [ ] Add category keywords
- [ ] Update OG images to category images

**Time:** 1 hour
**File:** `app/(shop)/categories/[category]/page.tsx`

---

### 8. Product Schema Implementation
- [ ] Add Product schema to product pages
- [ ] Include offer details (price, currency, availability)
- [ ] Include aggregate rating if reviews exist
- [ ] Include individual reviews as Review schema
- [ ] Test with Rich Results Test

**Time:** 1 hour
**File:** `app/(shop)/produits/[slug]/page.tsx`

**Implementation Pattern:**
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(generateProductSchema(product, url)),
  }}
/>
```

---

### 9. BreadcrumbList Schema
- [ ] Add BreadcrumbList schema to product pages
- [ ] Update to product category pages
- [ ] Test breadcrumb display in SERP (may take 2-3 weeks)

**Time:** 30 minutes
**File:** `app/(shop)/produits/[slug]/page.tsx`

---

### 10. Image Alt Text Optimization
- [ ] Update ProductCard.tsx alt text
  - From: `alt={product.name}`
  - To: `alt="${product.name} - ${product.category.name}"`
- [ ] Update category image alt text
- [ ] Update product gallery alt text
- [ ] Test with Lighthouse Accessibility audit

**Time:** 30 minutes
**Files:**
- `components/product/ProductCard.tsx`
- `components/product/ProductGallery.tsx`
- Product page images

---

## PHASE 2: IMPORTANT (Weeks 2-3) - 10 Hours

### 11. CollectionPage Schema
- [ ] Add to category pages
- [ ] Include product list within collection
- [ ] Test with Rich Results Test

**Time:** 45 minutes
**File:** `app/(shop)/categories/[category]/page.tsx`

---

### 12. Heading Hierarchy Fix
- [ ] Review home page heading structure
- [ ] Fix features section H2/H3 usage
- [ ] Ensure H1 only appears once per page
- [ ] Check for proper nesting (no H1->H3 jumps)
- [ ] Validate with Lighthouse

**Time:** 2 hours
**Files:**
- `app/page.tsx`
- `app/(shop)/produits/page.tsx`
- `app/(shop)/categories/[category]/page.tsx`
- `app/(shop)/produits/[slug]/page.tsx`

**Checklist per page:**
- [ ] One H1 covering main topic
- [ ] H2s for main sections
- [ ] H3s only under H2s
- [ ] No skipped levels

---

### 13. Semantic Landmarks
- [ ] Add `<nav>` with aria-label to breadcrumbs
- [ ] Verify `<main>` tag with id="main-content"
- [ ] Add `role="navigation"` to breadcrumb nav
- [ ] Ensure proper section wrapping
- [ ] Test with accessibility audit

**Time:** 1.5 hours
**Files:** Multiple layout files

**Key Landmarks:**
- `<header>` - already present
- `<nav>` - for navigation
- `<main>` - primary content
- `<footer>` - already present
- `<section>` - content sections
- `<article>` - product cards

---

### 14. Internal Linking Strategy
- [ ] Map silos (Salon, Chambre, Cuisine, Bureau, etc.)
- [ ] Add contextual links in product descriptions
- [ ] Create "Related Products" based on style/material
- [ ] Link complementary products
- [ ] Add "See also" in category pages
- [ ] Update footer with all categories

**Time:** 2 hours
**Files:** Multiple

**Actions:**
- ProductCard should link to category
- Product detail should link to:
  - Category page
  - Related products (same category)
  - Complementary products (style-based)
- Category pages should link to:
  - Subcategories (if applicable)
  - Related categories
  - Featured products

---

### 15. Review/Rating Schema
- [ ] Add AggregateRating to products with reviews
- [ ] Add individual Review schema for each review
- [ ] Include reviewer name, rating, comment
- [ ] Test with Rich Results Test (star ratings)

**Time:** 30 minutes
**File:** `app/(shop)/produits/[slug]/page.tsx`

---

### 16. FAQ Schema
- [ ] Create `app/aide/faq/page.tsx`
- [ ] Add FAQ schema with Q&A pairs
- [ ] Include:
  - Shipping questions
  - Return/exchange questions
  - Payment questions
  - Product questions
- [ ] Test with Rich Results Test (may appear in featured snippets)

**Time:** 1 hour
**File:** `app/aide/faq/page.tsx` (create new)

**FAQ Topics to Cover:**
- Livraison: "Quelle est la politique de livraison?"
- Retours: "Combien de temps j'ai pour retourner?"
- Paiement: "Quels moyens de paiement acceptez-vous?"
- Produits: "Où sont fabriqués les produits?"

---

### 17. LocalBusiness Schema (Optional)
- [ ] Only if you have physical locations
- [ ] Add address, hours, phone, reviews
- [ ] Link from footer

**Time:** 30 minutes (if applicable)

---

## PHASE 3: POLISH (Weeks 4-5) - 5 Hours

### 18. OG Image Optimization
- [ ] Create branded OG images (1200x630px)
- [ ] Generate product-specific OG images
- [ ] Generate category-specific OG images
- [ ] Update paths in metadata
- [ ] Test social sharing

**Time:** 2 hours

**Tools:**
- Figma or Canva for design
- ImageMagick or Cloudinary for batch generation

---

### 19. SEO Testing & Validation
- [ ] Run Google Rich Results Test on all pages
- [ ] Run Lighthouse Accessibility audit
- [ ] Test with Google PageSpeed Insights
- [ ] Validate with W3C Markup Validator
- [ ] Check Core Web Vitals
- [ ] Submit sitemap to Google Search Console

**Time:** 1.5 hours

---

### 20. SEO Documentation
- [ ] Document metadata strategy
- [ ] Create SEO checklist for new products
- [ ] Document internal linking strategy
- [ ] Create guide for future contributors

**Time:** 1 hour

---

## QUICK CHECKLIST BY FILE

### app/layout.tsx
- [ ] Update description (more specific)
- [ ] Update keywords (more targeted)
- [ ] Add themeColor
- [ ] Add appleWebApp
- [ ] Add Organization Schema
- [ ] Add canonical URL

### app/page.tsx (Homepage)
- [ ] Fix H2/H3 hierarchy in features
- [ ] Add main content canonical
- [ ] Wrap sections in `<section>` tags
- [ ] Add aria-labels to regions

### app/(shop)/produits/page.tsx
- [ ] Add generateMetadata() function
- [ ] Update title template
- [ ] Add canonical URL
- [ ] Add semantic nav with aria-label

### app/(shop)/produits/[slug]/page.tsx
- [ ] Add generateMetadata() with product data
- [ ] Add Product schema
- [ ] Add BreadcrumbList schema
- [ ] Update breadcrumb nav (aria-label)
- [ ] Improve alt text on images
- [ ] Add Review schema (if reviews exist)
- [ ] Canonical URL

### app/(shop)/categories/[category]/page.tsx
- [ ] Add generateMetadata() with category data
- [ ] Add CollectionPage schema
- [ ] Update canonical URL
- [ ] Fix heading hierarchy
- [ ] Improve image alt text

### components/product/ProductCard.tsx
- [ ] Improve alt text: Include category + index
- [ ] Add title attribute
- [ ] Ensure link text is descriptive
- [ ] Verify proper semantic HTML

### components/layout/Header.tsx
- [ ] Already good, maintain aria-labels
- [ ] Ensure keyboard navigation works

### components/layout/Footer.tsx
- [ ] Good internal linking structure
- [ ] Add all categories
- [ ] Verify all footer links are present

---

## VALIDATION CHECKLIST BEFORE DEPLOYMENT

```
SCHEMA VALIDATION:
[ ] Organization schema validates in Rich Results Test
[ ] Product schema validates on all product pages
[ ] BreadcrumbList validates on product pages
[ ] CollectionPage validates on category pages
[ ] FAQ schema validates (if implemented)
[ ] No schema errors in Google Search Console

METADATA VALIDATION:
[ ] All titles are 50-60 characters
[ ] All descriptions are 150-160 characters
[ ] Canonical URLs set correctly
[ ] No duplicate meta tags
[ ] OG tags present on all pages
[ ] Twitter cards present on all pages

TECHNICAL VALIDATION:
[ ] robots.txt returns 200 OK
[ ] sitemap.xml is valid XML
[ ] All URLs in sitemap are valid
[ ] robots meta tags on non-indexable pages
[ ] No broken internal links (404s)
[ ] Mobile responsive (375px+ widths)
[ ] HTTPS on all pages
[ ] No mixed content warnings

HTML STRUCTURE:
[ ] One H1 per page
[ ] Proper heading hierarchy
[ ] Alt text on all meaningful images
[ ] Semantic HTML (nav, main, section)
[ ] Skip link functional
[ ] Keyboard navigation works

PERFORMANCE:
[ ] Lighthouse SEO score 90+
[ ] Lighthouse Accessibility score 90+
[ ] Largest Contentful Paint < 2.5s
[ ] Cumulative Layout Shift < 0.1
[ ] No render-blocking resources
```

---

## TESTING TOOLS TO USE

1. **Google Search Console** (https://search.google.com/search-console/)
   - Submit sitemap
   - Check coverage
   - Monitor rankings
   - Fix errors

2. **Google Rich Results Test** (https://search.google.com/test/rich-results)
   - Validate each schema
   - Test before going live

3. **Google PageSpeed Insights** (https://pagespeed.web.dev/)
   - Check Core Web Vitals
   - Mobile performance
   - Desktop performance

4. **Lighthouse** (DevTools → Lighthouse)
   - SEO audit (100 questions)
   - Accessibility audit
   - Performance metrics

5. **W3C Markup Validator** (https://validator.w3.org/)
   - HTML validation
   - Catch semantic errors

6. **Screaming Frog** (https://www.screamingfrog.co.uk/)
   - Crawl entire site
   - Find broken links
   - Check meta tags

---

## TIME TRACKING

**Phase 1 (Critical): 10 hours**
- robots.txt: 0.25h
- sitemap.ts: 1h
- schema library: 1.5h
- Organization schema: 0.5h
- Canonical URLs: 1h
- Product metadata: 1.5h
- Category metadata: 1h
- Product schema: 1h
- BreadcrumbList: 0.5h
- Image alt text: 0.5h

**Phase 2 (Important): 10 hours**
- CollectionPage schema: 0.75h
- Heading hierarchy: 2h
- Semantic landmarks: 1.5h
- Internal linking: 2h
- Review schema: 0.5h
- FAQ schema: 1h
- LocalBusiness: 0.5h
- Metadata polish: 1.25h

**Phase 3 (Polish): 5 hours**
- OG images: 2h
- Testing & validation: 1.5h
- Documentation: 1h
- Misc: 0.5h

**Total: 25 hours**

---

## PRIORITY ORDER IF TIME LIMITED

If you can only do some items:
1. robots.txt (15 min)
2. sitemap.xml (1 hour)
3. Canonical URLs (1 hour)
4. Product metadata (1.5 hours)
5. Product schema (1 hour)
6. BreadcrumbList schema (30 min)
7. Organization schema (30 min)
8. Image alt text (30 min)

**Quick Wins = 6.5 hours | Big SEO impact**

---

## ONGOING MAINTENANCE

**Weekly:**
- Check Google Search Console for errors
- Monitor Core Web Vitals

**Monthly:**
- Review analytics for new ranking opportunities
- Check competitor SEO updates
- Audit new products for SEO compliance

**Quarterly:**
- Comprehensive audit
- Keyword research review
- Internal linking review

**Annually:**
- Full SEO audit
- Update sitemap strategy
- Plan next year's SEO roadmap

---

## SUCCESS METRICS

Track these to measure SEO improvement:

- [ ] Organic traffic increase (30-60 days post-implementation)
- [ ] Keyword rankings for target terms
- [ ] Rich snippet visibility (test in Search Console)
- [ ] Indexed pages in Google
- [ ] Click-through rate (CTR) from search results
- [ ] Avg. position for keywords
- [ ] Bounce rate
- [ ] Pages per session from organic

---

**Next Step:** Start with Phase 1 checklist items!
