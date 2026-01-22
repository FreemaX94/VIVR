/**
 * VIVR Analytics Types
 * Comprehensive type definitions for event tracking and experimentation
 */

// ============================================
// EVENT TYPES
// ============================================

export type EventCategory =
  | 'page_view'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'purchase'
  | 'user'
  | 'search'
  | 'navigation'
  | 'engagement'
  | 'experiment'

export type PageViewEvent = {
  category: 'page_view'
  action: 'view'
  page: string
  path: string
  referrer?: string
  title?: string
}

export type ProductEvent = {
  category: 'product'
  action:
    | 'view'
    | 'quick_view'
    | 'image_zoom'
    | 'image_change'
    | 'size_select'
    | 'color_select'
    | 'review_read'
    | 'review_helpful'
    | 'share'
    | 'compare'
  productId: string
  productName: string
  productCategory: string
  productPrice: number
  productComparePrice?: number
  position?: number // Position in list
  listName?: string // Which list (featured, search, category)
}

export type CartEvent = {
  category: 'cart'
  action:
    | 'add'
    | 'remove'
    | 'update_quantity'
    | 'view'
    | 'clear'
    | 'save_for_later'
    | 'move_to_wishlist'
  productId?: string
  productName?: string
  productCategory?: string
  productPrice?: number
  quantity?: number
  cartTotal?: number
  cartItemCount?: number
}

export type CheckoutEvent = {
  category: 'checkout'
  action:
    | 'begin'
    | 'step_view'
    | 'step_complete'
    | 'address_enter'
    | 'shipping_select'
    | 'payment_select'
    | 'coupon_apply'
    | 'coupon_fail'
    | 'error'
    | 'abandon'
  step?: number
  stepName?: string
  shippingMethod?: string
  paymentMethod?: string
  couponCode?: string
  errorMessage?: string
  cartTotal?: number
}

export type PurchaseEvent = {
  category: 'purchase'
  action: 'complete' | 'fail'
  orderId: string
  orderTotal: number
  currency: string
  itemCount: number
  shippingCost: number
  tax?: number
  couponCode?: string
  paymentMethod: string
  items: PurchaseItem[]
}

export type PurchaseItem = {
  productId: string
  productName: string
  productCategory: string
  price: number
  quantity: number
}

export type UserEvent = {
  category: 'user'
  action:
    | 'sign_up'
    | 'login'
    | 'logout'
    | 'password_reset'
    | 'profile_update'
    | 'newsletter_subscribe'
    | 'newsletter_unsubscribe'
    | 'wishlist_add'
    | 'wishlist_remove'
    | 'review_submit'
  method?: string // google, email, etc.
  productId?: string
}

export type SearchEvent = {
  category: 'search'
  action: 'query' | 'filter_apply' | 'sort_apply' | 'no_results' | 'result_click'
  query?: string
  filters?: Record<string, string>
  sortBy?: string
  resultCount?: number
  clickedPosition?: number
  clickedProductId?: string
}

export type NavigationEvent = {
  category: 'navigation'
  action:
    | 'menu_open'
    | 'menu_close'
    | 'category_select'
    | 'breadcrumb_click'
    | 'footer_link'
    | 'header_link'
    | 'logo_click'
  target?: string
  source?: string
}

export type EngagementEvent = {
  category: 'engagement'
  action:
    | 'scroll_depth'
    | 'time_on_page'
    | 'video_play'
    | 'video_complete'
    | 'banner_click'
    | 'promo_click'
    | 'social_share'
    | 'copy_text'
  depth?: number // For scroll (25, 50, 75, 100)
  duration?: number // For time on page
  element?: string
  destination?: string
}

export type ExperimentEvent = {
  category: 'experiment'
  action: 'assignment' | 'exposure' | 'conversion' | 'error'
  experimentId: string
  experimentName: string
  variantId: string
  variantName: string
  conversionType?: string
  conversionValue?: number
}

export type AnalyticsEvent =
  | PageViewEvent
  | ProductEvent
  | CartEvent
  | CheckoutEvent
  | PurchaseEvent
  | UserEvent
  | SearchEvent
  | NavigationEvent
  | EngagementEvent
  | ExperimentEvent

// ============================================
// USER CONTEXT
// ============================================

export interface UserContext {
  userId?: string
  sessionId: string
  anonymousId: string
  isAuthenticated: boolean
  userProperties?: {
    email?: string
    name?: string
    createdAt?: Date
    totalOrders?: number
    totalSpent?: number
    segment?: UserSegment
  }
}

export type UserSegment =
  | 'new_visitor'
  | 'returning_visitor'
  | 'first_time_buyer'
  | 'repeat_buyer'
  | 'high_value'
  | 'at_risk'
  | 'churned'

// ============================================
// DEVICE & SESSION CONTEXT
// ============================================

export interface DeviceContext {
  userAgent: string
  platform: 'web' | 'mobile_web' | 'ios' | 'android'
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  deviceType: 'desktop' | 'tablet' | 'mobile'
  screenWidth: number
  screenHeight: number
  viewportWidth: number
  viewportHeight: number
  language: string
  timezone: string
}

export interface SessionContext {
  sessionId: string
  sessionStart: Date
  pageViewCount: number
  eventCount: number
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  landingPage: string
}

// ============================================
// TRACKED EVENT PAYLOAD
// ============================================

export interface TrackedEvent {
  event: AnalyticsEvent
  timestamp: Date
  user: UserContext
  device: DeviceContext
  session: SessionContext
  experiments: ExperimentAssignment[]
}

export interface ExperimentAssignment {
  experimentId: string
  variantId: string
  assignedAt: Date
}

// ============================================
// FUNNEL DEFINITIONS
// ============================================

export interface FunnelStep {
  name: string
  eventCategory: EventCategory
  eventAction: string
  additionalFilters?: Record<string, unknown>
}

export interface FunnelDefinition {
  id: string
  name: string
  description: string
  steps: FunnelStep[]
}

// ============================================
// KPI METRICS
// ============================================

export interface KPIMetric {
  id: string
  name: string
  description: string
  type: 'count' | 'sum' | 'average' | 'ratio' | 'percentage'
  calculation: string
  unit?: string
  goal?: number
  warningThreshold?: number
  criticalThreshold?: number
}

export interface MetricValue {
  metricId: string
  value: number
  previousValue?: number
  change?: number
  changePercentage?: number
  timestamp: Date
  period: 'hour' | 'day' | 'week' | 'month'
}
