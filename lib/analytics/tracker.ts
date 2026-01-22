/**
 * VIVR Analytics Tracker
 * Core analytics tracking implementation
 */

import {
  AnalyticsEvent,
  TrackedEvent,
  UserContext,
  DeviceContext,
  SessionContext,
  ExperimentAssignment,
  ProductEvent,
  CartEvent,
  CheckoutEvent,
  PurchaseEvent,
  PurchaseItem,
  UserEvent,
  SearchEvent,
  EngagementEvent,
} from './types'

// ============================================
// CONFIGURATION
// ============================================

interface AnalyticsConfig {
  debug: boolean
  batchSize: number
  flushInterval: number // milliseconds
  endpoint?: string
  providers: AnalyticsProvider[]
}

interface AnalyticsProvider {
  name: string
  enabled: boolean
  track: (event: TrackedEvent) => void
  identify: (userId: string, traits: Record<string, unknown>) => void
  page: (name: string, properties: Record<string, unknown>) => void
}

const defaultConfig: AnalyticsConfig = {
  debug: process.env.NODE_ENV === 'development',
  batchSize: 10,
  flushInterval: 5000,
  providers: [],
}

// ============================================
// STORAGE HELPERS
// ============================================

const STORAGE_KEYS = {
  ANONYMOUS_ID: 'vivr_anonymous_id',
  SESSION_ID: 'vivr_session_id',
  SESSION_START: 'vivr_session_start',
  USER_ID: 'vivr_user_id',
  EXPERIMENTS: 'vivr_experiments',
  EVENT_QUEUE: 'vivr_event_queue',
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

function getOrCreateAnonymousId(): string {
  if (typeof window === 'undefined') return generateId()

  let anonymousId = localStorage.getItem(STORAGE_KEYS.ANONYMOUS_ID)
  if (!anonymousId) {
    anonymousId = generateId()
    localStorage.setItem(STORAGE_KEYS.ANONYMOUS_ID, anonymousId)
  }
  return anonymousId
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return generateId()

  const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  const now = Date.now()

  let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID)
  const sessionStart = sessionStorage.getItem(STORAGE_KEYS.SESSION_START)

  // Check if session has expired
  if (sessionId && sessionStart) {
    const lastActivity = parseInt(sessionStart, 10)
    if (now - lastActivity > SESSION_TIMEOUT) {
      sessionId = null // Session expired
    }
  }

  if (!sessionId) {
    sessionId = generateId()
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
  }

  // Update last activity
  sessionStorage.setItem(STORAGE_KEYS.SESSION_START, now.toString())

  return sessionId
}

// ============================================
// CONTEXT BUILDERS
// ============================================

function buildUserContext(): UserContext {
  const userId = typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEYS.USER_ID) || undefined
    : undefined

  return {
    userId,
    sessionId: getOrCreateSessionId(),
    anonymousId: getOrCreateAnonymousId(),
    isAuthenticated: !!userId,
  }
}

function buildDeviceContext(): DeviceContext {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      platform: 'web',
      browser: 'unknown',
      browserVersion: '',
      os: 'unknown',
      osVersion: '',
      deviceType: 'desktop',
      screenWidth: 0,
      screenHeight: 0,
      viewportWidth: 0,
      viewportHeight: 0,
      language: 'fr',
      timezone: 'Europe/Paris',
    }
  }

  const ua = navigator.userAgent
  const isMobile = /Mobile|Android|iPhone/i.test(ua)
  const isTablet = /Tablet|iPad/i.test(ua)

  return {
    userAgent: ua,
    platform: isMobile ? 'mobile_web' : 'web',
    browser: getBrowserName(ua),
    browserVersion: getBrowserVersion(ua),
    os: getOSName(ua),
    osVersion: getOSVersion(ua),
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    screenWidth: screen.width,
    screenHeight: screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

function buildSessionContext(): SessionContext {
  if (typeof window === 'undefined') {
    return {
      sessionId: generateId(),
      sessionStart: new Date(),
      pageViewCount: 0,
      eventCount: 0,
      landingPage: '',
    }
  }

  const urlParams = new URLSearchParams(window.location.search)

  return {
    sessionId: getOrCreateSessionId(),
    sessionStart: new Date(),
    pageViewCount: parseInt(sessionStorage.getItem('pageViewCount') || '0', 10),
    eventCount: parseInt(sessionStorage.getItem('eventCount') || '0', 10),
    referrer: document.referrer || undefined,
    utmSource: urlParams.get('utm_source') || undefined,
    utmMedium: urlParams.get('utm_medium') || undefined,
    utmCampaign: urlParams.get('utm_campaign') || undefined,
    utmContent: urlParams.get('utm_content') || undefined,
    utmTerm: urlParams.get('utm_term') || undefined,
    landingPage: sessionStorage.getItem('landingPage') || window.location.pathname,
  }
}

function getExperimentAssignments(): ExperimentAssignment[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// ============================================
// UA PARSING HELPERS
// ============================================

function getBrowserName(ua: string): string {
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  return 'unknown'
}

function getBrowserVersion(ua: string): string {
  const match = ua.match(/(Chrome|Safari|Firefox|Edg|OPR)\/(\d+)/)
  return match ? match[2] : ''
}

function getOSName(ua: string): string {
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS'
  return 'unknown'
}

function getOSVersion(ua: string): string {
  const match = ua.match(/(Windows NT|Mac OS X|Android) ([\d._]+)/)
  return match ? match[2].replace(/_/g, '.') : ''
}

// ============================================
// ANALYTICS TRACKER CLASS
// ============================================

class AnalyticsTracker {
  private config: AnalyticsConfig
  private eventQueue: TrackedEvent[] = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.startFlushTimer()
  }

  // ============================================
  // CORE TRACKING
  // ============================================

  private track(event: AnalyticsEvent): void {
    const trackedEvent: TrackedEvent = {
      event,
      timestamp: new Date(),
      user: buildUserContext(),
      device: buildDeviceContext(),
      session: buildSessionContext(),
      experiments: getExperimentAssignments(),
    }

    // Debug logging
    if (this.config.debug) {
      console.log('[Analytics]', event.category, event.action, trackedEvent)
    }

    // Add to queue
    this.eventQueue.push(trackedEvent)

    // Increment event count
    if (typeof window !== 'undefined') {
      const count = parseInt(sessionStorage.getItem('eventCount') || '0', 10)
      sessionStorage.setItem('eventCount', (count + 1).toString())
    }

    // Send to providers
    this.config.providers.forEach((provider) => {
      if (provider.enabled) {
        try {
          provider.track(trackedEvent)
        } catch (error) {
          console.error(`[Analytics] Provider ${provider.name} error:`, error)
        }
      }
    })

    // Check if we should flush
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush()
    }
  }

  private startFlushTimer(): void {
    if (typeof window === 'undefined') return

    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    if (this.config.endpoint) {
      try {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events }),
        })
      } catch (error) {
        // Re-add events to queue on failure
        this.eventQueue = [...events, ...this.eventQueue]
        console.error('[Analytics] Failed to flush events:', error)
      }
    }
  }

  // ============================================
  // USER IDENTIFICATION
  // ============================================

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return

    localStorage.setItem(STORAGE_KEYS.USER_ID, userId)

    this.config.providers.forEach((provider) => {
      if (provider.enabled) {
        provider.identify(userId, traits || {})
      }
    })

    if (this.config.debug) {
      console.log('[Analytics] Identify:', userId, traits)
    }
  }

  reset(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(STORAGE_KEYS.USER_ID)
    sessionStorage.clear()
  }

  // ============================================
  // PAGE TRACKING
  // ============================================

  page(name: string, path: string, properties?: Record<string, unknown>): void {
    // Increment page view count
    if (typeof window !== 'undefined') {
      const count = parseInt(sessionStorage.getItem('pageViewCount') || '0', 10)
      sessionStorage.setItem('pageViewCount', (count + 1).toString())

      // Set landing page if first page view
      if (count === 0) {
        sessionStorage.setItem('landingPage', path)
      }
    }

    this.track({
      category: 'page_view',
      action: 'view',
      page: name,
      path,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      title: typeof document !== 'undefined' ? document.title : undefined,
    })

    this.config.providers.forEach((provider) => {
      if (provider.enabled) {
        provider.page(name, { path, ...properties })
      }
    })
  }

  // ============================================
  // PRODUCT TRACKING
  // ============================================

  productView(product: {
    id: string
    name: string
    category: string
    price: number
    comparePrice?: number
    position?: number
    listName?: string
  }): void {
    this.track({
      category: 'product',
      action: 'view',
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      productPrice: product.price,
      productComparePrice: product.comparePrice,
      position: product.position,
      listName: product.listName,
    })
  }

  productQuickView(product: { id: string; name: string; category: string; price: number }): void {
    this.track({
      category: 'product',
      action: 'quick_view',
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      productPrice: product.price,
    })
  }

  productImageInteraction(
    product: { id: string; name: string; category: string; price: number },
    action: 'image_zoom' | 'image_change'
  ): void {
    this.track({
      category: 'product',
      action,
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      productPrice: product.price,
    })
  }

  // ============================================
  // CART TRACKING
  // ============================================

  cartAdd(product: {
    id: string
    name: string
    category: string
    price: number
    quantity: number
  }, cartState: { total: number; itemCount: number }): void {
    this.track({
      category: 'cart',
      action: 'add',
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      productPrice: product.price,
      quantity: product.quantity,
      cartTotal: cartState.total,
      cartItemCount: cartState.itemCount,
    })
  }

  cartRemove(product: {
    id: string
    name: string
    category: string
    price: number
  }, cartState: { total: number; itemCount: number }): void {
    this.track({
      category: 'cart',
      action: 'remove',
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      productPrice: product.price,
      cartTotal: cartState.total,
      cartItemCount: cartState.itemCount,
    })
  }

  cartUpdateQuantity(product: {
    id: string
    name: string
    category: string
    price: number
    quantity: number
  }, cartState: { total: number; itemCount: number }): void {
    this.track({
      category: 'cart',
      action: 'update_quantity',
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      productPrice: product.price,
      quantity: product.quantity,
      cartTotal: cartState.total,
      cartItemCount: cartState.itemCount,
    })
  }

  cartView(cartState: { total: number; itemCount: number }): void {
    this.track({
      category: 'cart',
      action: 'view',
      cartTotal: cartState.total,
      cartItemCount: cartState.itemCount,
    })
  }

  cartClear(): void {
    this.track({
      category: 'cart',
      action: 'clear',
    })
  }

  // ============================================
  // CHECKOUT TRACKING
  // ============================================

  checkoutBegin(cartTotal: number): void {
    this.track({
      category: 'checkout',
      action: 'begin',
      cartTotal,
    })
  }

  checkoutStep(step: number, stepName: string, cartTotal: number): void {
    this.track({
      category: 'checkout',
      action: 'step_view',
      step,
      stepName,
      cartTotal,
    })
  }

  checkoutStepComplete(step: number, stepName: string, details?: {
    shippingMethod?: string
    paymentMethod?: string
  }): void {
    this.track({
      category: 'checkout',
      action: 'step_complete',
      step,
      stepName,
      shippingMethod: details?.shippingMethod,
      paymentMethod: details?.paymentMethod,
    })
  }

  checkoutCouponApply(couponCode: string, success: boolean): void {
    this.track({
      category: 'checkout',
      action: success ? 'coupon_apply' : 'coupon_fail',
      couponCode,
    })
  }

  checkoutError(errorMessage: string, step?: number): void {
    this.track({
      category: 'checkout',
      action: 'error',
      errorMessage,
      step,
    })
  }

  checkoutAbandon(step: number, stepName: string, cartTotal: number): void {
    this.track({
      category: 'checkout',
      action: 'abandon',
      step,
      stepName,
      cartTotal,
    })
  }

  // ============================================
  // PURCHASE TRACKING
  // ============================================

  purchase(order: {
    orderId: string
    total: number
    shippingCost: number
    tax?: number
    couponCode?: string
    paymentMethod: string
    items: PurchaseItem[]
  }): void {
    this.track({
      category: 'purchase',
      action: 'complete',
      orderId: order.orderId,
      orderTotal: order.total,
      currency: 'EUR',
      itemCount: order.items.length,
      shippingCost: order.shippingCost,
      tax: order.tax,
      couponCode: order.couponCode,
      paymentMethod: order.paymentMethod,
      items: order.items,
    })
  }

  purchaseFail(orderId: string, total: number): void {
    this.track({
      category: 'purchase',
      action: 'fail',
      orderId,
      orderTotal: total,
      currency: 'EUR',
      itemCount: 0,
      shippingCost: 0,
      paymentMethod: '',
      items: [],
    })
  }

  // ============================================
  // USER TRACKING
  // ============================================

  userSignUp(method: string): void {
    this.track({
      category: 'user',
      action: 'sign_up',
      method,
    })
  }

  userLogin(method: string): void {
    this.track({
      category: 'user',
      action: 'login',
      method,
    })
  }

  userLogout(): void {
    this.track({
      category: 'user',
      action: 'logout',
    })
  }

  wishlistAdd(productId: string): void {
    this.track({
      category: 'user',
      action: 'wishlist_add',
      productId,
    })
  }

  wishlistRemove(productId: string): void {
    this.track({
      category: 'user',
      action: 'wishlist_remove',
      productId,
    })
  }

  newsletterSubscribe(): void {
    this.track({
      category: 'user',
      action: 'newsletter_subscribe',
    })
  }

  // ============================================
  // SEARCH TRACKING
  // ============================================

  search(query: string, resultCount: number, filters?: Record<string, string>): void {
    this.track({
      category: 'search',
      action: resultCount > 0 ? 'query' : 'no_results',
      query,
      resultCount,
      filters,
    })
  }

  searchResultClick(query: string, productId: string, position: number): void {
    this.track({
      category: 'search',
      action: 'result_click',
      query,
      clickedProductId: productId,
      clickedPosition: position,
    })
  }

  filterApply(filters: Record<string, string>): void {
    this.track({
      category: 'search',
      action: 'filter_apply',
      filters,
    })
  }

  sortApply(sortBy: string): void {
    this.track({
      category: 'search',
      action: 'sort_apply',
      sortBy,
    })
  }

  // ============================================
  // ENGAGEMENT TRACKING
  // ============================================

  scrollDepth(depth: 25 | 50 | 75 | 100): void {
    this.track({
      category: 'engagement',
      action: 'scroll_depth',
      depth,
    })
  }

  timeOnPage(duration: number): void {
    this.track({
      category: 'engagement',
      action: 'time_on_page',
      duration,
    })
  }

  bannerClick(element: string, destination?: string): void {
    this.track({
      category: 'engagement',
      action: 'banner_click',
      element,
      destination,
    })
  }

  promoClick(element: string, destination?: string): void {
    this.track({
      category: 'engagement',
      action: 'promo_click',
      element,
      destination,
    })
  }

  // ============================================
  // EXPERIMENT TRACKING
  // ============================================

  experimentAssignment(
    experimentId: string,
    experimentName: string,
    variantId: string,
    variantName: string
  ): void {
    this.track({
      category: 'experiment',
      action: 'assignment',
      experimentId,
      experimentName,
      variantId,
      variantName,
    })
  }

  experimentExposure(
    experimentId: string,
    experimentName: string,
    variantId: string,
    variantName: string
  ): void {
    this.track({
      category: 'experiment',
      action: 'exposure',
      experimentId,
      experimentName,
      variantId,
      variantName,
    })
  }

  experimentConversion(
    experimentId: string,
    experimentName: string,
    variantId: string,
    variantName: string,
    conversionType: string,
    conversionValue?: number
  ): void {
    this.track({
      category: 'experiment',
      action: 'conversion',
      experimentId,
      experimentName,
      variantId,
      variantName,
      conversionType,
      conversionValue,
    })
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const analytics = new AnalyticsTracker()

export { AnalyticsTracker }
export type { AnalyticsConfig, AnalyticsProvider }
