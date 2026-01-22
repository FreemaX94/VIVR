# VIVR - Social Media Integration Roadmap

## Strategic Overview for French Home Decoration E-commerce

**Brand Handle Recommendation:** @vivr.deco (already referenced in codebase)
**Target Market:** France (French-speaking audience)
**Industry:** Home Decoration / Interior Design

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Instagram Integration Strategy](#instagram-integration-strategy)
3. [Visual Content Strategy](#visual-content-strategy)
4. [Social Proof Implementation](#social-proof-implementation)
5. [Platform Features Integration](#platform-features-integration)
6. [Technical Implementation Guide](#technical-implementation-guide)
7. [6-Week Implementation Sprint](#6-week-implementation-sprint)
8. [KPIs and Success Metrics](#kpis-and-success-metrics)

---

## Current State Analysis

### Existing Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| Next.js 14 App Router | Active | Modern SSR/SSG capabilities |
| NextAuth.js | Active | Google OAuth configured |
| Prisma + PostgreSQL | Active | Robust data layer |
| Stripe Integration | Active | Payment processing ready |
| Framer Motion | Active | Smooth animations |
| Tailwind CSS | Active | Minimalist design system |

### Current Social Presence in Codebase

```typescript
// Already present in app/page.tsx (lines 313-349)
// Instagram Feed Placeholder section exists
// @vivr.deco handle referenced
```

### Gaps to Address

1. No Meta Pixel integration
2. No social login options (Facebook/Instagram)
3. No share functionality on products
4. No UGC collection system
5. No Instagram API integration
6. No Pinterest integration

---

## 1. Instagram Integration Strategy

### 1.1 Shoppable Posts (Instagram Shopping)

#### Prerequisites for Meta Commerce Manager

```plaintext
Requirements checklist:
[ ] Facebook Business Page for VIVR
[ ] Instagram Professional Account (Business)
[ ] Facebook Catalog connected
[ ] Domain verification on Meta Business
[ ] French market compliance (RGPD/GDPR)
```

#### Product Catalog Sync Architecture

```
VIVR Database (Prisma)
        |
        v
  API Endpoint (/api/catalog/meta)
        |
        v
  Meta Commerce Manager
        |
    +---+---+
    |       |
    v       v
Instagram  Facebook
 Shopping    Shop
```

#### Recommended Implementation

```typescript
// File: types/social.ts
export interface InstagramProduct {
  id: string;
  name: string;
  description: string;
  url: string;               // Product page URL
  image_url: string;         // Primary image
  price: string;             // "89.99 EUR"
  currency: 'EUR';
  availability: 'in stock' | 'out of stock';
  brand: 'VIVR';
  google_product_category?: string;
  condition: 'new';
}

export interface MetaCatalogFeed {
  products: InstagramProduct[];
  updated_at: string;
}
```

### 1.2 Product Tagging Strategy

#### Tagging Guidelines for Decoration

| Content Type | Tags per Post | Strategy |
|--------------|---------------|----------|
| Single Product | 1-2 | Hero product + accessories |
| Room Setup | 3-5 | Main pieces visible |
| Lifestyle | 2-3 | Subtle, non-intrusive |
| Flat Lay | 4-6 | All visible products |

#### French Caption Template

```plaintext
[Hook emotionnel]

[Description du produit/scene]

[Prix] | Livraison gratuite des 50EUR
[CTA]

---
#decoration #decointerieure #designfrancais #vivrdeco
#salon #chambre #maisonmoderne #inspirationdeco
```

### 1.3 Instagram Feed Widget on Site

#### Component Structure

```typescript
// File: components/social/InstagramFeed.tsx
interface InstagramPost {
  id: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
  caption?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

interface InstagramFeedProps {
  posts: InstagramPost[];
  columns?: 3 | 4 | 6;
  showLikes?: boolean;
  showCaptions?: boolean;
}
```

#### Display Options

1. **Grid Widget** (Current placeholder - 6 posts)
2. **Stories Carousel** (Horizontal scroll)
3. **Shoppable Gallery** (Products tagged)
4. **UGC Gallery** (Customer photos)

### 1.4 User-Generated Content (UGC) Strategy

#### UGC Collection Flow

```
Customer Purchase
       |
       v
Post-Purchase Email (J+7)
"Partagez votre deco avec #VIVRchezmoi"
       |
       v
Instagram Hashtag Monitor
       |
       v
UGC Moderation Dashboard
       |
       v
Approved Content -> Website Gallery
```

#### Prisma Schema Extension for UGC

```prisma
// Add to schema.prisma

model UserContent {
  id            String   @id @default(cuid())
  instagramId   String   @unique
  mediaUrl      String
  mediaType     String
  caption       String?  @db.Text
  username      String
  userImage     String?
  permalink     String
  productIds    String[] // Related products
  approved      Boolean  @default(false)
  featured      Boolean  @default(false)
  createdAt     DateTime @default(now())

  @@index([approved])
  @@index([featured])
}
```

---

## 2. Visual Content Strategy

### 2.1 Product Photography Guidelines

#### Primary Style: Scandinavian Minimalism

| Element | Specification |
|---------|---------------|
| Background | Pure white (#FFFFFF) or soft grey (#FAFAFA) |
| Lighting | Natural, soft shadows |
| Angles | 45-degree, straight-on, detail close-up |
| Props | Minimal, complementary items only |
| Ratio | 1:1 (Instagram), 4:5 (preferred feed) |

#### Image Requirements per Product

```typescript
interface ProductImages {
  primary: string;      // Hero shot (1:1, min 1080x1080)
  lifestyle: string;    // In-situ shot
  detail: string;       // Close-up/texture
  scale: string;        // With reference object
  packaging?: string;   // Unboxing content
}
```

#### Color Palette Alignment

Based on current Tailwind config:

```css
/* VIVR Brand Colors for Photography */
--vivr-white: #FFFFFF;
--vivr-offwhite: #FAFAFA;
--vivr-charcoal: #111111;
--vivr-grey: #666666;
--vivr-accent: #000000;
```

### 2.2 Lifestyle Imagery Strategy

#### Room-by-Room Content Calendar

| Room | Posting Day | Content Focus |
|------|-------------|---------------|
| Salon | Monday | Comfort, gathering |
| Chambre | Tuesday | Rest, serenity |
| Cuisine | Wednesday | Functionality, warmth |
| Bureau | Thursday | Productivity, focus |
| Salle de bain | Friday | Self-care, spa |
| Mix/Inspiration | Weekend | Trends, behind-scenes |

#### French Lifestyle Themes

1. **"L'Art de Vivre"** - Everyday elegance
2. **"Cocooning"** - Cozy, intimate spaces
3. **"Rangement Chic"** - Stylish organization
4. **"Lumiere Naturelle"** - Natural light focus
5. **"Fait en France"** - Local artisan highlights

### 2.3 Before/After Content

#### Transformation Post Structure

```plaintext
SLIDE 1: Before (swipe indicator)
SLIDE 2: After (reveal)
SLIDE 3: Products used (shoppable)
SLIDE 4: Shopping list/CTA

Caption Format:
"Transformation [Room]

Avant: [Problem description]
Apres: [Solution achieved]

Produits utilises:
- [Product 1] - [Price]
- [Product 2] - [Price]

Swipe pour la liste complete!"
```

#### Video Format for Reels

```plaintext
0-1s:  Quick flash of "before"
1-3s:  Text overlay "Et si on changeait ca?"
3-5s:  Time-lapse transformation
5-8s:  Reveal of "after" with music drop
8-12s: Product highlights (1-2s each)
12-15s: CTA + Website URL

Audio: Trending French or international sound
```

### 2.4 Room Inspiration Content

#### Pinterest-Style Moodboards

```typescript
interface RoomInspiration {
  roomType: 'salon' | 'chambre' | 'cuisine' | 'bureau' | 'salle-de-bain';
  style: 'scandinave' | 'industriel' | 'boheme' | 'moderne' | 'classique';
  colorScheme: string[];
  products: Product[];
  inspirationImages: string[];
  budget: 'economique' | 'moyen' | 'premium';
}
```

#### Content Series Ideas

1. **"Un Salon a 500EUR"** - Budget room makeovers
2. **"Le Detail Qui Change Tout"** - Single product impact
3. **"Copie ce Style"** - Celebrity/influencer room recreation
4. **"Visite Deco"** - Customer home tours (UGC)
5. **"Tendances 2026"** - Seasonal trend forecasts

---

## 3. Social Proof Implementation

### 3.1 Customer Photos Integration

#### Gallery Component

```typescript
// File: components/social/CustomerGallery.tsx
interface CustomerPhoto {
  id: string;
  imageUrl: string;
  customerName: string;
  productId: string;
  product: Product;
  instagramHandle?: string;
  rating?: number;
  caption?: string;
}

interface CustomerGalleryProps {
  photos: CustomerPhoto[];
  title?: string;
  layout: 'grid' | 'masonry' | 'carousel';
}
```

#### Display Locations

1. **Homepage** - Replace current Instagram placeholder
2. **Product Pages** - "Vu chez nos clients"
3. **Category Pages** - Room-specific UGC
4. **Checkout** - Social proof for conversion

### 3.2 Influencer Partnership Framework

#### French Decorator Influencer Tiers

| Tier | Followers | Engagement | Partnership Type |
|------|-----------|------------|------------------|
| Nano | 1K-10K | 5-8% | Product seeding |
| Micro | 10K-50K | 3-5% | Affiliate codes |
| Mid | 50K-200K | 2-4% | Paid collaboration |
| Macro | 200K-1M | 1-2% | Brand ambassador |

#### Collaboration Types

1. **Product Reviews** - Honest unboxing/review
2. **Room Makeovers** - Full transformation content
3. **Takeovers** - Stories account access
4. **Discount Codes** - Tracked affiliate links
5. **Giveaways** - Engagement campaigns

#### Influencer Management Database

```prisma
// Add to schema.prisma

model Influencer {
  id              String   @id @default(cuid())
  name            String
  instagramHandle String   @unique
  followers       Int
  engagementRate  Float?
  tier            String
  niche           String[] // ["decoration", "lifestyle", "diy"]
  collaborations  Collaboration[]
  contactEmail    String?
  notes           String?  @db.Text
  createdAt       DateTime @default(now())

  @@index([tier])
}

model Collaboration {
  id            String     @id @default(cuid())
  influencer    Influencer @relation(fields: [influencerId], references: [id])
  influencerId  String
  type          String     // "seeding", "paid", "affiliate"
  status        String     // "pending", "active", "completed"
  discountCode  String?    @unique
  commission    Float?     // Percentage
  products      String[]   // Product IDs
  startDate     DateTime
  endDate       DateTime?
  performance   Json?      // Tracked metrics
  createdAt     DateTime   @default(now())

  @@index([status])
  @@index([discountCode])
}
```

### 3.3 Community Building Strategy

#### French Decoration Community Pillars

1. **Education** - Decoration tips, DIY guides
2. **Inspiration** - Curated style boards
3. **Conversation** - Polls, Q&A, debates
4. **Recognition** - Customer spotlights
5. **Exclusivity** - Early access, VIP content

#### Community Engagement Tactics

| Day | Story Activity | Goal |
|-----|----------------|------|
| Lundi | Poll: "A ou B?" | Engagement |
| Mardi | Question box | Insights |
| Mercredi | Behind-scenes | Authenticity |
| Jeudi | Product spotlight | Conversion |
| Vendredi | Client du jour | UGC |
| Weekend | Quiz deco | Entertainment |

### 3.4 Hashtag Strategy

#### Primary Brand Hashtags

```plaintext
#VIVR (brand)
#VIVRdeco (products)
#VIVRchezmoi (UGC)
#VIVRstyle (lifestyle)
#VIVRfavoris (wishlist)
```

#### French Decoration Hashtag Research

| Category | Hashtags | Volume |
|----------|----------|--------|
| General | #decointerieure #decoration #designfrancais | High |
| Style | #decoscandinave #decomoderne #decoboheme | Medium |
| Room | #monsalon #machambre #monbureau | Medium |
| Emotion | #cocooning #bienetrechezsoi #homesweethome | High |
| Action | #amenagement #renovation #relooking | Medium |

#### Hashtag Set Templates

**Product Post (30 hashtags max)**
```plaintext
Brand: #VIVR #VIVRdeco #VIVRstyle

Niche (10): #decointerieure #decorationinterieure #decoaddict
#homedesign #interiordesign #decorfrancaise #instadeco
#homedecoration #decorationmaison #decocosy

Room-specific (5): #[room] #[room]deco #amenagement[room]
#inspiration[room] #idees[room]

Product-specific (5): #[category] #[style] #[material]
#[color]deco #[function]

Engagement (5): #inspohome #homeinspiration #interiorstyle
#myhome #frenchhome

Location (3): #decofrance #parisinterior #frenchdesign
```

---

## 4. Platform Features Integration

### 4.1 Social Sharing Buttons

#### Share Component

```typescript
// File: components/social/ShareButtons.tsx
interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  price?: number;
  hashtags?: string[];
}

const platforms = [
  { name: 'Pinterest', icon: PinterestIcon, priority: 1 },
  { name: 'Facebook', icon: FacebookIcon, priority: 2 },
  { name: 'WhatsApp', icon: WhatsAppIcon, priority: 3 },
  { name: 'Twitter', icon: TwitterIcon, priority: 4 },
  { name: 'Email', icon: MailIcon, priority: 5 },
  { name: 'Copy Link', icon: LinkIcon, priority: 6 },
];
```

#### Share URLs for French Market

```typescript
const shareUrls = {
  pinterest: (url: string, image: string, description: string) =>
    `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`,

  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,

  whatsapp: (url: string, text: string) =>
    `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,

  twitter: (url: string, text: string, hashtags: string[]) =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}&hashtags=${hashtags.join(',')}`,

  email: (url: string, subject: string, body: string) =>
    `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${body}\n\n${url}`)}`,
};
```

### 4.2 Pinterest Integration (PRIORITY)

**Why Pinterest is Critical for Decoration:**
- 85% of Pinners use Pinterest to plan decoration projects
- Highest purchase intent of any social platform
- Long content lifespan (pins discoverable for months/years)
- French market: 17M monthly active users

#### Pinterest Strategy

1. **Rich Pins** - Automatic product data sync
2. **Idea Pins** - Step-by-step decoration guides
3. **Shopping Pins** - Direct product links
4. **Boards Organization** - By room/style/color

#### Pinterest API Integration

```typescript
// File: lib/pinterest.ts
interface PinterestRichPin {
  title: string;
  description: string;
  link: string;
  price: {
    value: string;
    currency: 'EUR';
  };
  availability: 'in stock' | 'out of stock';
  brand: 'VIVR';
}

// Pinterest Meta Tags for Product Pages
const pinterestMeta = {
  'og:type': 'product',
  'og:title': product.name,
  'og:description': product.description,
  'og:url': `https://vivr.fr/produits/${product.slug}`,
  'og:image': product.images[0],
  'product:price:amount': product.price.toString(),
  'product:price:currency': 'EUR',
  'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
  'product:brand': 'VIVR',
};
```

#### Pinterest Save Button Placement

```plaintext
Priority Locations:
1. Product images (hover overlay)
2. Product gallery (each image)
3. Inspiration pages
4. Blog posts/guides
5. Room category pages
```

### 4.3 Facebook Shop Sync

#### Commerce Manager Integration

```plaintext
Data Flow:
VIVR Database -> Product Feed API -> Meta Commerce Manager -> FB Shop + IG Shopping

Feed Format: JSON or XML (Facebook Product Catalog format)
Update Frequency: Every 6 hours (cron job)
```

#### Product Feed Endpoint

```typescript
// File: app/api/catalog/meta/route.ts
export async function GET() {
  const products = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    include: { category: true },
  });

  const feed = products.map(product => ({
    id: product.id,
    title: product.name,
    description: product.description,
    availability: product.stock > 0 ? 'in stock' : 'out of stock',
    condition: 'new',
    price: `${product.price} EUR`,
    link: `https://vivr.fr/produits/${product.slug}`,
    image_link: product.images[0],
    brand: 'VIVR',
    google_product_category: getCategoryMapping(product.category.slug),
  }));

  return Response.json(feed);
}
```

### 4.4 TikTok Opportunities

#### TikTok Shop (When Available in France)

```plaintext
Content Strategy:
1. Quick room tours (15s)
2. Product reveals (unboxing)
3. Decoration hacks/tips
4. Before/after transformations
5. Trending sound adaptations
6. ASMR organization content
```

#### TikTok Content Calendar

| Format | Frequency | Duration | Goal |
|--------|-----------|----------|------|
| Tutorial | 2/week | 30-60s | Education |
| Transformation | 1/week | 15-30s | Inspiration |
| Trending | 3/week | 15s | Reach |
| Product | 2/week | 15-30s | Conversion |
| Behind-scenes | 1/week | 30-60s | Authenticity |

#### TikTok Pixel Integration

```typescript
// File: lib/tiktok.ts
export const tiktokPixelConfig = {
  pixelId: process.env.TIKTOK_PIXEL_ID,
  events: {
    pageView: 'PageView',
    viewContent: 'ViewContent',
    addToCart: 'AddToCart',
    initiateCheckout: 'InitiateCheckout',
    purchase: 'CompletePayment',
  },
};
```

---

## 5. Technical Implementation Guide

### 5.1 Instagram API Integration

#### Instagram Basic Display API (User Content)

```typescript
// File: lib/instagram.ts
interface InstagramConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
}

export class InstagramService {
  private baseUrl = 'https://graph.instagram.com';

  async getUserMedia(limit = 12): Promise<InstagramPost[]> {
    const response = await fetch(
      `${this.baseUrl}/me/media?fields=id,media_type,media_url,permalink,caption,timestamp&limit=${limit}&access_token=${this.accessToken}`
    );
    return response.json();
  }

  async refreshToken(): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/refresh_access_token?grant_type=ig_refresh_token&access_token=${this.accessToken}`
    );
    const data = await response.json();
    return data.access_token;
  }
}
```

#### Instagram Graph API (Business Features)

```typescript
// File: lib/instagram-business.ts
export class InstagramBusinessService {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  async getBusinessProfile(igUserId: string): Promise<any> {
    return this.fetch(`/${igUserId}?fields=biography,followers_count,media_count,profile_picture_url,username`);
  }

  async getMediaInsights(mediaId: string): Promise<any> {
    return this.fetch(`/${mediaId}/insights?metric=engagement,impressions,reach,saved`);
  }

  async searchHashtag(hashtag: string, userId: string): Promise<any> {
    const hashtagId = await this.getHashtagId(hashtag, userId);
    return this.fetch(`/${hashtagId}/top_media?user_id=${userId}&fields=id,media_type,permalink`);
  }
}
```

### 5.2 Social Login Options

#### NextAuth Configuration Update

```typescript
// File: lib/auth.ts (Updated)
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'email,public_profile',
        },
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      // ... existing config
    }),
  ],
  // ... rest of config
};
```

#### Environment Variables Addition

```plaintext
# Add to .env.example

# Facebook Login
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# Instagram API
INSTAGRAM_APP_ID=""
INSTAGRAM_APP_SECRET=""
INSTAGRAM_ACCESS_TOKEN=""

# Meta Pixel
META_PIXEL_ID=""

# Pinterest
PINTEREST_APP_ID=""
PINTEREST_APP_SECRET=""

# TikTok
TIKTOK_PIXEL_ID=""
```

### 5.3 Share Functionality Implementation

#### Product Page Integration

```typescript
// File: app/(shop)/produits/[slug]/page.tsx
// Add share functionality

import { ShareButtons } from '@/components/social/ShareButtons';

export default function ProductPage({ params }: { params: { slug: string } }) {
  // ... existing code

  const shareData = {
    url: `https://vivr.fr/produits/${product.slug}`,
    title: product.name,
    description: `Decouvrez ${product.name} chez VIVR - ${formatPrice(product.price)}`,
    image: product.images[0],
    price: product.price,
    hashtags: ['VIVR', 'VIVRdeco', 'decointerieure'],
  };

  return (
    <div>
      {/* ... existing product display */}

      <div className="mt-6 pt-6 border-t border-border-light">
        <p className="text-sm text-text-muted mb-3">Partager ce produit</p>
        <ShareButtons {...shareData} />
      </div>
    </div>
  );
}
```

### 5.4 Meta Pixel Integration

#### Pixel Setup

```typescript
// File: lib/meta-pixel.ts
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const pageview = () => {
  window.fbq('track', 'PageView');
};

export const event = (name: string, options = {}) => {
  window.fbq('track', name, options);
};

// Standard Events for E-commerce
export const trackViewContent = (product: Product) => {
  window.fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'EUR',
  });
};

export const trackAddToCart = (product: Product, quantity: number) => {
  window.fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * quantity,
    currency: 'EUR',
    num_items: quantity,
  });
};

export const trackPurchase = (order: Order) => {
  window.fbq('track', 'Purchase', {
    content_ids: order.items.map(item => item.productId),
    content_type: 'product',
    value: order.total,
    currency: 'EUR',
    num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
  });
};
```

#### Pixel Component

```typescript
// File: components/analytics/MetaPixel.tsx
'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { META_PIXEL_ID, pageview } from '@/lib/meta-pixel';

export function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (META_PIXEL_ID) {
      pageview();
    }
  }, [pathname, searchParams]);

  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script id="fb-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
```

---

## 6. 6-Week Implementation Sprint

### Week 1-2: Foundation & Analytics

| Task | Priority | Owner | Status |
|------|----------|-------|--------|
| Create Meta Business Manager account | P0 | Marketing | [ ] |
| Set up Facebook Business Page | P0 | Marketing | [ ] |
| Convert Instagram to Professional | P0 | Marketing | [ ] |
| Install Meta Pixel | P0 | Dev | [ ] |
| Set up Pinterest Business account | P1 | Marketing | [ ] |
| Domain verification (Meta) | P0 | Dev | [ ] |
| Create social login buttons | P1 | Dev | [ ] |
| Design share button component | P1 | Dev | [ ] |

#### Development Tasks - Week 1-2

```bash
# File creation checklist
mkdir -p components/social
mkdir -p components/analytics
mkdir -p lib/social

# Components to create
touch components/social/ShareButtons.tsx
touch components/social/InstagramFeed.tsx
touch components/social/CustomerGallery.tsx
touch components/social/SocialLoginButtons.tsx
touch components/analytics/MetaPixel.tsx
touch lib/meta-pixel.ts
touch lib/instagram.ts
```

### Week 3-4: Integration & Content

| Task | Priority | Owner | Status |
|------|----------|-------|--------|
| Product catalog feed for Meta | P0 | Dev | [ ] |
| Instagram API integration | P1 | Dev | [ ] |
| Pinterest Rich Pins setup | P1 | Dev | [ ] |
| Share buttons on product pages | P1 | Dev | [ ] |
| Create content calendar | P0 | Marketing | [ ] |
| First batch of lifestyle photos | P0 | Marketing | [ ] |
| Hashtag research finalization | P1 | Marketing | [ ] |
| UGC campaign launch | P2 | Marketing | [ ] |

#### API Endpoints - Week 3-4

```typescript
// New API routes to create
// app/api/catalog/meta/route.ts - Product feed for Meta
// app/api/instagram/feed/route.ts - Fetch Instagram posts
// app/api/social/ugc/route.ts - UGC management
```

### Week 5-6: Optimization & Scaling

| Task | Priority | Owner | Status |
|------|----------|-------|--------|
| Instagram Shopping approval | P0 | Marketing | [ ] |
| Facebook Shop setup | P1 | Marketing | [ ] |
| A/B test share button placement | P2 | Dev | [ ] |
| Influencer outreach (5 nano) | P1 | Marketing | [ ] |
| UGC gallery implementation | P1 | Dev | [ ] |
| Analytics dashboard setup | P2 | Dev | [ ] |
| Performance optimization | P2 | Dev | [ ] |
| Documentation completion | P2 | Dev | [ ] |

---

## 7. KPIs and Success Metrics

### Social Media KPIs

| Metric | Baseline | 30-Day Target | 90-Day Target |
|--------|----------|---------------|---------------|
| Instagram Followers | 0 | 500 | 2,500 |
| Engagement Rate | - | 5% | 4% |
| Pinterest Monthly Views | 0 | 5,000 | 25,000 |
| Social Referral Traffic | 0% | 5% | 15% |
| UGC Submissions | 0 | 10 | 50 |

### E-commerce Impact KPIs

| Metric | Target |
|--------|--------|
| Social-attributed Revenue | 10% of total |
| Instagram Shopping Click Rate | 2% |
| Pinterest Save Rate | 3% |
| Share-to-Purchase Rate | 0.5% |
| Influencer Campaign ROI | 3:1 |

### Tracking Implementation

```typescript
// File: lib/analytics.ts
export const socialMetrics = {
  trackShareClick: (platform: string, productId: string) => {
    // Google Analytics
    gtag('event', 'share', {
      method: platform,
      content_id: productId,
    });

    // Meta Pixel
    fbq('trackCustom', 'ShareProduct', {
      platform,
      product_id: productId,
    });
  },

  trackSocialLogin: (provider: string) => {
    gtag('event', 'login', {
      method: provider,
    });
  },

  trackUGCInteraction: (action: 'view' | 'click' | 'submit') => {
    gtag('event', 'ugc_interaction', {
      action,
    });
  },
};
```

---

## 8. Recommended File Structure

```
VIVR/
├── components/
│   ├── social/
│   │   ├── ShareButtons.tsx
│   │   ├── InstagramFeed.tsx
│   │   ├── CustomerGallery.tsx
│   │   ├── SocialLoginButtons.tsx
│   │   ├── PinterestSaveButton.tsx
│   │   └── index.ts
│   ├── analytics/
│   │   ├── MetaPixel.tsx
│   │   ├── TikTokPixel.tsx
│   │   └── index.ts
│   └── ...
├── lib/
│   ├── social/
│   │   ├── instagram.ts
│   │   ├── pinterest.ts
│   │   ├── facebook.ts
│   │   └── share-urls.ts
│   ├── meta-pixel.ts
│   └── ...
├── app/
│   ├── api/
│   │   ├── catalog/
│   │   │   └── meta/
│   │   │       └── route.ts
│   │   ├── instagram/
│   │   │   ├── feed/
│   │   │   │   └── route.ts
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   ├── social/
│   │   │   ├── ugc/
│   │   │   │   └── route.ts
│   │   │   └── share/
│   │   │       └── route.ts
│   │   └── ...
│   └── ...
├── types/
│   ├── social.ts
│   └── ...
└── ...
```

---

## 9. Quick Start Checklist

### Immediate Actions (This Week)

- [ ] Create Meta Business Manager account
- [ ] Set up Instagram Professional account (@vivr.deco)
- [ ] Create Pinterest Business account
- [ ] Add Meta Pixel ID to environment variables
- [ ] Create `ShareButtons` component
- [ ] Add social meta tags to product pages

### Short-term Actions (2-4 Weeks)

- [ ] Implement Instagram Basic Display API
- [ ] Set up Pinterest Rich Pins
- [ ] Create product catalog feed for Meta
- [ ] Add social login options (Facebook)
- [ ] Launch #VIVRchezmoi UGC campaign
- [ ] Contact 5 nano-influencers

### Medium-term Actions (1-3 Months)

- [ ] Get approved for Instagram Shopping
- [ ] Launch Facebook Shop
- [ ] Implement UGC gallery on site
- [ ] Run first paid social campaign
- [ ] Establish influencer partnership program
- [ ] Create TikTok presence

---

## 10. Budget Estimation

### Development Costs

| Item | Hours | Rate | Total |
|------|-------|------|-------|
| Social components | 16h | 75 EUR | 1,200 EUR |
| API integrations | 24h | 75 EUR | 1,800 EUR |
| Analytics setup | 8h | 75 EUR | 600 EUR |
| Testing & QA | 8h | 75 EUR | 600 EUR |
| **Total Dev** | **56h** | | **4,200 EUR** |

### Marketing Costs (Monthly)

| Item | Cost |
|------|------|
| Content creation (photos/videos) | 500-1,500 EUR |
| Influencer partnerships | 500-2,000 EUR |
| Paid social ads (initial) | 500-1,000 EUR |
| Tools (scheduling, analytics) | 50-150 EUR |
| **Total Monthly** | **1,550-4,650 EUR** |

---

## Conclusion

This roadmap provides VIVR with a comprehensive strategy to leverage social media for growth in the French home decoration market. The focus on Pinterest and Instagram aligns perfectly with the visual nature of decoration products, while the technical implementation ensures seamless integration with the existing Next.js/Prisma stack.

**Priority Order:**
1. Meta Pixel (Analytics foundation)
2. Pinterest Integration (Highest ROI for decoration)
3. Instagram Shopping (Brand awareness + sales)
4. Social Sharing (Organic amplification)
5. UGC System (Social proof)
6. TikTok (Future growth)

---

*Document generated: January 2026*
*Last updated: Ready for implementation*
*Author: Instagram Curator Agent*
