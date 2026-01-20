// Product Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  category: Category
  categoryId: string
  stock: number
  featured: boolean
  reviews: Review[]
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: string
  products?: Product[]
}

// User Types
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  addresses?: Address[]
}

export interface Address {
  id: string
  userId: string
  name: string
  street: string
  city: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

// Order Types
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  id: string
  userId: string
  user: User
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentMethod: string
  paymentId?: string
  address: Address
  createdAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  product: Product
  productId: string
  quantity: number
  price: number
}

// Review Types
export interface Review {
  id: string
  userId: string
  user: User
  productId: string
  rating: number
  title?: string
  comment?: string
  verified?: boolean
  createdAt: Date
}

// Wishlist Types
export interface WishlistItem {
  id: string
  userId: string
  product: Product
  productId: string
  createdAt: Date
}

// Cart Types
export interface CartItem {
  id: string
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Filter Types
export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'popular'
  search?: string
}
