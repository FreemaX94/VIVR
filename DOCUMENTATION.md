# VIVR Technical Documentation

**Version:** 0.1.0
**Last Updated:** 2026-01-22
**Type:** E-commerce Platform for French Interior Decoration

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [State Management](#state-management)
8. [Component Library](#component-library)
9. [Authentication System](#authentication-system)
10. [Payment Integration](#payment-integration)
11. [Development Guide](#development-guide)
12. [Deployment Guide](#deployment-guide)
13. [Performance & Security](#performance--security)

---

## Executive Summary

VIVR is a modern, production-ready e-commerce platform built for selling French interior decoration products. The application leverages Next.js 14's App Router for optimal performance, implements robust authentication with NextAuth.js, and provides secure payment processing through Stripe.

### Key Features

- **Full-Stack E-commerce**: Product browsing, cart management, wishlist, checkout
- **Authentication**: Credentials-based and OAuth (Google) authentication
- **Payment Processing**: Stripe integration with webhook handling
- **State Management**: Zustand stores with localStorage persistence
- **Responsive Design**: Mobile-first, glossy UI design system
- **Type Safety**: Full TypeScript coverage
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Comprehensive Jest test suite
- **Security**: CSP headers, rate limiting, CSRF protection

### Target Audience

This documentation is designed for:
- **Developers** onboarding to the project
- **Architects** reviewing system design
- **DevOps Engineers** deploying and maintaining the application
- **QA Engineers** understanding test coverage

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │  Mobile Web  │  │   Tablet     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 App Router                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Server Components (RSC)     │  Client Components      │ │
│  │  - Product listings          │  - Cart interactions   │ │
│  │  - Category pages            │  - Wishlist toggles    │ │
│  │  - SEO metadata              │  - Form validations    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes (REST)                                      │ │
│  │  - /api/products    - /api/orders    - /api/reviews   │ │
│  │  - /api/auth        - /api/stripe    - /api/categories│ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Database   │   │  Stripe API  │   │  NextAuth    │
│  PostgreSQL  │   │   Payments   │   │   OAuth      │
│    Prisma    │   │   Webhooks   │   │   Sessions   │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Data Flow Patterns

#### 1. Product Browsing Flow
```
User → Next.js Page (SSR) → Prisma → PostgreSQL
                          ↓
                    Render with data
                          ↓
                    Client hydration
                          ↓
              Client interactions (Zustand)
```

#### 2. Cart & Checkout Flow
```
User adds to cart → Zustand Store → localStorage
                                   ↓
                            Cart persisted
                                   ↓
Checkout → API validation → Stripe Checkout Session
                          ↓
                    Redirect to Stripe
                          ↓
                    Payment success
                          ↓
              Webhook → Update Order Status
```

#### 3. Authentication Flow
```
User login → NextAuth Credentials Provider
                    ↓
          Password verification (bcrypt)
                    ↓
          Generate JWT session token
                    ↓
          Store in HTTP-only cookie
                    ↓
          Subsequent requests authenticated
```

### Design Decisions & Rationale

#### Why Next.js 14 App Router?
- **Server Components**: Reduced JavaScript bundle, better SEO
- **Streaming**: Progressive page loading with Suspense
- **Layouts**: Shared UI without re-rendering
- **Built-in optimization**: Image, font, and script optimization

#### Why Zustand over Redux?
- **Minimal boilerplate**: ~80% less code than Redux
- **No Context Provider**: Direct store access
- **TypeScript-first**: Excellent type inference
- **Performance**: Selective subscriptions prevent re-renders
- **Persistence**: Built-in middleware for localStorage

#### Why Prisma?
- **Type safety**: Generated types from schema
- **Developer experience**: Intuitive query API
- **Migrations**: Version-controlled schema changes
- **Performance**: Query optimization and connection pooling

#### Why Stripe?
- **Industry standard**: Trusted payment processing
- **PCI compliance**: Security handled by Stripe
- **Webhooks**: Reliable payment confirmation
- **Developer experience**: Excellent documentation

---

## Tech Stack

### Core Framework
- **Next.js 14.1.0**: React framework with App Router
- **React 18.2.0**: UI library with Server Components
- **TypeScript 5.3.3**: Type safety and developer experience

### Database & ORM
- **PostgreSQL**: Production database
- **Prisma 5.10.0**: Type-safe ORM
- **Prisma Client**: Auto-generated database client

### Authentication
- **NextAuth.js 4.24.5**: Authentication solution
- **@auth/prisma-adapter**: Database adapter
- **bcryptjs 2.4.3**: Password hashing

### Payment Processing
- **Stripe 14.14.0**: Server-side SDK
- **@stripe/stripe-js 2.4.0**: Client-side SDK
- **@stripe/react-stripe-js 2.4.0**: React components

### State Management
- **Zustand 4.5.0**: Client state management
- **zustand/middleware**: Persistence and dev tools

### UI & Styling
- **Tailwind CSS 3.4.1**: Utility-first CSS
- **class-variance-authority 0.7.0**: Component variants
- **tailwind-merge 2.2.1**: Class merging utility
- **clsx 2.1.0**: Conditional classes
- **Lucide React 0.330.0**: Icon library
- **Framer Motion 11.0.0**: Animations

### Testing
- **Jest 29.7.0**: Test runner
- **@testing-library/react 16.3.2**: React testing utilities
- **@testing-library/jest-dom 6.9.1**: Custom matchers
- **@swc/jest 0.2.39**: Fast compilation

### Development Tools
- **ESLint 8.56.0**: Linting
- **Prettier** (implied): Code formatting
- **TypeScript ESLint**: TypeScript linting rules

---

## Project Structure

### Directory Organization

```
VIVR/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── connexion/            # Login page
│   │   ├── inscription/          # Registration page
│   │   ├── compte/               # Account page
│   │   └── layout.tsx            # Auth layout
│   ├── (shop)/                   # Shop route group
│   │   ├── produits/             # Products
│   │   │   ├── [slug]/           # Product detail
│   │   │   ├── page.tsx          # Product listing
│   │   │   └── layout.tsx        # Products layout
│   │   ├── categories/           # Category pages
│   │   │   └── [category]/       # Dynamic category
│   │   ├── panier/               # Cart page
│   │   ├── wishlist/             # Wishlist page
│   │   └── checkout/             # Checkout flow
│   │       ├── page.tsx          # Checkout form
│   │       └── success/          # Success page
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication
│   │   │   ├── [...nextauth]/    # NextAuth handler
│   │   │   └── register/         # Registration endpoint
│   │   ├── products/             # Product endpoints
│   │   ├── orders/               # Order endpoints
│   │   ├── reviews/              # Review endpoints
│   │   ├── categories/           # Category endpoints
│   │   ├── newsletter/           # Newsletter endpoint
│   │   └── stripe/               # Stripe integration
│   │       ├── checkout/         # Create session
│   │       └── webhook/          # Payment webhooks
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── sitemap.ts                # Dynamic sitemap
│
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx            # Button component
│   │   ├── Card.tsx              # Card component
│   │   ├── Input.tsx             # Input component
│   │   ├── Badge.tsx             # Badge component
│   │   ├── Modal.tsx             # Modal component
│   │   ├── Select.tsx            # Select component
│   │   ├── Spinner.tsx           # Loading spinner
│   │   ├── Skeleton.tsx          # Skeleton loader
│   │   ├── Toast.tsx             # Toast notifications
│   │   └── index.ts              # Exports
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx            # Site header
│   │   ├── Footer.tsx            # Site footer
│   │   ├── SearchBar.tsx         # Search component
│   │   └── index.ts              # Exports
│   ├── product/                  # Product components
│   │   ├── ProductCard.tsx       # Product card
│   │   ├── ProductGrid.tsx       # Product grid
│   │   ├── ProductGallery.tsx    # Image gallery
│   │   ├── ProductReviews.tsx    # Reviews section
│   │   └── index.ts              # Exports
│   ├── cart/                     # Cart components
│   │   ├── CartItem.tsx          # Cart item
│   │   ├── CartSummary.tsx       # Cart summary
│   │   ├── CartDrawer.tsx        # Cart drawer
│   │   └── index.ts              # Exports
│   └── providers/                # Context providers
│       └── SessionProvider.tsx   # NextAuth provider
│
├── stores/                       # Zustand stores
│   ├── cartStore.ts              # Cart state
│   ├── wishlistStore.ts          # Wishlist state
│   ├── toastStore.ts             # Toast notifications
│   ├── userStore.ts              # User preferences
│   └── index.ts                  # Exports
│
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Prisma client
│   ├── prisma-optimized.ts       # Optimized queries
│   ├── auth.ts                   # NextAuth config
│   ├── stripe.ts                 # Stripe utilities
│   ├── utils.ts                  # Helper functions
│   ├── money.ts                  # Money formatting
│   ├── rate-limit.ts             # Rate limiting
│   ├── schema.tsx                # Structured data
│   ├── analytics/                # Analytics tracking
│   │   ├── tracker.ts            # Event tracker
│   │   └── types.ts              # Analytics types
│   └── vision/                   # AI vision features
│       ├── index.ts              # Vision API
│       └── types.ts              # Vision types
│
├── types/                        # TypeScript types
│   ├── index.ts                  # Core types
│   ├── analytics.ts              # Analytics types
│   └── support.ts                # Support types
│
├── hooks/                        # Custom React hooks
│   └── useEasterEggs.ts          # Easter eggs hook
│
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
│
├── __tests__/                    # Test files
│   ├── api/                      # API tests
│   ├── components/               # Component tests
│   ├── stores/                   # Store tests
│   ├── lib/                      # Utility tests
│   └── integration/              # Integration tests
│
├── public/                       # Static files
│   ├── images/                   # Image assets
│   └── robots.txt                # SEO robots file
│
├── docs/                         # Documentation
│   ├── n8n-workflows/            # Workflow automation
│   └── marketing/                # Marketing docs
│
├── .env.example                  # Environment template
├── .env.local                    # Local environment
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── jest.config.js                # Jest config
├── middleware.ts                 # Edge middleware
└── package.json                  # Dependencies
```

### Route Groups

Next.js 14 uses route groups (folders in parentheses) to organize routes without affecting the URL structure:

- **(auth)**: Authentication-related pages (`/connexion`, `/inscription`, `/compte`)
- **(shop)**: Shopping pages (`/produits`, `/panier`, `/checkout`)

### File Conventions

- **page.tsx**: Route page component
- **layout.tsx**: Layout wrapper for nested routes
- **route.ts**: API route handler
- **loading.tsx**: Loading UI (Suspense fallback)
- **error.tsx**: Error boundary UI
- **not-found.tsx**: 404 page

---

## API Reference

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://vivr.fr/api`

### Authentication

All authenticated endpoints require a valid session cookie set by NextAuth.

#### Error Codes
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `429`: Rate limit exceeded
- `500`: Internal server error

---

### Products API

#### GET `/api/products`

Retrieve a paginated list of products with filtering and sorting.

**Query Parameters:**
```typescript
{
  page?: number          // Default: 1
  limit?: number         // Default: 12, Max: 100
  category?: string      // Category slug
  search?: string        // Search in name/description
  minPrice?: number      // Minimum price filter
  maxPrice?: number      // Maximum price filter
  featured?: 'true'      // Show only featured products
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'popular'
}
```

**Response:**
```typescript
{
  success: true,
  data: Product[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**Example Request:**
```bash
GET /api/products?category=canapes&sort=price-asc&page=1&limit=12
```

**Caching:**
- Cache-Control: `public, s-maxage=60, stale-while-revalidate=300`
- Cached for 60s, stale content served for 5 minutes

**Performance Optimizations:**
- Parallel queries for count and data
- Batch query for average ratings (prevents N+1)
- Indexed database queries
- Response includes computed fields (averageRating, reviewCount)

---

#### POST `/api/products`

Create a new product (Admin only).

**Authentication:** Required (ADMIN role)

**Request Body:**
```typescript
{
  name: string
  slug: string           // Unique identifier
  description: string
  price: number
  comparePrice?: number  // Original price for discounts
  images: string[]       // Array of image URLs
  categoryId: string
  stock?: number         // Default: 0
  featured?: boolean     // Default: false
}
```

**Response:**
```typescript
{
  success: true,
  data: Product
}
```

**Validation:**
- Slug must be unique
- Price must be positive
- Category must exist

---

#### GET `/api/products/[slug]`

Get a single product by slug.

**Response:**
```typescript
{
  success: true,
  data: Product & {
    averageRating: number,
    reviewCount: number,
    reviews: Review[]
  }
}
```

**Includes:**
- Category data
- Related products (same category, limit 4)
- Average rating and review count
- Recent reviews (limit 10)

---

### Orders API

#### GET `/api/orders`

Get all orders for the authenticated user.

**Authentication:** Required

**Response:**
```typescript
{
  success: true,
  data: Order[]
}
```

**Order Structure:**
```typescript
{
  id: string
  orderNumber: string    // e.g., "ORD-20260122-XXXX"
  userId: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: OrderStatus
  paymentMethod: string
  paymentId?: string
  address: Address
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

**Order Statuses:**
- `PENDING`: Order created, awaiting payment
- `PROCESSING`: Payment received, preparing shipment
- `PAID`: Payment confirmed
- `SHIPPED`: Order dispatched
- `DELIVERED`: Order delivered
- `CANCELLED`: Order cancelled
- `REFUNDED`: Order refunded

---

#### POST `/api/orders`

Create a new order.

**Authentication:** Required

**Request Body:**
```typescript
{
  items: Array<{
    productId: string
    quantity: number
  }>,
  address: {
    firstName: string
    lastName: string
    street: string
    apartment?: string
    city: string
    postalCode: string
    country: string
    phone?: string
  },
  paymentMethod: string  // "stripe", "paypal", etc.
}
```

**Response:**
```typescript
{
  success: true,
  data: Order
}
```

**Business Logic:**
1. **Price Validation**: Fetches prices from database (NEVER trusts client)
2. **Stock Check**: Validates sufficient inventory
3. **Shipping Calculation**: Free shipping over €50, else €4.99
4. **Stock Update**: Decrements product stock atomically
5. **Order Number**: Generates unique order number

**Security Considerations:**
- All prices fetched from database
- Stock checked and decremented in transaction
- Rate limiting applied

---

### Reviews API

#### GET `/api/reviews`

Get reviews for a product.

**Query Parameters:**
```typescript
{
  productId: string  // Required
}
```

**Response:**
```typescript
{
  success: true,
  data: Review[]
}
```

---

#### POST `/api/reviews`

Create or update a review.

**Authentication:** Required

**Rate Limiting:** 5 reviews per hour per user

**Request Body:**
```typescript
{
  productId: string
  rating: number        // 1-5
  title?: string
  comment?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: Review,
  message: string
}
```

**Business Logic:**
1. **Verification Check**: Checks if user purchased product
2. **Unique Constraint**: One review per user per product
3. **Update Logic**: Updates existing review if found
4. **Verified Badge**: Marks review as verified if purchase found

**Transaction Batching:**
- All verification queries batched in single transaction
- Prevents race conditions
- Reduces 3+ queries to 1 transaction

---

### Stripe API

#### POST `/api/stripe/checkout`

Create a Stripe Checkout session.

**Authentication:** Required

**Request Body:**
```typescript
{
  items: Array<{
    productId: string
    quantity: number
  }>,
  orderId?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    sessionId: string
    url: string  // Redirect to Stripe Checkout
  }
}
```

**Security Measures:**
1. **Price Validation**: Fetches prices from database
2. **Stock Validation**: Checks inventory availability
3. **Origin Validation**: Prevents open redirect attacks
4. **Metadata**: Stores order context for webhook

**Allowed Origins:**
- `http://localhost:3000`
- `http://localhost:3001`
- `process.env.NEXT_PUBLIC_APP_URL`
- `https://vivr.fr`
- `https://www.vivr.fr`

---

#### POST `/api/stripe/webhook`

Handle Stripe webhook events.

**Authentication:** Stripe signature verification

**Events Handled:**
- `checkout.session.completed`: Payment successful
- `payment_intent.succeeded`: Payment processed
- `payment_intent.payment_failed`: Payment failed

**Webhook Processing:**
1. Verify Stripe signature
2. Parse event payload
3. Update order status
4. Send confirmation email (if configured)
5. Trigger fulfillment workflow

**File Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\app\api\stripe\webhook\route.ts`

---

### Categories API

#### GET `/api/categories`

Get all product categories.

**Response:**
```typescript
{
  success: true,
  data: Category[]
}
```

**Category Structure:**
```typescript
{
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  _count?: {
    products: number
  }
}
```

---

### Newsletter API

#### POST `/api/newsletter`

Subscribe to newsletter.

**Request Body:**
```typescript
{
  email: string
}
```

**Response:**
```typescript
{
  success: true,
  message: string
}
```

**Validation:**
- Email format validation
- Duplicate check
- Lowercase normalization

---

### Authentication API

#### POST `/api/auth/register`

Register a new user.

**Request Body:**
```typescript
{
  email: string
  password: string
  name?: string
}
```

**Response:**
```typescript
{
  success: true,
  message: string
}
```

**Security:**
- Password hashed with bcrypt (10 rounds)
- Email uniqueness enforced
- Password minimum length: 8 characters

---

#### POST `/api/auth/signin`

Handled by NextAuth at `/api/auth/[...nextauth]`

**Providers:**
- Credentials (email/password)
- Google OAuth

**Session Strategy:** JWT (stateless)

**Session Duration:** 30 days (default)

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │────────<│   Order     │>────────│  OrderItem  │
│             │    1:N  │             │  1:N    │             │
│  id         │         │  id         │         │  id         │
│  email      │         │  userId     │         │  orderId    │
│  password   │         │  total      │         │  productId  │
│  role       │         │  status     │         │  quantity   │
└─────────────┘         └─────────────┘         └─────────────┘
      │ 1:N                                            │
      │                                                │
      ▼                                                ▼
┌─────────────┐                              ┌─────────────┐
│   Review    │                              │   Product   │
│             │                              │             │
│  id         │                              │  id         │
│  userId     │───────────────────────1:N────│  name       │
│  productId  │                              │  slug       │
│  rating     │                              │  price      │
└─────────────┘                              │  stock      │
                                             └─────────────┘
┌─────────────┐                                    │
│  Wishlist   │                                    │
│             │────────────────────────────────────┘
│  id         │                              1:N
│  userId     │
│  productId  │
└─────────────┘
                                             ┌─────────────┐
                                             │  Category   │
                                             │             │
                                        ┌────│  id         │
                                        │1:N │  name       │
                                        │    │  slug       │
                                        │    └─────────────┘
                                        │
                                        ▼
                              ┌─────────────┐
                              │   Product   │
                              │             │
                              │  categoryId │
                              └─────────────┘
```

### Models

#### User

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\prisma\schema.prisma:13-32`

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  password      String?
  image         String?
  role          UserRole  @default(USER)
  orders        Order[]
  reviews       Review[]
  wishlist      Wishlist[]
  addresses     Address[]
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([createdAt])
  @@index([role])
}

enum UserRole {
  USER
  ADMIN
}
```

**Indexes:**
- `createdAt`: For sorting users by registration date
- `role`: For admin queries
- `email`: Unique constraint with automatic index

**Relationships:**
- 1:N with Orders
- 1:N with Reviews
- 1:N with Wishlist
- 1:N with Addresses
- 1:N with Accounts (OAuth)
- 1:N with Sessions

---

#### Product

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\prisma\schema.prisma:75-98`

```prisma
model Product {
  id            String      @id @default(cuid())
  name          String
  slug          String      @unique
  description   String      @db.Text
  price         Decimal     @db.Decimal(12, 2)
  comparePrice  Decimal?    @db.Decimal(12, 2)
  images        String[]
  category      Category    @relation(fields: [categoryId], references: [id])
  categoryId    String
  stock         Int         @default(0)
  reviews       Review[]
  wishlist      Wishlist[]
  orderItems    OrderItem[]
  featured      Boolean     @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([categoryId, featured])
  @@index([categoryId, createdAt])
  @@index([featured, createdAt])
  @@index([createdAt])
  @@index([stock])
}
```

**Composite Indexes (Performance Optimized):**
- `[categoryId, featured]`: Featured products by category
- `[categoryId, createdAt]`: Latest products by category
- `[featured, createdAt]`: Latest featured products
- `stock`: Low stock queries
- `slug`: Unique constraint with automatic index

**Field Types:**
- `price`: Decimal(12,2) for precise currency calculations
- `images`: Array of strings (PostgreSQL array)
- `description`: Text field for long content

---

#### Order

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\prisma\schema.prisma:113-134`

```prisma
model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique
  user          User        @relation(fields: [userId], references: [id])
  userId        String
  items         OrderItem[]
  subtotal      Decimal     @db.Decimal(12, 2)
  shipping      Decimal     @db.Decimal(12, 2) @default(0)
  total         Decimal     @db.Decimal(12, 2)
  status        OrderStatus @default(PENDING)
  paymentMethod String
  paymentId     String?
  address       Json
  notes         String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([userId, createdAt])
  @@index([status, createdAt])
  @@index([paymentId])
  @@index([paymentMethod])
}

enum OrderStatus {
  PENDING
  PROCESSING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

**Indexes:**
- `[userId, createdAt]`: User order history
- `[status, createdAt]`: Orders by status
- `paymentId`: Payment lookup
- `paymentMethod`: Payment method analytics

**Business Rules:**
- `orderNumber`: Unique, human-readable identifier
- `address`: JSON field for flexible address schema
- `status`: Enum for order lifecycle

---

#### Review

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\prisma\schema.prisma:151-168`

```prisma
model Review {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  rating    Int
  title     String?
  comment   String?  @db.Text
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId])
  @@index([productId, verified])
  @@index([productId, createdAt])
  @@index([userId, createdAt])
}
```

**Unique Constraint:**
- `[userId, productId]`: One review per user per product

**Indexes:**
- `[productId, verified]`: Verified reviews for product
- `[productId, createdAt]`: Latest reviews for product
- `[userId, createdAt]`: User review history

**Cascade Behavior:**
- Reviews deleted when user or product deleted

---

#### Category

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\prisma\schema.prisma:100-111`

```prisma
model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  image       String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([slug])
}
```

---

#### Wishlist

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\prisma\schema.prisma:170-180`

```prisma
model Wishlist {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  createdAt DateTime @default(now())

  @@unique([userId, productId])
  @@index([userId, createdAt])
}
```

---

#### Address

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\prisma\schema.prisma:182-200`

```prisma
model Address {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  label      String?
  firstName  String
  lastName   String
  street     String
  apartment  String?
  city       String
  postalCode String
  country    String   @default("France")
  phone      String?
  isDefault  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
}
```

---

### Database Optimizations

**Performance Indexes Added:**
```sql
-- Composite indexes for common queries
CREATE INDEX "Product_categoryId_featured_idx" ON "Product"("categoryId", "featured");
CREATE INDEX "Product_categoryId_createdAt_idx" ON "Product"("categoryId", "createdAt");
CREATE INDEX "Product_featured_createdAt_idx" ON "Product"("featured", "createdAt");
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX "Review_productId_verified_idx" ON "Review"("productId", "verified");
```

**Query Optimization Techniques:**
1. **Parallel Queries**: Count and data fetched simultaneously
2. **N+1 Prevention**: Batch queries for related data
3. **Selective Includes**: Only fetch needed relations
4. **Connection Pooling**: Prisma connection pool configured

---

## State Management

### Zustand Architecture

VIVR uses Zustand for client-side state management with these principles:

1. **Minimal Stores**: Only cart, wishlist, toast, and user preferences
2. **localStorage Persistence**: Cart and wishlist persist across sessions
3. **No Global Provider**: Direct store imports
4. **TypeScript-First**: Fully typed actions and state

---

### Cart Store

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\stores\cartStore.ts`

```typescript
interface CartState {
  items: CartItem[]
  itemCount: number
  total: number

  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Computed
  getItemQuantity: (productId: string) => number
  isInCart: (productId: string) => boolean
}
```

**Features:**
- **Deduplication**: Increments quantity if product already in cart
- **Auto-Calculation**: Total and item count automatically computed
- **Persistence**: Saved to `localStorage` under key `vivr-cart`
- **Partial Persistence**: Only state data persisted (not functions)

**Usage Example:**
```typescript
import { useCartStore } from '@/stores/cartStore'

function ProductCard({ product }) {
  const addItem = useCartStore(state => state.addItem)
  const isInCart = useCartStore(state => state.isInCart(product.id))

  return (
    <button onClick={() => addItem(product, 1)}>
      {isInCart ? 'In Cart' : 'Add to Cart'}
    </button>
  )
}
```

**Performance:**
- **Selective Subscriptions**: Components only re-render when their selected state changes
- **Computed Values**: Pre-calculated total and item count

---

### Wishlist Store

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\stores\wishlistStore.ts`

```typescript
interface WishlistState {
  items: WishlistItem[]

  // Actions
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  toggleItem: (product: Product) => void
  clearWishlist: () => void

  // Computed
  isInWishlist: (productId: string) => boolean
}
```

**Features:**
- **Toggle Logic**: Single function to add/remove
- **Duplicate Prevention**: Checks before adding
- **Timestamp**: Records when item added
- **Persistence**: Saved to `localStorage` under key `vivr-wishlist`

**Usage Example:**
```typescript
import { useWishlistStore } from '@/stores/wishlistStore'

function WishlistButton({ product }) {
  const toggleItem = useWishlistStore(state => state.toggleItem)
  const isInWishlist = useWishlistStore(state => state.isInWishlist(product.id))

  return (
    <button onClick={() => toggleItem(product)}>
      <Heart fill={isInWishlist ? 'currentColor' : 'none'} />
    </button>
  )
}
```

---

### Toast Store

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\stores\toastStore.ts`

```typescript
interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

type ToastType = 'success' | 'error' | 'info' | 'warning'
```

**Features:**
- **Auto-Dismiss**: Toasts removed after duration (default 4s)
- **Unique IDs**: Generated with timestamp + random string
- **Helper Functions**: Convenience functions for each type

**Usage Example:**
```typescript
import { toast } from '@/stores/toastStore'

async function handleSubmit() {
  try {
    await submitForm()
    toast.success('Form submitted successfully!')
  } catch (error) {
    toast.error('Failed to submit form')
  }
}
```

**Helper API:**
```typescript
toast.success(message, duration?)
toast.error(message, duration?)
toast.info(message, duration?)
toast.warning(message, duration?)
```

---

### User Store

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\stores\userStore.ts`

```typescript
interface UserState {
  preferences: {
    currency: 'EUR'
    language: 'fr'
    theme: 'light' | 'dark'
  }
  updatePreferences: (prefs: Partial<UserPreferences>) => void
}
```

**Features:**
- **User Preferences**: Currency, language, theme
- **Persistence**: Saved to localStorage
- **Type Safety**: TypeScript ensures valid preferences

---

## Component Library

### Design System

VIVR uses a glossy, modern design system with:
- **Color Palette**: Black/white with subtle grays
- **Typography**: Inter font family
- **Shadows**: Layered shadows for depth
- **Animations**: Subtle hover and focus states

---

### UI Components

All UI components use **class-variance-authority** for variant management and are fully typed.

#### Button

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Button.tsx`

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  fullWidth?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}
```

**Variants:**
- **primary**: Black gradient background, white text
- **secondary**: White background, black text, border
- **outline**: Transparent background, border
- **ghost**: Transparent background, no border
- **danger**: Red background (destructive actions)
- **success**: Green background (confirmations)

**Usage:**
```tsx
<Button variant="primary" size="lg" leftIcon={<ShoppingBag />}>
  Add to Cart
</Button>

<Button variant="outline" isLoading>
  Processing...
</Button>
```

**Features:**
- Loading state with spinner
- Icon support (left/right)
- Keyboard focus styles
- Disabled state
- Full width option

---

#### Card

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Card.tsx`

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}
```

**Sub-components:**
- `CardHeader`: Title and description area
- `CardContent`: Main content area
- `CardFooter`: Actions or additional info

**Usage:**
```tsx
<Card variant="elevated" hover>
  <CardHeader>
    <h3>Product Title</h3>
  </CardHeader>
  <CardContent>
    Product details...
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

---

#### Input

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Input.tsx`

```typescript
interface InputProps {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}
```

**Features:**
- Label with optional indicator
- Error state with message
- Helper text
- Icon support
- Accessible (ARIA labels)

**Usage:**
```tsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  leftIcon={<Mail />}
/>
```

---

#### Badge

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Badge.tsx`

```typescript
interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}
```

**Usage:**
```tsx
<Badge variant="error">-20%</Badge>
<Badge variant="primary">Featured</Badge>
<Badge variant="secondary">Rupture</Badge>
```

---

#### Modal

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Modal.tsx`

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlay?: boolean
}
```

**Features:**
- Backdrop blur
- Smooth animations (Framer Motion)
- Keyboard escape to close
- Focus trap
- Scroll lock

**Usage:**
```tsx
<Modal isOpen={isOpen} onClose={handleClose} title="Confirm Delete">
  <p>Are you sure?</p>
  <Button onClick={handleConfirm}>Confirm</Button>
</Modal>
```

---

#### Select

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Select.tsx`

```typescript
interface SelectProps {
  options: Array<{ value: string; label: string }>
  label?: string
  error?: string
  placeholder?: string
}
```

**Usage:**
```tsx
<Select
  label="Sort By"
  options={[
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' }
  ]}
  onChange={handleSort}
/>
```

---

### Product Components

#### ProductCard

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\product\ProductCard.tsx`

**Features:**
- Image gallery with dots navigation
- Quick add to cart
- Wishlist toggle
- Stock indicator
- Discount badge
- Featured badge
- Hover effects (zoom, overlay)

**Performance:**
- Memoized with React.memo
- Image optimization with Next.js Image
- Priority loading for above-fold images

**Code Example:**
```tsx
<ProductCard
  product={product}
  priority={index < 4}  // First 4 images priority loaded
/>
```

---

#### ProductGrid

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\product\ProductGrid.tsx`

**Features:**
- Responsive grid (1-4 columns)
- Loading skeletons
- Empty state
- Infinite scroll support (optional)

**Grid Breakpoints:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Large: 4 columns

---

#### ProductGallery

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\product\ProductGallery.tsx`

**Features:**
- Main image display
- Thumbnail navigation
- Zoom on hover
- Keyboard navigation
- Touch/swipe support

---

### Layout Components

#### Header

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\layout\Header.tsx`

**Features:**
- Logo
- Main navigation
- Search bar
- Cart icon with item count
- User menu
- Mobile hamburger menu
- Sticky on scroll

**Cart Badge:**
- Shows item count
- Animated when count changes
- Opens cart drawer on click

---

#### Footer

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\layout\Footer.tsx`

**Sections:**
- Company info
- Quick links
- Categories
- Newsletter signup
- Social media links
- Payment methods
- Legal links

---

### Cart Components

#### CartItem

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\cart\CartItem.tsx`

**Features:**
- Product image and details
- Quantity selector (+/- buttons)
- Remove button
- Price calculation
- Stock indicator

---

#### CartSummary

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\cart\CartSummary.tsx`

**Displays:**
- Subtotal
- Shipping cost
- Discount (if applicable)
- Total
- Checkout button
- Continue shopping link

---

## Authentication System

### NextAuth.js Configuration

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\lib\auth.ts`

#### Providers

1. **Credentials Provider**
   - Email + password authentication
   - bcrypt password hashing (10 rounds)
   - Custom error messages in French

2. **Google OAuth**
   - Social login
   - Automatic account creation
   - Email verification via Google

#### Session Strategy

**JWT (Stateless)**
- No database session storage
- Token contains: `id`, `email`, `role`
- Stored in HTTP-only cookie
- 30-day expiration (default)

#### Callbacks

```typescript
callbacks: {
  async jwt({ token, user }) {
    // Add user info to token on sign in
    if (user) {
      token.id = user.id
      token.role = user.role
    }
    return token
  },
  async session({ session, token }) {
    // Make user info available in session
    if (session.user) {
      session.user.id = token.id
      session.user.role = token.role
    }
    return session
  }
}
```

#### Custom Pages

- **Sign In**: `/connexion`
- **Sign Out**: `/connexion` (redirects here)
- **Error**: `/connexion` (with error query param)

#### Type Augmentation

```typescript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
    }
  }
}
```

---

### Authentication Flow

#### Registration Flow

```
User submits form
      ↓
POST /api/auth/register
      ↓
Email uniqueness check
      ↓
Hash password (bcrypt, 10 rounds)
      ↓
Create user in database
      ↓
Return success
      ↓
Redirect to /connexion
```

#### Login Flow (Credentials)

```
User submits credentials
      ↓
POST /api/auth/signin
      ↓
NextAuth authorize callback
      ↓
Find user by email
      ↓
Verify password (bcrypt.compare)
      ↓
Generate JWT token
      ↓
Set HTTP-only cookie
      ↓
Redirect to callback URL or /
```

#### Protected Route Pattern

```typescript
// Server Component
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/connexion')
  }

  // Page content
}
```

```typescript
// API Route
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // API logic
}
```

---

### Role-Based Access Control

```typescript
// Admin-only API route
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Admin-only logic
}
```

---

### Security Best Practices

1. **Password Hashing**: bcrypt with 10 rounds
2. **HTTP-Only Cookies**: Prevents XSS attacks
3. **CSRF Protection**: Built into NextAuth
4. **Rate Limiting**: Applied to auth endpoints
5. **JWT Secrets**: Stored in environment variables
6. **Session Expiration**: 30-day maximum
7. **OAuth Scopes**: Minimal required permissions

---

## Payment Integration

### Stripe Configuration

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\lib\stripe.ts`

#### Initialize Stripe

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true
})
```

---

### Checkout Session Flow

```
User clicks "Checkout"
      ↓
POST /api/stripe/checkout
      ↓
Validate cart items
      ↓
Fetch prices from database
      ↓
Validate stock availability
      ↓
Create Stripe Checkout Session
      ↓
Return session URL
      ↓
Redirect to Stripe Checkout
      ↓
User completes payment
      ↓
Stripe sends webhook
      ↓
POST /api/stripe/webhook
      ↓
Verify webhook signature
      ↓
Update order status to PAID
      ↓
Redirect to success page
```

---

### Stripe Checkout Session

**Configuration:**
```typescript
{
  payment_method_types: ['card'],
  mode: 'payment',
  customer_email: userEmail,
  line_items: [
    {
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Product Name',
          description: 'Product Description',
          images: ['https://...']
        },
        unit_amount: 9999  // Amount in cents (€99.99)
      },
      quantity: 1
    }
  ],
  success_url: 'https://vivr.fr/checkout/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://vivr.fr/panier',
  shipping_address_collection: {
    allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC']
  },
  shipping_options: [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: 499, currency: 'eur' },
        display_name: 'Livraison standard',
        delivery_estimate: {
          minimum: { unit: 'business_day', value: 3 },
          maximum: { unit: 'business_day', value: 5 }
        }
      }
    }
  ]
}
```

---

### Webhook Handling

**Endpoint:** `/api/stripe/webhook`

**Events Handled:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

**Security:**
```typescript
const signature = request.headers.get('stripe-signature')
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Verify webhook signature
const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  webhookSecret
)
```

**Order Update:**
```typescript
if (event.type === 'checkout.session.completed') {
  const session = event.data.object

  await prisma.order.update({
    where: { id: session.metadata.orderId },
    data: {
      status: 'PAID',
      paymentId: session.payment_intent
    }
  })
}
```

---

### Shipping Options

1. **Standard Shipping**
   - Cost: €4.99
   - Delivery: 3-5 business days

2. **Express Shipping**
   - Cost: €9.99
   - Delivery: 1-2 business days

3. **Free Shipping**
   - Cost: Free (on orders €50+)
   - Delivery: 5-7 business days

---

### Payment Security

1. **PCI Compliance**: Handled by Stripe
2. **No Card Storage**: Cards never touch our servers
3. **Webhook Verification**: Signature validation
4. **HTTPS Only**: All payment pages use HTTPS
5. **3D Secure**: Supported for European cards
6. **Price Validation**: Server-side price checks

---

### Testing

**Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

**Test Mode:**
- Use `STRIPE_PUBLISHABLE_KEY` starting with `pk_test_`
- Use `STRIPE_SECRET_KEY` starting with `sk_test_`

---

## Development Guide

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **Git**: Latest version

---

### Initial Setup

#### 1. Clone Repository

```bash
git clone https://github.com/your-org/vivr.git
cd vivr
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vivr"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (optional)
npm run db:studio
```

#### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

### Project Scripts

```json
{
  "dev": "next dev",              // Start dev server
  "build": "next build",          // Production build
  "start": "next start",          // Start production server
  "lint": "next lint",            // Run ESLint
  "test": "jest",                 // Run tests
  "test:watch": "jest --watch",   // Watch mode
  "test:coverage": "jest --coverage",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

---

### Development Workflow

#### Creating a New Feature

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/product-comparison
   ```

2. **Implement Feature**
   - Add types in `types/`
   - Create components in `components/`
   - Add API routes in `app/api/`
   - Update database schema if needed

3. **Write Tests**
   ```bash
   # Create test file
   touch __tests__/components/ProductComparison.test.tsx

   # Run tests
   npm test
   ```

4. **Test Manually**
   ```bash
   npm run dev
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add product comparison feature"
   ```

---

### Database Migrations

#### Development (Schema Prototyping)

```bash
# Push schema changes without creating migration
npm run db:push
```

#### Production (Migration Workflow)

```bash
# Create migration
npx prisma migrate dev --name add_product_comparison

# Apply migration to production
npx prisma migrate deploy
```

---

### Testing Guide

#### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test CartStore
```

#### Test Structure

```
__tests__/
├── api/                 # API route tests
├── components/          # Component tests
├── stores/              # State management tests
├── lib/                 # Utility function tests
└── integration/         # Full-flow tests
```

#### Writing Tests

**Component Test Example:**
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<Button isLoading>Submit</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

**Store Test Example:**
```typescript
import { useCartStore } from '@/stores/cartStore'
import { mockProduct } from './mocks'

describe('CartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  it('adds item to cart', () => {
    const { addItem, items } = useCartStore.getState()
    addItem(mockProduct, 1)
    expect(items).toHaveLength(1)
    expect(items[0].product.id).toBe(mockProduct.id)
  })
})
```

---

### Code Style Guidelines

#### TypeScript

- Use explicit return types for functions
- Prefer interfaces over types for objects
- Use `const` over `let` when possible
- Avoid `any` type

#### React

- Use functional components
- Prefer named exports
- Use `memo` for expensive components
- Keep components under 200 lines

#### Naming Conventions

- **Components**: PascalCase (`ProductCard`)
- **Files**: PascalCase for components, camelCase for utilities
- **Functions**: camelCase (`calculateTotal`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **Interfaces**: PascalCase with `I` prefix optional (`Product` or `IProduct`)

---

### Debugging

#### Server Logs

```typescript
// In API routes
console.log('Debug:', data)

// View in terminal where dev server is running
```

#### Client Logs

```typescript
// In components
console.log('State:', state)

// View in browser console
```

#### Prisma Query Logs

```typescript
// In lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
})
```

#### React DevTools

- Install browser extension
- View component tree
- Inspect props and state

---

## Deployment Guide

### Environment Checklist

Before deploying to production:

- [ ] Database migrated to production
- [ ] Environment variables configured
- [ ] Stripe webhook configured
- [ ] NEXTAUTH_SECRET generated
- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] CDN configured (optional)

---

### Production Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@db.production.com:5432/vivr?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://vivr.fr"
NEXTAUTH_SECRET="<generated-secret-32-chars-minimum>"

# OAuth
GOOGLE_CLIENT_ID="production-client-id"
GOOGLE_CLIENT_SECRET="production-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="https://vivr.fr"
NODE_ENV="production"
```

---

### Vercel Deployment (Recommended)

#### 1. Connect Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link
```

#### 2. Configure Environment

```bash
# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... add all required env vars
```

#### 3. Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

#### 4. Configure Domain

```bash
vercel domains add vivr.fr
```

---

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=vivr
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=vivr
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### Deploy with Docker

```bash
# Build image
docker build -t vivr:latest .

# Run container
docker run -p 3000:3000 --env-file .env.production vivr:latest

# Or use docker-compose
docker-compose up -d
```

---

### Database Migration in Production

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

---

### Stripe Webhook Configuration

1. **Get Webhook Signing Secret**
   - Go to Stripe Dashboard
   - Developers → Webhooks
   - Add endpoint: `https://vivr.fr/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

2. **Test Webhook**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/api/stripe/webhook

   # Trigger test event
   stripe trigger checkout.session.completed
   ```

---

### Monitoring & Logging

#### Application Monitoring

**Recommended Services:**
- **Vercel Analytics**: Built-in for Vercel deployments
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **DataDog**: Full-stack monitoring

#### Database Monitoring

```sql
-- Monitor slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Monitor connection count
SELECT count(*) FROM pg_stat_activity;
```

#### Performance Metrics

- **Core Web Vitals**: LCP, FID, CLS
- **API Response Time**: Target < 200ms
- **Database Query Time**: Target < 50ms
- **Page Load Time**: Target < 2s

---

## Performance & Security

### Performance Optimizations

#### Next.js Image Optimization

```tsx
import Image from 'next/image'

<Image
  src="/product.jpg"
  alt="Product"
  width={400}
  height={400}
  quality={85}
  priority={isAboveFold}
  sizes="(max-width: 640px) 100vw, 400px"
/>
```

**Configuration:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\next.config.js:3-19`

---

#### Code Splitting

- **Automatic**: Next.js splits by route
- **Dynamic Import**: Lazy load components

```tsx
import dynamic from 'next/dynamic'

const ProductGallery = dynamic(
  () => import('@/components/product/ProductGallery'),
  { loading: () => <Spinner /> }
)
```

---

#### Caching Strategy

**API Routes:**
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
  }
})
```

**Static Pages:**
- Automatically cached by Next.js
- Revalidated on-demand or time-based

---

#### Database Query Optimization

1. **Parallel Queries**
   ```typescript
   const [products, count] = await Promise.all([
     prisma.product.findMany(),
     prisma.product.count()
   ])
   ```

2. **Selective Includes**
   ```typescript
   include: {
     category: {
       select: { id: true, name: true, slug: true }
     }
   }
   ```

3. **Batch Queries**
   ```typescript
   // Fetch all ratings in one query instead of N queries
   const ratings = await prisma.review.groupBy({
     by: ['productId'],
     where: { productId: { in: productIds } },
     _avg: { rating: true }
   })
   ```

---

### Security Measures

#### Content Security Policy

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\middleware.ts:38-51`

```typescript
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "connect-src 'self' https://api.stripe.com",
  "frame-src 'self' https://js.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
]
```

---

#### Security Headers

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\middleware.ts:8-35`

```typescript
headers.set('X-Frame-Options', 'DENY')
headers.set('X-Content-Type-Options', 'nosniff')
headers.set('X-XSS-Protection', '1; mode=block')
headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
```

---

#### Rate Limiting

**File:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\lib\rate-limit.ts`

```typescript
const RATE_LIMITS = {
  reviews: { max: 5, window: 3600 },      // 5 per hour
  newsletter: { max: 3, window: 3600 },   // 3 per hour
  auth: { max: 5, window: 900 }           // 5 per 15 min
}
```

**Implementation:**
```typescript
const rateLimitResult = rateLimit(
  `reviews:${session.user.id}`,
  RATE_LIMITS.reviews
)

if (!rateLimitResult.success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  )
}
```

---

#### CSRF Protection

- **Built-in**: NextAuth.js handles CSRF for auth routes
- **SameSite Cookies**: Prevents CSRF attacks
- **Origin Validation**: Checks request origin

---

#### SQL Injection Prevention

- **Prisma ORM**: Parameterized queries prevent SQL injection
- **No raw SQL**: All queries use Prisma client

---

#### XSS Prevention

- **React**: Auto-escapes output
- **CSP**: Restricts inline scripts
- **DOMPurify**: Sanitize user input (if needed)

---

### Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: All interactive elements accessible
- **Focus Styles**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant

---

## Appendices

### A. Glossary

- **App Router**: Next.js 14 routing system using `app/` directory
- **Prisma**: Type-safe ORM for database operations
- **Zustand**: Lightweight state management library
- **NextAuth**: Authentication library for Next.js
- **Stripe**: Payment processing platform
- **JWT**: JSON Web Token for stateless authentication
- **CSP**: Content Security Policy
- **RSC**: React Server Components

---

### B. File Reference

**Core Configuration:**
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\next.config.js` - Next.js configuration
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\tailwind.config.ts` - Tailwind CSS config
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\tsconfig.json` - TypeScript config
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\prisma\schema.prisma` - Database schema
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\middleware.ts` - Edge middleware

**Authentication:**
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\lib\auth.ts` - NextAuth configuration
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\app\api\auth\[...nextauth]\route.ts` - Auth handler

**Payment:**
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\lib\stripe.ts` - Stripe utilities
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\app\api\stripe\checkout\route.ts` - Checkout API
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\app\api\stripe\webhook\route.ts` - Webhook handler

**State Management:**
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\stores\cartStore.ts` - Cart state
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\stores\wishlistStore.ts` - Wishlist state
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\stores\toastStore.ts` - Toast notifications

---

### C. Common Issues & Solutions

#### Issue: Prisma Client Not Generated

**Solution:**
```bash
npx prisma generate
```

#### Issue: Database Connection Error

**Solution:**
1. Check `DATABASE_URL` in `.env.local`
2. Ensure PostgreSQL is running
3. Verify connection string format

#### Issue: Stripe Webhook Not Working Locally

**Solution:**
```bash
# Use Stripe CLI to forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

#### Issue: NextAuth Session Not Persisting

**Solution:**
1. Check `NEXTAUTH_SECRET` is set
2. Verify `NEXTAUTH_URL` matches current domain
3. Clear browser cookies

---

### D. Contributing Guidelines

1. **Fork & Clone**
2. **Create Feature Branch**: `git checkout -b feature/my-feature`
3. **Write Tests**: Ensure 80%+ coverage
4. **Follow Style Guide**: Run `npm run lint`
5. **Commit**: Use conventional commits (`feat:`, `fix:`, `docs:`)
6. **Push**: `git push origin feature/my-feature`
7. **Pull Request**: Describe changes, link issues

---

### E. Support & Resources

**Documentation:**
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Stripe: https://stripe.com/docs
- NextAuth: https://next-auth.js.org

**Community:**
- GitHub Issues: https://github.com/your-org/vivr/issues
- Discord: (if applicable)
- Email: support@vivr.fr

---

## Conclusion

This documentation provides a comprehensive guide to the VIVR e-commerce platform. For questions or contributions, please refer to the Contributing Guidelines or contact the development team.

**Last Updated:** 2026-01-22
**Version:** 1.0.0
**Maintainers:** VIVR Development Team

