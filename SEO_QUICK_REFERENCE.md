# VIVR SEO - QUICK REFERENCE GUIDE

Visual quick-start guide for SEO implementation.

---

## INFORMATION ARCHITECTURE VISUALIZATION

### Current Site Structure

```
VIVR (vivr.fr)
├── / (Homepage)
├── /produits (All Products)
│   ├── /produits/[slug] (Product Detail)
│   │   ├── Gallery Images
│   │   ├── Price & Stock
│   │   ├── Reviews
│   │   └── Related Products
│   └── ?sort=, ?minPrice=, ?maxPrice= (Filtered views - canonical to /produits)
├── /categories/[category] (Category Pages)
│   ├── salon
│   ├── chambre
│   ├── cuisine
│   ├── bureau
│   ├── salle-de-bain
│   └── exterieur
├── /panier (Shopping Cart - NOINDEX)
├── /checkout (Checkout - NOINDEX)
├── /compte (Account - NOINDEX)
├── /wishlist (Wishlist - NOINDEX)
├── /aide/faq (FAQ - to create)
├── /contact (Contact - to create metadata)
└── /a-propos (About - to create metadata)
```

---

## PRIORITY MATRIX: What to Do First

```
HIGH IMPACT + LOW EFFORT (Do These First!)
┌─────────────────────────────────────┐
│ 1. robots.txt              (15 min) │
│ 2. sitemap.xml             (1 hour) │
│ 3. Canonical URLs          (1 hour) │
│ 4. Organization Schema     (30 min) │
│ 5. Product Schema          (1 hour) │
└─────────────────────────────────────┘

HIGH IMPACT + MEDIUM EFFORT
┌─────────────────────────────────────┐
│ 6. Page Metadata           (2 hours)│
│ 7. Heading Hierarchy       (2 hours)│
│ 8. Internal Linking        (2 hours)│
│ 9. BreadcrumbList Schema   (30 min) │
└─────────────────────────────────────┘

MEDIUM IMPACT + MEDIUM EFFORT
┌─────────────────────────────────────┐
│ 10. Collection Schema      (45 min) │
│ 11. FAQ Page + Schema      (1 hour) │
│ 12. Image Alt Text         (30 min) │
│ 13. Semantic Landmarks     (1.5 hrs)│
└─────────────────────────────────────┘

LOW PRIORITY / CAN WAIT
┌─────────────────────────────────────┐
│ OG Images                           │
│ Tag/Attribute Pages                 │
│ Blog Integration                    │
└─────────────────────────────────────┘
```

---

## FILE MODIFICATION ROADMAP

```
Priority | File | Change | Lines | Effort
---------|------|--------|-------|--------
P0       | public/robots.txt | Create NEW | ~30 | 15 min
P0       | app/sitemap.ts | Create NEW | ~100 | 1 hour
P0       | lib/schema.ts | Create NEW | ~200 | 1.5 hours
P0       | app/layout.tsx | Update metadata + add Organization schema | ~50 | 30 min
P0       | app/(shop)/produits/[slug]/page.tsx | Add generateMetadata() + Product + BreadcrumbList schema | ~80 | 1 hour
P0       | app/(shop)/categories/[category]/page.tsx | Add generateMetadata() | ~40 | 1 hour
P0       | components/product/ProductCard.tsx | Improve alt text | ~5 | 15 min
P0       | app/layout.tsx | Add canonical | ~2 | 5 min
P1       | app/(shop)/produits/page.tsx | Add metadata, canonical | ~40 | 30 min
P1       | app/(shop)/categories/[category]/page.tsx | Add CollectionPage schema | ~40 | 45 min
P1       | app/page.tsx | Fix H2/H3 hierarchy | ~20 | 1 hour
P1       | app/aide/faq/page.tsx | Create NEW with FAQ schema | ~150 | 1 hour
P2       | public/images/ | Create OG images | N/A | 2 hours
REFACTOR | Multiple | Add semantic landmarks | ~30 | 1.5 hours
```

**Total Files to Create/Modify: 13**
**Total Effort: ~25 hours**

---

## CONTENT CHECKLIST BY PAGE TYPE

### Homepage (/)
```
METADATA:
[✓] Title (already good)
[ ] Update description (more specific)
[ ] Add better keywords
[✓] OG tags (basic)
[✓] Twitter tags (basic)
[ ] Add canonical

SEMANTIC HTML:
[✓] H1 present
[ ] Fix features H2/H3
[✓] Header landmark
[✓] Main landmark
[✓] Footer landmark

SCHEMA:
[✓] None on homepage (optional)
[ ] Add Organization Schema to layout
[ ] Add BreadcrumbList (optional)

IMAGES:
[✓] All have alt text
[ ] Improve OG images (2 images needed)
```

### Product Pages (/produits/[slug])
```
METADATA:
[ ] Dynamic title (product name + category)
[ ] Dynamic description (100-160 chars)
[ ] Dynamic keywords
[ ] Dynamic OG image (product image)
[ ] Canonical URL

SEMANTIC HTML:
[✓] H1 present (product name)
[✓] Breadcrumb nav present
[ ] Add aria-label to breadcrumb
[ ] Add main landmark

SCHEMA:
[ ] Product schema
[ ] BreadcrumbList schema
[ ] Review schema (if reviews exist)
[ ] Offer schema (included in Product)

IMAGES:
[ ] Improve alt text (add index number)
[ ] Add title attribute
[ ] Verify responsive sizes
```

### Category Pages (/categories/[category])
```
METADATA:
[ ] Dynamic title (category name + descriptor)
[ ] Dynamic description
[ ] Dynamic keywords
[ ] Canonical URL

SEMANTIC HTML:
[✓] H1 present (category name)
[✓] Breadcrumb nav
[ ] Add aria-label to nav
[✓] Main landmark

SCHEMA:
[ ] CollectionPage schema
[ ] Breadcrumb schema

IMAGES:
[ ] Improve category image alt text
[ ] Add description to alt
```

### All Other Pages
```
[ ] Metadata created (if not exists)
[ ] Canonical URL set
[ ] Heading hierarchy checked
[ ] Alt text on images
[ ] Internal links checked
```

---

## SCHEMA IMPLEMENTATION CHECKLIST

```
ORGANIZATION SCHEMA:
[ ] Add to app/layout.tsx <head>
[ ] Include name: "VIVR"
[ ] Include url: domain
[ ] Include logo: /images/logo.png
[ ] Include description
[ ] Include sameAs: social links
[ ] Include contactPoint
[ ] Test with Rich Results Test ✓

PRODUCT SCHEMA:
[ ] Add to product pages
[ ] Include name from product.name
[ ] Include description
[ ] Include image array
[ ] Include offers (price, currency, availability)
[ ] Include aggregateRating (if reviews)
[ ] Include review array (individual reviews)
[ ] Test per product ✓

BREADCRUMBLIST SCHEMA:
[ ] Add to product pages
[ ] Include all 4 levels: Home > Products > Category > Product
[ ] Include position numbers
[ ] Include itemListElement array
[ ] Test with Rich Results ✓

COLLECTIONPAGE SCHEMA:
[ ] Add to category pages
[ ] Include category name
[ ] Include product list (top 10)
[ ] Include category image
[ ] Test with Rich Results ✓

FAQ SCHEMA:
[ ] Add to /aide/faq
[ ] Include 6-10 Q&A pairs
[ ] Include mainEntity array
[ ] Include acceptedAnswer for each
[ ] Test for featured snippets ✓
```

---

## TESTING CHECKLIST

### Before Going Live
```
GOOGLE RICH RESULTS TEST:
[ ] Test homepage for Organization schema
[ ] Test product pages for Product schema
[ ] Test product pages for BreadcrumbList
[ ] Test category pages for CollectionPage
[ ] Test FAQ page for FAQ schema
[ ] All should show ✓ VALID

GOOGLE PAGESPEED INSIGHTS:
[ ] Test homepage: 90+ SEO score
[ ] Test product page: 90+ SEO score
[ ] Test category page: 90+ SEO score
[ ] Check Core Web Vitals: All GREEN

LIGHTHOUSE (DevTools):
[ ] SEO audit: 90+ score
[ ] Accessibility audit: 90+ score
[ ] Performance: 70+ score

W3C MARKUP VALIDATOR:
[ ] No errors
[ ] No warnings
[ ] Semantic HTML correct

MANUAL CHECKS:
[ ] Breadcrumbs display correctly
[ ] All links work (no 404s)
[ ] Images load properly
[ ] Mobile responsive
[ ] Keyboard navigation works
```

### After Going Live
```
GOOGLE SEARCH CONSOLE:
[ ] Submit sitemap
[ ] Submit robots.txt
[ ] Monitor coverage
[ ] Check for crawl errors
[ ] Check mobile usability
[ ] Monitor Core Web Vitals

MONITORING (Weekly):
[ ] Check GSC for new errors
[ ] Monitor organic traffic
[ ] Check keyword positions (if tool available)
[ ] Review new content compliance
```

---

## METADATA FORMULA BY PAGE TYPE

### Product Pages
```
Title Formula:
[Product Name] | Achetez [Category Name] - VIVR
Example: "Lampe de table Nordique | Achetez Salon - VIVR"
Length: 50-60 characters ✓

Description Formula:
[Product Name] - [First 100 chars of description]... Livraison gratuite dès 50€. Retours gratuits 30j.
Example: "Lampe de table Nordique - Illuminez votre intérieur... Livraison gratuite dès 50€. Retours gratuits 30j."
Length: 150-160 characters ✓

Keywords:
[Product Name], [Category Name], [Category] design, [Category] minimaliste, décoration intérieur
Example: "Lampe de table Nordique", "Salon", "Salon design", "Salon minimaliste", "décoration intérieur"
Count: 5-7 keywords ✓
```

### Category Pages
```
Title Formula:
[Category Name] | Achetez [Category] Design Minimaliste - VIVR
Example: "Salon | Achetez Salon Design Minimaliste - VIVR"
Length: 50-60 characters ✓

Description Formula:
Découvrez notre collection [Category]. Accessoires et mobilier design minimaliste. Livraison gratuite dès 50€.
Example: "Découvrez notre collection Salon. Accessoires et mobilier design minimaliste. Livraison gratuite dès 50€."
Length: 150-160 characters ✓

Keywords:
[Category], [Category] design, [Category] minimaliste, décoration [category], [Category] élégant, décoration intérieur
Example: "Salon", "Salon design", "Salon minimaliste", "décoration salon", "Salon élégant", "décoration intérieur"
Count: 6-8 keywords ✓
```

---

## HEADING HIERARCHY BY PAGE

### Product Page Example
```
✓ CORRECT:
H1: Lampe de table Nordique (product name)
  H2: Évaluations et avis
  H2: Description
  H2: Avis (n)
  H2: Produits similaires
    H3: Vase céramique minimal
    H3: Coussin lin naturel
    H3: Miroir rond doré

✗ WRONG (current):
H1: Lampe de table Nordique
H2: Breadcrumb (shouldn't be H2!)
H3: Description (skips H2!)
H3: Reviews
etc.
```

### Category Page Example
```
✓ CORRECT:
H1: Salon (category name)
  H2: Produits de la catégorie
    H3: [Product cards - optional]

✓ ALSO OK:
H1: Salon
  [Product cards with no heading]
  H2: [Other section if exists]
```

### Home Page Example
```
✓ CORRECT:
H1: Vivez votre intérieur
  H2: Livraison gratuite
  H2: Retours gratuits
  H2: Paiement sécurisé
  H2: Service client
  H2: Nos catégories
    [No H3 - these are images, not text headings]
  H2: Produits vedettes
  H2: Créez l'intérieur de vos rêves
  H2: @vivr.deco

✗ WRONG (current):
H1: Vivez votre intérieur
  H3: Livraison gratuite (should be H2!)
  H3: Retours gratuits (should be H2!)
  etc.
```

---

## INTERNAL LINKING EXAMPLES

### Product Page Should Link To:
```
1. Category page: /categories/[category]
   - In breadcrumb
   - In category label
   - In related products section

2. Related products: /produits/[slug]
   - "Produits similaires" section
   - Same category, similar price
   - 4-6 products shown

3. Home page: /
   - In header logo

4. Other categories:
   - In footer
   - In related sections (if applicable)
```

### Category Page Should Link To:
```
1. Home page: /
   - In breadcrumb
   - In header

2. All products in category: /produits/[slug]
   - In product cards
   - 8-12 products per page

3. Related categories: /categories/[other-category]
   - In footer
   - In "also browse" section

4. Product detail: /produits/[slug]
   - Card click
   - Featured products
```

### Home Page Should Link To:
```
1. All products: /produits
   - In hero CTA
   - In featured products section

2. Categories: /categories/[category]
   - In category cards
   - In footer

3. Specific products: /produits/[slug]
   - In featured products grid
   - In featured section
```

---

## ROBOTS.TXT RULES AT A GLANCE

```
ALLOW (search engines can crawl):
✓ / (homepage)
✓ /produits (product listing)
✓ /produits/[slug] (product detail)
✓ /categories/[category] (category pages)
✓ /aide/faq (FAQ)
✓ /a-propos (about)
✓ /contact (contact)

DISALLOW (search engines should NOT crawl):
✗ /panier (shopping cart)
✗ /checkout (checkout process)
✗ /compte (user account)
✗ /api/* (API routes)
✗ /?*sort= (filter parameters)
✗ /?*minPrice= (filter parameters)

SITEMAPS:
sitemap: https://vivr.fr/sitemap.xml
```

---

## METRICS TO TRACK

### SEO Health Metrics
```
Monthly Tracking:
┌─────────────────────────────────┐
│ Indexed Pages    : ___ / ___ ✓  │
│ Crawl Errors     : ___ (target 0) │
│ Mobile Usability : ___ issues   │
│ Core Web Vitals  : ___ good     │
│ Search Impressions: ___ (↑ 30%) │
│ Average Position : ___ (↓ 5)    │
│ Click-Through-Rate: ___ % (↑)   │
│ Organic Traffic  : ___ (↑ 50%)  │
└─────────────────────────────────┘
```

### Business Metrics
```
Monthly Tracking:
┌──────────────────────────────────┐
│ Organic Sessions  : ___ (↑ 50%)  │
│ Organic Users     : ___ (↑ 50%)  │
│ Organic Bounce %  : ___ % (↓)    │
│ Avg Session Time  : ___ sec (↑)  │
│ Conversion Rate   : ___ % (↑)    │
│ Organic Revenue   : €___ (↑ 50%) │
│ ROAS              : ___ (↑)      │
└──────────────────────────────────┘
```

---

## QUICK COMMAND REFERENCE

### Testing URLs

**Google Rich Results Test:**
```
https://search.google.com/test/rich-results
```

**Google PageSpeed Insights:**
```
https://pagespeed.web.dev/?url=https://vivr.fr
```

**W3C Markup Validator:**
```
https://validator.w3.org/#validate_by_uri?uri=https://vivr.fr
```

**Google Search Console:**
```
https://search.google.com/search-console/
```

**Screaming Frog (if using):**
```
Command: Start crawl → https://vivr.fr
Report: Internal HTML → Check sitemap coverage
```

---

## SCHEMA IMPLEMENTATION DECISION TREE

```
START: Do I need this schema?

├─ Organization?
│  └─ Yes (homepage + all pages)
│     └─ Where: app/layout.tsx <head>
│     └─ Check: Knowledge panel appears
│
├─ Product Details?
│  └─ Yes (product pages only)
│     └─ Where: app/(shop)/produits/[slug]/page.tsx
│     └─ Check: Rich snippet shows price & rating
│
├─ Breadcrumbs?
│  └─ Yes (product + category pages)
│     └─ Where: Same files as Product schema
│     └─ Check: Breadcrumb navigation in SERP
│
├─ Collection/Category?
│  └─ Yes (category pages only)
│     └─ Where: app/(shop)/categories/[category]/page.tsx
│     └─ Check: Category indexing improves
│
├─ FAQ?
│  └─ Only if FAQ page exists
│     └─ Where: app/aide/faq/page.tsx
│     └─ Check: Featured snippets for questions
│
└─ LocalBusiness?
   └─ Only if physical location
      └─ Where: app/layout.tsx or dedicated page
      └─ Check: Local pack visibility
```

---

## FINAL CHECKLIST: BEFORE YOU START

```
PREPARATION:
[ ] Read SEO_AUDIT_REPORT.md (full understanding)
[ ] Review SEO_CODE_EXAMPLES.md (see implementations)
[ ] Have access to VS Code/IDE open
[ ] Have git repository set up
[ ] Create feature branch: git checkout -b feat/seo-implementation

TOOLS READY:
[ ] Google Search Console account (setup if needed)
[ ] Google Rich Results Test tab open
[ ] Google PageSpeed Insights tab open
[ ] Local dev server running: npm run dev

TEAM ALIGNMENT:
[ ] Designer notified (OG images needed)
[ ] Content team notified (FAQ needs writing)
[ ] QA team notified (testing procedures)
[ ] Timeline: 3-4 weeks set with team

DOCUMENTATION:
[ ] SEO_IMPLEMENTATION_CHECKLIST.md printed/open
[ ] SEO_CODE_EXAMPLES.md available
[ ] SEO_AUDIT_REPORT.md for reference
[ ] This quick reference as bookmark

GO/NO-GO:
[ ] All preparation complete
[ ] Team ready
[ ] Timeline confirmed
[ ] Ready to implement!
```

---

**Ready to start? Pick P0 items above and follow the checklist!**
