// ============================================
// VIVR E-Commerce Financial Analytics Types
// Business Intelligence & Financial Tracking
// ============================================

// ==========================================
// REVENUE METRICS
// ==========================================

export interface RevenueMetrics {
  // Core Revenue
  totalRevenue: number
  revenueToday: number
  revenueThisWeek: number
  revenueThisMonth: number
  revenueThisYear: number

  // Growth
  dailyGrowthRate: number
  weeklyGrowthRate: number
  monthlyGrowthRate: number
  yearOverYearGrowth: number

  // Averages
  averageDailyRevenue: number
  averageWeeklyRevenue: number
  averageMonthlyRevenue: number

  // Projections
  projectedMonthlyRevenue: number
  projectedAnnualRevenue: number
}

export interface MRRMetrics {
  currentMRR: number
  previousMRR: number
  mrrGrowth: number
  mrrGrowthRate: number

  // MRR Movement
  newMRR: number        // From new customers
  expansionMRR: number  // From upsells
  churnMRR: number      // Lost revenue
  contractionMRR: number // Downgrades
  netNewMRR: number     // Net change
}

// ==========================================
// CUSTOMER METRICS
// ==========================================

export interface CustomerMetrics {
  // Counts
  totalCustomers: number
  newCustomersToday: number
  newCustomersThisWeek: number
  newCustomersThisMonth: number
  activeCustomers: number

  // Value Metrics
  averageOrderValue: number
  medianOrderValue: number
  averageRevenuePerCustomer: number
  customerLifetimeValue: number

  // Acquisition
  customerAcquisitionCost: number
  ltvCacRatio: number
  paybackPeriodMonths: number

  // Retention
  repeatPurchaseRate: number
  customerRetentionRate: number
  customerChurnRate: number

  // Segments
  oneTimeCustomers: number
  repeatCustomers: number
  vipCustomers: number  // Top 10% by spending
}

export interface CustomerCohort {
  cohortDate: string      // Month of first purchase
  customersCount: number
  totalRevenue: number
  averageOrderValue: number
  retentionRate: number[]  // Month 1, 2, 3... retention
  lifetimeValue: number
}

export interface CustomerSegment {
  name: string
  description: string
  customersCount: number
  revenue: number
  averageOrderValue: number
  orderFrequency: number
  criteria: {
    minOrders?: number
    maxOrders?: number
    minSpent?: number
    maxSpent?: number
    lastOrderDays?: number
  }
}

// ==========================================
// ORDER METRICS
// ==========================================

export interface OrderMetrics {
  // Counts
  totalOrders: number
  ordersToday: number
  ordersThisWeek: number
  ordersThisMonth: number

  // Value
  averageOrderValue: number
  medianOrderValue: number
  averageItemsPerOrder: number

  // Status Distribution
  ordersByStatus: {
    pending: number
    processing: number
    paid: number
    shipped: number
    delivered: number
    cancelled: number
    refunded: number
  }

  // Conversion
  cartConversionRate: number
  checkoutAbandonmentRate: number

  // Fulfillment
  averageFulfillmentTime: number  // hours
  onTimeDeliveryRate: number
}

export interface OrderTrend {
  date: string
  orders: number
  revenue: number
  averageOrderValue: number
}

// ==========================================
// PRODUCT & INVENTORY METRICS
// ==========================================

export interface ProductMetrics {
  productId: string
  productName: string

  // Sales
  unitsSold: number
  revenue: number
  orderCount: number

  // Profitability
  costPrice: number
  sellingPrice: number
  profitMargin: number
  profitMarginPercentage: number

  // Performance
  conversionRate: number
  viewCount: number
  addToCartRate: number

  // Inventory
  currentStock: number
  stockValue: number
  daysOfStock: number
  reorderPoint: number
}

export interface InventoryMetrics {
  // Total Values
  totalInventoryValue: number
  totalInventoryUnits: number

  // Turnover
  inventoryTurnoverRate: number
  averageDaysToSell: number

  // Stock Status
  inStockProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  overstockedProducts: number

  // Financial
  carryingCostPerUnit: number
  totalCarryingCost: number
  deadStockValue: number

  // Efficiency
  stockoutRate: number
  sellThroughRate: number
  grossMarginReturnOnInventory: number // GMROI
}

export interface InventoryItem {
  productId: string
  productName: string
  sku: string
  category: string

  // Stock
  currentStock: number
  reorderPoint: number
  reorderQuantity: number

  // Values
  unitCost: number
  unitPrice: number
  stockValue: number

  // Performance
  unitsLast30Days: number
  turnoverRate: number
  daysOfStock: number

  // Status
  status: 'healthy' | 'low' | 'critical' | 'overstocked' | 'dead'
  lastSaleDate: string | null
}

export interface DeadStockItem {
  productId: string
  productName: string
  stock: number
  value: number
  daysSinceLastSale: number
  recommendedAction: 'discount' | 'bundle' | 'liquidate' | 'donate'
}

// ==========================================
// PROFIT & MARGIN ANALYSIS
// ==========================================

export interface ProfitMetrics {
  // Gross Profit
  grossRevenue: number
  costOfGoodsSold: number
  grossProfit: number
  grossMargin: number

  // Operating
  operatingExpenses: number
  operatingProfit: number
  operatingMargin: number

  // Net
  netProfit: number
  netMargin: number

  // Per Order
  averageOrderProfit: number
  averageOrderMargin: number

  // Contribution Margin
  contributionMargin: number
  contributionMarginRatio: number
}

export interface MarginAnalysis {
  category: string
  revenue: number
  cost: number
  profit: number
  margin: number
  percentageOfTotal: number
}

export interface ProductProfitability {
  productId: string
  productName: string
  category: string

  revenue: number
  cost: number
  profit: number
  margin: number

  unitsSold: number
  profitPerUnit: number

  rank: number
  profitContribution: number  // % of total profit
}

// ==========================================
// COST TRACKING
// ==========================================

export interface CostMetrics {
  // Cost Categories
  productCosts: number
  shippingCosts: number
  paymentProcessingFees: number
  marketingCosts: number
  operationalCosts: number

  // Per Unit Costs
  costPerOrder: number
  costPerCustomer: number
  costPerAcquisition: number

  // Ratios
  costToRevenueRatio: number
  shippingCostRatio: number
  processingFeeRatio: number
}

export interface CostBreakdown {
  category: string
  amount: number
  percentage: number
  trend: 'increasing' | 'decreasing' | 'stable'
  previousAmount: number
}

export interface ShippingAnalysis {
  totalShippingCost: number
  totalShippingRevenue: number
  shippingProfit: number

  averageShippingCost: number
  averageShippingCharged: number

  freeShippingOrders: number
  freeShippingThreshold: number
  freeShippingCost: number

  byCarrier: {
    carrier: string
    orders: number
    cost: number
    averageCost: number
  }[]
}

// ==========================================
// CASH FLOW
// ==========================================

export interface CashFlowMetrics {
  // Current Position
  currentCashBalance: number
  accountsReceivable: number
  accountsPayable: number

  // Inflows
  totalInflows: number
  salesInflow: number
  refundsOutflow: number

  // Outflows
  totalOutflows: number
  inventoryPurchases: number
  operatingExpenses: number

  // Net
  netCashFlow: number
  runwayMonths: number
  burnRate: number
}

export interface CashFlowStatement {
  period: string

  operating: {
    salesReceipts: number
    refunds: number
    paymentFees: number
    shippingCosts: number
    netOperating: number
  }

  investing: {
    inventoryPurchases: number
    equipmentPurchases: number
    netInvesting: number
  }

  financing: {
    loanProceeds: number
    loanPayments: number
    netFinancing: number
  }

  netCashFlow: number
  openingBalance: number
  closingBalance: number
}

// ==========================================
// PRICING INTELLIGENCE
// ==========================================

export interface PricingMetrics {
  productId: string
  productName: string

  // Current Pricing
  currentPrice: number
  comparePrice: number
  costPrice: number

  // Margins
  grossMargin: number
  targetMargin: number
  marginGap: number

  // Elasticity
  priceElasticity: number
  optimalPrice: number

  // Performance
  conversionAtPrice: number
  revenueAtPrice: number
}

export interface DynamicPricingRecommendation {
  productId: string
  productName: string
  currentPrice: number
  recommendedPrice: number
  reason: string
  expectedImpact: {
    revenueChange: number
    marginChange: number
    conversionChange: number
  }
  confidence: 'high' | 'medium' | 'low'
}

export interface DiscountAnalysis {
  discountCode: string
  uses: number
  totalDiscount: number
  ordersGenerated: number
  revenueGenerated: number
  averageOrderValue: number
  roi: number
  newCustomersAcquired: number
}

// ==========================================
// KPI DASHBOARD
// ==========================================

export interface DashboardKPIs {
  // Primary KPIs
  revenue: {
    current: number
    previous: number
    change: number
    changePercent: number
    target: number
    targetProgress: number
  }

  orders: {
    current: number
    previous: number
    change: number
    changePercent: number
  }

  averageOrderValue: {
    current: number
    previous: number
    change: number
    changePercent: number
  }

  customerAcquisitionCost: {
    current: number
    previous: number
    change: number
    changePercent: number
    target: number
  }

  customerLifetimeValue: {
    current: number
    previous: number
    change: number
    changePercent: number
  }

  grossMargin: {
    current: number
    previous: number
    change: number
    changePercent: number
  }

  conversionRate: {
    current: number
    previous: number
    change: number
    changePercent: number
  }

  // Health Score (0-100)
  overallHealthScore: number
  healthFactors: {
    factor: string
    score: number
    status: 'good' | 'warning' | 'critical'
  }[]
}

// ==========================================
// ALERTS & THRESHOLDS
// ==========================================

export interface AlertThreshold {
  id: string
  metric: string
  condition: 'above' | 'below' | 'equals'
  value: number
  severity: 'info' | 'warning' | 'critical'
  enabled: boolean
}

export interface FinancialAlert {
  id: string
  type: 'revenue' | 'margin' | 'inventory' | 'cost' | 'cash_flow'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  metric: string
  currentValue: number
  threshold: number
  createdAt: Date
  acknowledged: boolean
}

// ==========================================
// REPORTING
// ==========================================

export interface ReportConfig {
  id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  metrics: string[]
  recipients: string[]
  format: 'pdf' | 'csv' | 'excel'
  enabled: boolean
  lastSent: Date | null
  nextScheduled: Date
}

export interface ReportData {
  reportId: string
  reportName: string
  period: {
    start: Date
    end: Date
  }
  generatedAt: Date

  summary: {
    keyMetrics: {
      name: string
      value: number
      change: number
      trend: 'up' | 'down' | 'stable'
    }[]
    highlights: string[]
    concerns: string[]
    recommendations: string[]
  }

  sections: {
    title: string
    data: Record<string, unknown>
    charts: {
      type: 'line' | 'bar' | 'pie' | 'area'
      title: string
      data: unknown[]
    }[]
  }[]
}

// ==========================================
// FORECASTING
// ==========================================

export interface ForecastData {
  period: string
  actual: number | null
  forecast: number
  lowerBound: number
  upperBound: number
  confidence: number
}

export interface RevenueForecast {
  model: 'linear' | 'seasonal' | 'exponential'
  accuracy: number
  data: ForecastData[]

  summary: {
    nextMonth: number
    nextQuarter: number
    nextYear: number
    growthRate: number
  }
}

export interface InventoryForecast {
  productId: string
  productName: string
  currentStock: number

  dailyDemand: number
  weeklyDemand: number

  stockoutDate: Date | null
  reorderDate: Date | null

  recommendations: {
    reorderQuantity: number
    reorderDate: Date
    confidence: number
  }
}

// ==========================================
// COMPARATIVE ANALYSIS
// ==========================================

export interface PeriodComparison {
  metric: string
  currentPeriod: {
    value: number
    label: string
  }
  previousPeriod: {
    value: number
    label: string
  }
  change: number
  changePercent: number
  trend: 'improving' | 'declining' | 'stable'
}

export interface CategoryPerformance {
  categoryId: string
  categoryName: string

  revenue: number
  revenueShare: number

  orders: number
  ordersShare: number

  unitsSold: number
  averageOrderValue: number

  margin: number
  profitContribution: number

  trend: 'growing' | 'declining' | 'stable'
  growthRate: number
}

// ==========================================
// EXPORT TYPES
// ==========================================

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json'
  dateRange: {
    start: Date
    end: Date
  }
  metrics: string[]
  groupBy?: 'day' | 'week' | 'month'
  includeCharts?: boolean
}

export interface ExportResult {
  success: boolean
  filename: string
  downloadUrl: string
  expiresAt: Date
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface AnalyticsResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    period: {
      start: Date
      end: Date
    }
    generatedAt: Date
    cached: boolean
    cacheExpiry: Date
  }
}

export interface TimeSeriesDataPoint {
  date: string
  value: number
  label?: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}
