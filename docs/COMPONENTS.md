# VIVR Component Library

Complete reference for all UI and feature components in the VIVR platform.

---

## Table of Contents

1. [UI Components](#ui-components)
2. [Product Components](#product-components)
3. [Cart Components](#cart-components)
4. [Layout Components](#layout-components)
5. [Usage Patterns](#usage-patterns)

---

## UI Components

### Button

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Button.tsx`

Versatile button component with multiple variants and states.

#### Props

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  fullWidth?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}
```

#### Examples

```tsx
import { Button } from '@/components/ui/Button'
import { ShoppingBag, ArrowRight } from 'lucide-react'

// Primary button
<Button variant="primary">
  Add to Cart
</Button>

// With icon
<Button variant="primary" leftIcon={<ShoppingBag />}>
  Add to Cart
</Button>

// Loading state
<Button isLoading disabled>
  Processing...
</Button>

// Full width
<Button variant="primary" fullWidth>
  Checkout
</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Heart />
</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// Outline variant
<Button variant="outline" rightIcon={<ArrowRight />}>
  Continue Shopping
</Button>

// Danger button (destructive actions)
<Button variant="danger">
  Delete Account
</Button>

// Success button
<Button variant="success">
  Confirm Order
</Button>
```

#### Variants

**Primary** - Main call-to-action
- Black gradient background
- White text
- Hover effect with lift

**Secondary** - Secondary actions
- White background
- Black text with border
- Subtle hover effect

**Outline** - Tertiary actions
- Transparent background
- Border with text color
- Inverts on hover

**Ghost** - Minimal actions
- Transparent background
- No border
- Background on hover

**Danger** - Destructive actions
- Red background
- White text
- Darker red on hover

**Success** - Confirmations
- Green background
- White text
- Darker green on hover

---

### Input

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Input.tsx`

Form input with label, error states, and icons.

#### Props

```typescript
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}
```

#### Examples

```tsx
import { Input } from '@/components/ui/Input'
import { Mail, Lock, Search } from 'lucide-react'

// Basic input
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
/>

// With icon
<Input
  label="Email"
  type="email"
  leftIcon={<Mail />}
  placeholder="you@example.com"
/>

// Error state
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
  leftIcon={<Lock />}
/>

// With helper text
<Input
  label="Promo Code"
  helperText="Enter a valid promo code for discount"
  placeholder="SUMMER2026"
/>

// Search input
<Input
  type="search"
  placeholder="Search products..."
  leftIcon={<Search />}
/>

// Controlled input
function Form() {
  const [email, setEmail] = useState('')

  return (
    <Input
      label="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  )
}
```

---

### Card

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Card.tsx`

Container component with variants and sub-components.

#### Props

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  className?: string
}
```

#### Sub-components

- `CardHeader`: Header with title/description
- `CardContent`: Main content area
- `CardFooter`: Footer with actions

#### Examples

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Basic card
<Card>
  <CardHeader>
    <h3>Card Title</h3>
    <p>Card description</p>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Elevated card with hover
<Card variant="elevated" hover>
  <CardContent>
    Hoverable elevated card
  </CardContent>
</Card>

// Bordered card
<Card variant="bordered">
  <CardContent>
    Bordered card
  </CardContent>
</Card>

// Custom padding
<Card padding="none">
  <img src="..." alt="..." />
  <CardContent padding="md">
    Content with custom padding
  </CardContent>
</Card>

// Product card example
<Card variant="elevated" hover>
  <CardContent padding="none">
    <img src={product.image} alt={product.name} />
  </CardContent>
  <CardContent>
    <h3>{product.name}</h3>
    <p>{formatPrice(product.price)}</p>
  </CardContent>
  <CardFooter>
    <Button fullWidth>Add to Cart</Button>
  </CardFooter>
</Card>
```

---

### Badge

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Badge.tsx`

Small labeled components for status and tags.

#### Props

```typescript
interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

#### Examples

```tsx
import { Badge } from '@/components/ui/Badge'

// Discount badge
<Badge variant="error">-20%</Badge>

// Featured badge
<Badge variant="primary">Featured</Badge>

// Stock status
<Badge variant="secondary">Rupture</Badge>
<Badge variant="success">In Stock</Badge>

// Different sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Order status
<Badge variant="success">Delivered</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Cancelled</Badge>

// New items
<Badge variant="primary">New</Badge>
```

---

### Modal

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Modal.tsx`

Modal dialog with animations and focus management.

#### Props

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlay?: boolean
  children: React.ReactNode
}
```

#### Examples

```tsx
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

function DeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Delete
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Delete"
        size="md"
      >
        <p>Are you sure you want to delete this item?</p>
        <div className="flex gap-2 mt-4">
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  )
}

// Large modal with form
<Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
  <form onSubmit={handleSubmit}>
    <Input label="Name" value={name} onChange={...} />
    <Input label="Email" value={email} onChange={...} />
    <Button type="submit">Save Changes</Button>
  </form>
</Modal>

// Don't close on overlay click
<Modal
  isOpen={isOpen}
  onClose={onClose}
  closeOnOverlay={false}
  title="Important Notice"
>
  <p>Please read carefully...</p>
</Modal>
```

---

### Select

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Select.tsx`

Dropdown select component.

#### Props

```typescript
interface SelectProps {
  options: Array<{ value: string; label: string }>
  value?: string
  onChange?: (value: string) => void
  label?: string
  error?: string
  placeholder?: string
}
```

#### Examples

```tsx
import { Select } from '@/components/ui/Select'

// Sort dropdown
<Select
  label="Sort By"
  placeholder="Select sorting..."
  options={[
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' }
  ]}
  onChange={handleSort}
/>

// Category filter
<Select
  label="Category"
  options={categories.map(cat => ({
    value: cat.slug,
    label: cat.name
  }))}
  value={selectedCategory}
  onChange={setSelectedCategory}
/>

// With error
<Select
  label="Country"
  options={countries}
  error="Please select a country"
/>

// Controlled select
function Form() {
  const [country, setCountry] = useState('')

  return (
    <Select
      label="Country"
      value={country}
      onChange={setCountry}
      options={[
        { value: 'fr', label: 'France' },
        { value: 'be', label: 'Belgium' },
        { value: 'ch', label: 'Switzerland' }
      ]}
    />
  )
}
```

---

### Spinner

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Spinner.tsx`

Loading spinner indicator.

#### Props

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

#### Examples

```tsx
import { Spinner } from '@/components/ui/Spinner'

// Default spinner
<Spinner />

// Different sizes
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

// Centered in container
<div className="flex items-center justify-center h-64">
  <Spinner />
</div>

// Loading state
{isLoading ? <Spinner /> : <Content />}

// In button
<Button disabled>
  <Spinner size="sm" />
  Loading...
</Button>
```

---

### Skeleton

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Skeleton.tsx`

Skeleton loader for content placeholders.

#### Props

```typescript
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  className?: string
}
```

#### Examples

```tsx
import { Skeleton } from '@/components/ui/Skeleton'

// Text skeleton
<Skeleton variant="text" />
<Skeleton variant="text" width="60%" />

// Circular (avatar)
<Skeleton variant="circular" width={40} height={40} />

// Rectangular (image)
<Skeleton variant="rectangular" height={200} />

// Product card skeleton
function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="rectangular" height={300} />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="rectangular" height={40} />
    </div>
  )
}

// Loading list
<div className="grid grid-cols-4 gap-4">
  {Array.from({ length: 8 }).map((_, i) => (
    <ProductCardSkeleton key={i} />
  ))}
</div>
```

---

### Toast

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\ui\Toast.tsx`

Toast notification component (used with toastStore).

#### Usage

```tsx
import { toast } from '@/stores/toastStore'

// Success toast
toast.success('Product added to cart!')

// Error toast
toast.error('Failed to add product')

// Info toast
toast.info('Free shipping on orders over €50')

// Warning toast
toast.warning('Low stock remaining')

// Custom duration (default: 4000ms)
toast.success('Saved!', 2000)

// In async function
async function handleSubmit() {
  try {
    await api.submit()
    toast.success('Form submitted successfully!')
  } catch (error) {
    toast.error('Failed to submit form')
  }
}

// In component
function AddToCartButton({ product }) {
  const addItem = useCartStore(state => state.addItem)

  const handleClick = () => {
    addItem(product)
    toast.success(`${product.name} added to cart!`)
  }

  return <Button onClick={handleClick}>Add to Cart</Button>
}
```

---

## Product Components

### ProductCard

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\product\ProductCard.tsx`

Product card with image gallery, quick actions, and animations.

#### Props

```typescript
interface ProductCardProps {
  product: Product
  priority?: boolean  // For image loading priority
}
```

#### Features

- Image gallery with dot navigation
- Quick add to cart
- Wishlist toggle
- Stock indicator
- Discount badge
- Featured badge
- Hover zoom effect

#### Example

```tsx
import { ProductCard } from '@/components/product/ProductCard'

// Basic usage
<ProductCard product={product} />

// Priority loading (above fold)
<div className="grid grid-cols-4 gap-4">
  {products.map((product, index) => (
    <ProductCard
      key={product.id}
      product={product}
      priority={index < 4}  // First 4 images load with priority
    />
  ))}
</div>

// Product grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

#### Product Data Structure

```typescript
{
  id: "clxxx...",
  name: "Canapé Modern",
  slug: "canape-modern",
  description: "...",
  price: 899.99,
  comparePrice: 1199.99,  // Optional - shows discount
  images: [
    "https://...",
    "https://...",
    "https://..."
  ],
  category: {
    id: "clxxx...",
    name: "Canapés",
    slug: "canapes"
  },
  stock: 15,
  featured: true,  // Shows featured badge
  createdAt: "2026-01-15T12:00:00.000Z"
}
```

---

### ProductGrid

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\product\ProductGrid.tsx`

Responsive grid layout for product cards.

#### Props

```typescript
interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  emptyMessage?: string
}
```

#### Examples

```tsx
import { ProductGrid } from '@/components/product/ProductGrid'

// Basic usage
<ProductGrid products={products} />

// Loading state
<ProductGrid products={products} isLoading={isLoading} />

// Custom empty message
<ProductGrid
  products={products}
  emptyMessage="No products found. Try adjusting your filters."
/>

// With filters
function ProductListing() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div>
      <Filters onChange={handleFilterChange} />
      <ProductGrid
        products={products}
        isLoading={isLoading}
      />
    </div>
  )
}
```

---

### ProductGallery

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\product\ProductGallery.tsx`

Image gallery with thumbnails and zoom.

#### Props

```typescript
interface ProductGalleryProps {
  images: string[]
  productName: string
}
```

#### Examples

```tsx
import { ProductGallery } from '@/components/product/ProductGallery'

// Basic usage
<ProductGallery
  images={product.images}
  productName={product.name}
/>

// In product detail page
function ProductDetail({ product }) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <ProductGallery
        images={product.images}
        productName={product.name}
      />
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        {/* ... */}
      </div>
    </div>
  )
}
```

---

### ProductReviews

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\product\ProductReviews.tsx`

Reviews section with form and list.

#### Props

```typescript
interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  averageRating: number
  reviewCount: number
}
```

#### Examples

```tsx
import { ProductReviews } from '@/components/product/ProductReviews'

// Basic usage
<ProductReviews
  productId={product.id}
  reviews={product.reviews}
  averageRating={4.5}
  reviewCount={24}
/>

// In product detail page
function ProductDetail({ product }) {
  return (
    <>
      {/* Product info */}
      <ProductReviews
        productId={product.id}
        reviews={product.reviews}
        averageRating={product.averageRating}
        reviewCount={product.reviewCount}
      />
    </>
  )
}
```

---

## Cart Components

### CartItem

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\cart\CartItem.tsx`

Individual cart item with quantity controls.

#### Props

```typescript
interface CartItemProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}
```

#### Examples

```tsx
import { CartItem } from '@/components/cart/CartItem'
import { useCartStore } from '@/stores/cartStore'

function CartList() {
  const items = useCartStore(state => state.items)
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const removeItem = useCartStore(state => state.removeItem)

  return (
    <div className="space-y-4">
      {items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={updateQuantity}
          onRemove={removeItem}
        />
      ))}
    </div>
  )
}
```

---

### CartSummary

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\cart\CartSummary.tsx`

Cart totals and checkout button.

#### Props

```typescript
interface CartSummaryProps {
  subtotal: number
  shipping: number
  total: number
  itemCount: number
  onCheckout?: () => void
}
```

#### Examples

```tsx
import { CartSummary } from '@/components/cart/CartSummary'
import { useCartStore } from '@/stores/cartStore'

function Cart() {
  const { items, total, itemCount } = useCartStore()
  const router = useRouter()

  const subtotal = total
  const shipping = subtotal >= 50 ? 0 : 4.99

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2">
        {/* Cart items */}
      </div>
      <div>
        <CartSummary
          subtotal={subtotal}
          shipping={shipping}
          total={subtotal + shipping}
          itemCount={itemCount}
          onCheckout={() => router.push('/checkout')}
        />
      </div>
    </div>
  )
}
```

---

### CartDrawer

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\cart\CartDrawer.tsx`

Sliding cart drawer.

#### Props

```typescript
interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}
```

#### Examples

```tsx
import { useState } from 'react'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ShoppingBag } from 'lucide-react'

function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const itemCount = useCartStore(state => state.itemCount)

  return (
    <>
      <button onClick={() => setIsCartOpen(true)}>
        <ShoppingBag />
        {itemCount > 0 && <span>{itemCount}</span>}
      </button>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  )
}
```

---

## Layout Components

### Header

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\layout\Header.tsx`

Main navigation header.

#### Features

- Logo
- Navigation menu
- Search bar
- Cart icon with badge
- User menu
- Mobile responsive

#### Example

```tsx
import { Header } from '@/components/layout/Header'

// In root layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

---

### Footer

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\layout\Footer.tsx`

Site footer with links and newsletter.

#### Sections

- Company info
- Quick links
- Categories
- Newsletter signup
- Social media
- Payment methods
- Legal links

#### Example

```tsx
import { Footer } from '@/components/layout/Footer'

// In root layout
<Footer />
```

---

### SearchBar

**Location:** `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\layout\SearchBar.tsx`

Search input with autocomplete.

#### Example

```tsx
import { SearchBar } from '@/components/layout/SearchBar'

// In header
<SearchBar onSearch={handleSearch} />

// Standalone
<div className="max-w-2xl mx-auto">
  <SearchBar placeholder="Search products..." />
</div>
```

---

## Usage Patterns

### Form Handling

```tsx
import { useState } from 'react'
import { Input, Button } from '@/components/ui'

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(formData)
      toast.success('Login successful!')
    } catch (error) {
      setErrors(error.errors)
      toast.error('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        error={errors.password}
      />
      <Button type="submit" fullWidth isLoading={isLoading}>
        Sign In
      </Button>
    </form>
  )
}
```

---

### Data Fetching

```tsx
import { useState, useEffect } from 'react'
import { ProductGrid, Spinner } from '@/components'

function ProductListing() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        setProducts(data.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (isLoading) return <Spinner />
  if (error) return <div>Error: {error}</div>

  return <ProductGrid products={products} />
}
```

---

### State Management

```tsx
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/Button'
import { toast } from '@/stores/toastStore'

function AddToCartButton({ product }) {
  const addItem = useCartStore(state => state.addItem)
  const isInCart = useCartStore(state => state.isInCart(product.id))

  const handleClick = () => {
    addItem(product, 1)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <Button
      onClick={handleClick}
      variant={isInCart ? 'success' : 'primary'}
    >
      {isInCart ? 'In Cart' : 'Add to Cart'}
    </Button>
  )
}
```

---

### Responsive Layout

```tsx
// Mobile-first responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// Conditional rendering based on screen size
function Header() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <header>
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
    </header>
  )
}
```

---

## Best Practices

### Component Composition

```tsx
// Good: Composable components
<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>

// Avoid: Monolithic components with too many props
<Card
  title="Title"
  content="Content"
  footer={<Button />}
  showHeader={true}
  headerStyle="..."
  // Too many props!
/>
```

### Performance Optimization

```tsx
import { memo } from 'react'

// Memoize expensive components
export const ProductCard = memo(function ProductCard({ product }) {
  // Component implementation
})

// Use keys in lists
{products.map(product => (
  <ProductCard key={product.id} product={product} />
))}

// Lazy load heavy components
const ProductGallery = dynamic(
  () => import('@/components/product/ProductGallery'),
  { loading: () => <Spinner /> }
)
```

### Accessibility

```tsx
// Use semantic HTML
<button aria-label="Add to cart">
  <ShoppingBag />
</button>

// Proper form labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Focus management
const buttonRef = useRef()

useEffect(() => {
  if (isOpen) {
    buttonRef.current?.focus()
  }
}, [isOpen])
```

---

For more details, see the main documentation:
- **Full Documentation**: `C:\Users\freex\Desktop\Projet VS Code\VIVR\DOCUMENTATION.md`
- **API Reference**: `C:\Users\freex\Desktop\Projet VS Code\VIVR\docs\API_REFERENCE.md`

**Last Updated:** 2026-01-22
