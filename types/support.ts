// Support System Types for VIVR E-commerce

// Ticket Types
export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'AWAITING_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED'

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type TicketCategory =
  | 'ORDER'
  | 'SHIPPING'
  | 'RETURN'
  | 'PAYMENT'
  | 'PRODUCT'
  | 'ACCOUNT'
  | 'TECHNICAL'
  | 'OTHER'

export interface SupportTicket {
  id: string
  ticketNumber: string
  userId?: string
  email: string
  name: string
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  orderId?: string
  messages: TicketMessage[]
  tags: string[]
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export interface TicketMessage {
  id: string
  ticketId: string
  content: string
  attachments: string[]
  isStaffReply: boolean
  authorName: string
  authorEmail: string
  createdAt: Date
}

// FAQ Types
export type FAQCategory =
  | 'commandes'
  | 'livraison'
  | 'retours'
  | 'paiement'
  | 'produits'
  | 'compte'

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: FAQCategory
  helpful: number
  notHelpful: number
  order: number
  keywords: string[]
}

export interface FAQCategoryInfo {
  id: FAQCategory
  name: string
  description: string
  icon: string
  itemCount: number
}

// Help Center Types
export interface HelpArticle {
  id: string
  slug: string
  title: string
  content: string
  category: FAQCategory
  tags: string[]
  views: number
  helpful: number
  createdAt: Date
  updatedAt: Date
}

// Contact Form Types
export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  category: TicketCategory
  orderId?: string
  message: string
  attachments?: File[]
}

// Chat Types
export type ChatMessageType = 'user' | 'bot' | 'system'

export interface ChatMessage {
  id: string
  type: ChatMessageType
  content: string
  timestamp: Date
  options?: ChatOption[]
  isTyping?: boolean
}

export interface ChatOption {
  id: string
  label: string
  value: string
  icon?: string
}

export interface ChatSession {
  id: string
  userId?: string
  messages: ChatMessage[]
  startedAt: Date
  endedAt?: Date
  escalatedToHuman: boolean
  ticketId?: string
}

// Response Templates
export interface ResponseTemplate {
  id: string
  name: string
  category: TicketCategory
  subject: string
  content: string
  variables: string[]
  language: 'fr' | 'en'
}

// Support Metrics
export interface SupportMetrics {
  openTickets: number
  resolvedToday: number
  avgResponseTime: number // in minutes
  avgResolutionTime: number // in hours
  customerSatisfaction: number // percentage
  ticketsByCategory: Record<TicketCategory, number>
  ticketsByPriority: Record<TicketPriority, number>
}

// Order Tracking
export type OrderTrackingStatus =
  | 'order_placed'
  | 'payment_confirmed'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'

export interface TrackingEvent {
  status: OrderTrackingStatus
  timestamp: Date
  location?: string
  description: string
  isCompleted: boolean
}

export interface OrderTrackingInfo {
  orderId: string
  orderNumber: string
  carrier?: string
  trackingNumber?: string
  estimatedDelivery?: Date
  events: TrackingEvent[]
  currentStatus: OrderTrackingStatus
}

// Return Request Types
export type ReturnReason =
  | 'defective'
  | 'wrong_item'
  | 'not_as_described'
  | 'changed_mind'
  | 'size_issue'
  | 'damaged_in_shipping'
  | 'other'

export type ReturnStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'refunded'

export interface ReturnRequest {
  id: string
  orderId: string
  orderItemId: string
  userId: string
  reason: ReturnReason
  reasonDetails: string
  status: ReturnStatus
  images?: string[]
  refundAmount?: number
  createdAt: Date
  updatedAt: Date
}

// Sentiment Analysis
export type SentimentScore = 'positive' | 'neutral' | 'negative'

export interface SentimentAnalysis {
  score: SentimentScore
  confidence: number
  keywords: string[]
  suggestedPriority: TicketPriority
}

// Smart Routing
export interface RoutingRule {
  id: string
  name: string
  conditions: RoutingCondition[]
  action: RoutingAction
  priority: number
  isActive: boolean
}

export interface RoutingCondition {
  field: 'category' | 'priority' | 'sentiment' | 'keywords' | 'orderValue'
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan'
  value: string | number
}

export interface RoutingAction {
  type: 'assign' | 'prioritize' | 'tag' | 'auto_respond'
  value: string
}
