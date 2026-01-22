# VIVR API Reference

Quick reference for all API endpoints in the VIVR e-commerce platform.

**Base URL:** `/api`

---

## Table of Contents

- [Authentication](#authentication)
- [Products](#products)
- [Categories](#categories)
- [Orders](#orders)
- [Reviews](#reviews)
- [Stripe](#stripe)
- [Newsletter](#newsletter)
- [Error Codes](#error-codes)

---

## Authentication

### POST `/api/auth/register`

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully"
}
```

**Errors:**
- `400`: Email already exists
- `400`: Invalid email format
- `400`: Password too short

---

### POST `/api/auth/signin`

Sign in with credentials (handled by NextAuth).

**Endpoint:** `/api/auth/[...nextauth]`

**Providers:**
- `credentials`: Email + password
- `google`: Google OAuth

---

### GET `/api/auth/session`

Get current session (handled by NextAuth).

**Response:**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "expires": "2026-02-22T00:00:00.000Z"
}
```

---

## Products

### GET `/api/products`

Get paginated product list with filters.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page (max: 100) |
| `category` | string | - | Filter by category slug |
| `search` | string | - | Search in name/description |
| `minPrice` | number | - | Minimum price filter |
| `maxPrice` | number | - | Maximum price filter |
| `featured` | boolean | - | Show only featured |
| `sort` | string | 'newest' | Sort order |

**Sort Options:**
- `price-asc`: Price low to high
- `price-desc`: Price high to low
- `newest`: Newest first
- `popular`: Most reviewed first

**Example Request:**
```http
GET /api/products?category=canapes&sort=price-asc&page=1&limit=12
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "name": "Canapé Modern",
      "slug": "canape-modern",
      "description": "...",
      "price": 899.99,
      "comparePrice": 1199.99,
      "images": ["https://..."],
      "category": {
        "id": "clxxx...",
        "name": "Canapés",
        "slug": "canapes"
      },
      "stock": 15,
      "featured": true,
      "averageRating": 4.5,
      "reviewCount": 24,
      "createdAt": "2026-01-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 48,
    "totalPages": 4
  }
}
```

**Cache Headers:**
- `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`

---

### GET `/api/products/[slug]`

Get single product by slug.

**Example Request:**
```http
GET /api/products/canape-modern
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "Canapé Modern",
    "slug": "canape-modern",
    "description": "Detailed description...",
    "price": 899.99,
    "comparePrice": 1199.99,
    "images": ["https://...", "https://..."],
    "category": {
      "id": "clxxx...",
      "name": "Canapés",
      "slug": "canapes",
      "image": "https://..."
    },
    "stock": 15,
    "featured": true,
    "averageRating": 4.5,
    "reviewCount": 24,
    "reviews": [
      {
        "id": "clxxx...",
        "rating": 5,
        "title": "Excellent produit",
        "comment": "Très satisfait...",
        "verified": true,
        "user": {
          "name": "Marie D.",
          "image": "https://..."
        },
        "createdAt": "2026-01-20T10:00:00.000Z"
      }
    ],
    "relatedProducts": [
      {
        "id": "clxxx...",
        "name": "Canapé Classic",
        "slug": "canape-classic",
        "price": 749.99,
        "images": ["https://..."]
      }
    ],
    "createdAt": "2026-01-15T12:00:00.000Z"
  }
}
```

**Errors:**
- `404`: Product not found

---

### POST `/api/products`

Create a new product (Admin only).

**Authentication:** Required (ADMIN role)

**Request:**
```json
{
  "name": "Nouveau Canapé",
  "slug": "nouveau-canape",
  "description": "Description détaillée...",
  "price": 899.99,
  "comparePrice": 1199.99,
  "images": [
    "https://res.cloudinary.com/vivr/image/upload/...",
    "https://res.cloudinary.com/vivr/image/upload/..."
  ],
  "categoryId": "clxxx...",
  "stock": 20,
  "featured": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "Nouveau Canapé",
    "slug": "nouveau-canape",
    "price": 899.99,
    "category": {
      "id": "clxxx...",
      "name": "Canapés"
    },
    "createdAt": "2026-01-22T15:30:00.000Z"
  }
}
```

**Errors:**
- `401`: Not authenticated
- `403`: Not admin
- `400`: Slug already exists
- `400`: Category not found

---

## Categories

### GET `/api/categories`

Get all product categories.

**Example Request:**
```http
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "name": "Canapés",
      "slug": "canapes",
      "description": "Canapés et salons modernes",
      "image": "https://...",
      "_count": {
        "products": 24
      },
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "clxxx...",
      "name": "Tables",
      "slug": "tables",
      "description": "Tables basses et tables à manger",
      "image": "https://...",
      "_count": {
        "products": 18
      },
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Orders

### GET `/api/orders`

Get all orders for authenticated user.

**Authentication:** Required

**Example Request:**
```http
GET /api/orders
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "orderNumber": "ORD-20260122-A1B2C3",
      "userId": "clxxx...",
      "items": [
        {
          "id": "clxxx...",
          "productId": "clxxx...",
          "name": "Canapé Modern",
          "price": 899.99,
          "quantity": 1,
          "image": "https://...",
          "product": {
            "id": "clxxx...",
            "name": "Canapé Modern",
            "slug": "canape-modern",
            "images": ["https://..."]
          }
        }
      ],
      "subtotal": 899.99,
      "shipping": 4.99,
      "total": 904.98,
      "status": "PAID",
      "paymentMethod": "stripe",
      "paymentId": "pi_xxx...",
      "address": {
        "firstName": "John",
        "lastName": "Doe",
        "street": "123 Rue Example",
        "city": "Paris",
        "postalCode": "75001",
        "country": "France",
        "phone": "+33123456789"
      },
      "createdAt": "2026-01-22T10:00:00.000Z",
      "updatedAt": "2026-01-22T10:05:00.000Z"
    }
  ]
}
```

**Order Status Values:**
- `PENDING`: Awaiting payment
- `PROCESSING`: Payment received, preparing
- `PAID`: Payment confirmed
- `SHIPPED`: Order dispatched
- `DELIVERED`: Order delivered
- `CANCELLED`: Order cancelled
- `REFUNDED`: Order refunded

**Errors:**
- `401`: Not authenticated

---

### POST `/api/orders`

Create a new order.

**Authentication:** Required

**Request:**
```json
{
  "items": [
    {
      "productId": "clxxx...",
      "quantity": 1
    },
    {
      "productId": "clyyy...",
      "quantity": 2
    }
  ],
  "address": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Rue Example",
    "apartment": "Apt 4B",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France",
    "phone": "+33123456789"
  },
  "paymentMethod": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "orderNumber": "ORD-20260122-A1B2C3",
    "subtotal": 1799.97,
    "shipping": 0,
    "total": 1799.97,
    "status": "PENDING",
    "items": [
      {
        "productId": "clxxx...",
        "name": "Canapé Modern",
        "price": 899.99,
        "quantity": 1
      }
    ],
    "createdAt": "2026-01-22T15:30:00.000Z"
  }
}
```

**Business Rules:**
- Prices fetched from database (client prices ignored)
- Stock validated and decremented
- Free shipping on orders ≥ €50
- Standard shipping: €4.99

**Errors:**
- `401`: Not authenticated
- `400`: Empty cart
- `400`: Product not found
- `400`: Insufficient stock

---

## Reviews

### GET `/api/reviews`

Get reviews for a product.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | string | Yes | Product ID |

**Example Request:**
```http
GET /api/reviews?productId=clxxx...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "userId": "clxxx...",
      "productId": "clxxx...",
      "rating": 5,
      "title": "Excellent produit",
      "comment": "Très satisfait de cet achat...",
      "verified": true,
      "user": {
        "id": "clxxx...",
        "name": "Marie D.",
        "image": "https://..."
      },
      "createdAt": "2026-01-20T10:00:00.000Z",
      "updatedAt": "2026-01-20T10:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/reviews`

Create or update a review.

**Authentication:** Required

**Rate Limit:** 5 reviews per hour per user

**Request:**
```json
{
  "productId": "clxxx...",
  "rating": 5,
  "title": "Excellent produit",
  "comment": "Très satisfait de cet achat. Livraison rapide et produit conforme."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "rating": 5,
    "title": "Excellent produit",
    "comment": "Très satisfait...",
    "verified": true,
    "user": {
      "name": "John Doe"
    },
    "createdAt": "2026-01-22T15:30:00.000Z"
  },
  "message": "Avis publié avec succès"
}
```

**Validation:**
- Rating must be 1-5
- One review per user per product
- Marked as verified if user purchased product

**Errors:**
- `401`: Not authenticated
- `429`: Rate limit exceeded
- `400`: Invalid rating
- `404`: Product not found

---

## Stripe

### POST `/api/stripe/checkout`

Create a Stripe Checkout session.

**Authentication:** Required

**Request:**
```json
{
  "items": [
    {
      "productId": "clxxx...",
      "quantity": 1
    }
  ],
  "orderId": "clxxx..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_xxx...",
    "url": "https://checkout.stripe.com/pay/cs_test_xxx..."
  }
}
```

**Flow:**
1. Validate items and stock
2. Fetch prices from database
3. Create Stripe session
4. Return checkout URL
5. Client redirects to Stripe

**Errors:**
- `401`: Not authenticated
- `400`: Empty cart
- `400`: Product not found
- `400`: Insufficient stock

---

### POST `/api/stripe/webhook`

Handle Stripe webhook events.

**Authentication:** Stripe signature verification

**Events:**
- `checkout.session.completed`: Payment successful
- `payment_intent.succeeded`: Payment processed
- `payment_intent.payment_failed`: Payment failed

**Webhook Headers:**
```http
stripe-signature: t=xxx,v1=yyy
```

**Response:**
```json
{
  "received": true
}
```

**Processing:**
1. Verify signature
2. Parse event
3. Update order status
4. Send confirmation email
5. Return 200 OK

---

## Newsletter

### POST `/api/newsletter`

Subscribe to newsletter.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription successful"
}
```

**Validation:**
- Valid email format
- Duplicate check
- Lowercase normalization

**Errors:**
- `400`: Invalid email
- `409`: Email already subscribed

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Not authenticated |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource conflict (duplicate) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message in French",
  "code": "ERROR_CODE"
}
```

### Common Errors

**Authentication Errors:**
```json
{
  "success": false,
  "error": "Non autorisé"
}
```

**Validation Errors:**
```json
{
  "success": false,
  "error": "Produit introuvable: clxxx..."
}
```

**Rate Limit Errors:**
```json
{
  "success": false,
  "error": "Trop d'avis soumis. Réessayez plus tard."
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/reviews` | 5 requests | 1 hour |
| `/api/newsletter` | 3 requests | 1 hour |
| `/api/auth/*` | 5 requests | 15 minutes |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1706112000
```

---

## Authentication

All authenticated endpoints require a valid session cookie set by NextAuth.

**Session Cookie:**
- Name: `next-auth.session-token` (production) or `__Secure-next-auth.session-token` (dev)
- HTTP-Only: Yes
- Secure: Yes (production)
- SameSite: Lax
- Max-Age: 30 days

**Usage Example:**
```typescript
// Client-side (automatically handled by NextAuth)
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <Spinner />
  if (status === 'unauthenticated') return <Login />

  return <div>Hello {session.user.name}</div>
}
```

---

## Postman Collection

Import this collection to test the API:

```json
{
  "info": {
    "name": "VIVR API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Products",
      "item": [
        {
          "name": "Get Products",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/products?page=1&limit=12"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

## Support

For API support, contact:
- Email: api@vivr.fr
- Documentation: https://vivr.fr/docs
- GitHub: https://github.com/your-org/vivr

**Last Updated:** 2026-01-22
