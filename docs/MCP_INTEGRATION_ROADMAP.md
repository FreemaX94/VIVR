# MCP Integration Roadmap for VIVR E-Commerce

## Executive Summary

This document outlines a comprehensive strategy for integrating Model Context Protocol (MCP) into the VIVR e-commerce platform. MCP enables structured communication between AI models and external systems, allowing for sophisticated AI-powered features that enhance customer experience, automate operations, and provide intelligent insights.

---

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [MCP Server Opportunities](#mcp-server-opportunities)
3. [AI-Powered Features](#ai-powered-features)
4. [Integration Points](#integration-points)
5. [Use Cases](#use-cases)
6. [Implementation Phases](#implementation-phases)
7. [Technical Specifications](#technical-specifications)
8. [Security Considerations](#security-considerations)

---

## Current Architecture Analysis

### Existing Tech Stack

```
Frontend:    Next.js 14 + React 18 + TypeScript
Styling:     Tailwind CSS + Framer Motion
State:       Zustand (cart, wishlist, user)
Database:    PostgreSQL + Prisma ORM
Auth:        NextAuth.js
Payments:    Stripe
```

### Data Models Available for MCP Integration

| Model       | MCP Relevance                                      |
|-------------|---------------------------------------------------|
| Product     | AI descriptions, recommendations, search          |
| Category    | Taxonomy understanding, navigation suggestions    |
| Order       | Order tracking, analytics, customer support       |
| Review      | Sentiment analysis, response generation           |
| User        | Personalization, behavior analysis                |
| Wishlist    | Preference learning, recommendation targeting     |

### Current API Endpoints

```
GET/POST  /api/products          - Product catalog
GET       /api/products/[slug]   - Product details
GET       /api/categories        - Category listing
GET/POST  /api/orders            - Order management
POST      /api/auth/register     - User registration
POST      /api/stripe/checkout   - Payment processing
POST      /api/stripe/webhook    - Payment webhooks
```

---

## MCP Server Opportunities

### 1. Product Catalog MCP Server

**Purpose**: Expose product data and catalog operations to AI models for intelligent product interactions.

```typescript
// mcp-servers/product-catalog/server.ts

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'vivr-product-catalog',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
    resources: {},
    prompts: {},
  },
});

// Tool Definitions
const tools = [
  {
    name: 'search_products',
    description: 'Search products by query, category, price range, or attributes',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        category: { type: 'string', description: 'Category slug' },
        minPrice: { type: 'number', description: 'Minimum price' },
        maxPrice: { type: 'number', description: 'Maximum price' },
        featured: { type: 'boolean', description: 'Featured products only' },
        limit: { type: 'number', default: 10 },
      },
      required: [],
    },
  },
  {
    name: 'get_product_details',
    description: 'Get detailed information about a specific product',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Product slug' },
        productId: { type: 'string', description: 'Product ID' },
      },
    },
  },
  {
    name: 'get_similar_products',
    description: 'Find products similar to a given product',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'Source product ID' },
        limit: { type: 'number', default: 5 },
      },
      required: ['productId'],
    },
  },
  {
    name: 'check_stock_availability',
    description: 'Check if a product is in stock',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        quantity: { type: 'number', default: 1 },
      },
      required: ['productId'],
    },
  },
  {
    name: 'get_category_products',
    description: 'List all products in a category',
    inputSchema: {
      type: 'object',
      properties: {
        categorySlug: { type: 'string' },
        sortBy: { type: 'string', enum: ['price-asc', 'price-desc', 'newest', 'popular'] },
      },
      required: ['categorySlug'],
    },
  },
];

// Resource Definitions
const resources = [
  {
    uri: 'vivr://products/catalog',
    name: 'Product Catalog',
    description: 'Full product catalog with all items',
    mimeType: 'application/json',
  },
  {
    uri: 'vivr://products/categories',
    name: 'Category List',
    description: 'All product categories',
    mimeType: 'application/json',
  },
  {
    uri: 'vivr://products/featured',
    name: 'Featured Products',
    description: 'Currently featured products',
    mimeType: 'application/json',
  },
];
```

**Capabilities**:
- Product search with natural language queries
- Similar product recommendations
- Stock availability checking
- Category browsing
- Price comparisons

---

### 2. Order Management MCP Server

**Purpose**: Enable AI-powered order tracking, status updates, and customer communication.

```typescript
// mcp-servers/order-management/server.ts

const orderTools = [
  {
    name: 'get_order_status',
    description: 'Get current status of an order',
    inputSchema: {
      type: 'object',
      properties: {
        orderNumber: { type: 'string', description: 'Order number (e.g., ORD-XXXX)' },
        orderId: { type: 'string', description: 'Order ID' },
      },
    },
  },
  {
    name: 'get_user_orders',
    description: 'Get all orders for a user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        status: {
          type: 'string',
          enum: ['PENDING', 'PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']
        },
        limit: { type: 'number', default: 10 },
      },
      required: ['userId'],
    },
  },
  {
    name: 'estimate_delivery',
    description: 'Estimate delivery date for an order',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        postalCode: { type: 'string' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'get_order_items',
    description: 'Get items in a specific order',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'search_orders',
    description: 'Search orders by various criteria',
    inputSchema: {
      type: 'object',
      properties: {
        dateFrom: { type: 'string', format: 'date' },
        dateTo: { type: 'string', format: 'date' },
        minTotal: { type: 'number' },
        maxTotal: { type: 'number' },
        status: { type: 'string' },
      },
    },
  },
];
```

**Capabilities**:
- Order status tracking
- Delivery estimation
- Order history retrieval
- Order search and filtering

---

### 3. Customer Service MCP Server

**Purpose**: Power AI chatbots and support tools with context about products, orders, and policies.

```typescript
// mcp-servers/customer-service/server.ts

const customerServiceTools = [
  {
    name: 'find_order_for_support',
    description: 'Find order information for customer support inquiry',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        orderNumber: { type: 'string' },
        productName: { type: 'string' },
      },
    },
  },
  {
    name: 'get_return_policy',
    description: 'Get return policy information',
    inputSchema: {
      type: 'object',
      properties: {
        productCategory: { type: 'string' },
        orderAge: { type: 'number', description: 'Days since order' },
      },
    },
  },
  {
    name: 'check_refund_eligibility',
    description: 'Check if an order is eligible for refund',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        reason: { type: 'string' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'get_shipping_info',
    description: 'Get shipping information and tracking',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        trackingNumber: { type: 'string' },
      },
    },
  },
  {
    name: 'search_faq',
    description: 'Search frequently asked questions',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        category: { type: 'string', enum: ['shipping', 'returns', 'payment', 'products', 'account'] },
      },
      required: ['query'],
    },
  },
  {
    name: 'escalate_to_human',
    description: 'Escalate conversation to human agent',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string' },
        reason: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      },
      required: ['reason'],
    },
  },
];

// Prompts for Customer Service
const customerServicePrompts = [
  {
    name: 'greeting',
    description: 'Generate a personalized greeting for customer',
    arguments: [
      { name: 'customerName', description: 'Customer name', required: false },
      { name: 'timeOfDay', description: 'Time of day (morning/afternoon/evening)', required: false },
      { name: 'language', description: 'Preferred language', required: true },
    ],
  },
  {
    name: 'order_status_response',
    description: 'Generate order status response',
    arguments: [
      { name: 'orderStatus', required: true },
      { name: 'estimatedDelivery', required: false },
      { name: 'trackingNumber', required: false },
    ],
  },
  {
    name: 'product_recommendation_response',
    description: 'Generate product recommendation message',
    arguments: [
      { name: 'products', description: 'Array of recommended products', required: true },
      { name: 'context', description: 'Why these products are recommended', required: true },
    ],
  },
];
```

**Capabilities**:
- Context-aware customer support
- Policy lookups
- Refund eligibility checking
- FAQ search
- Human escalation

---

### 4. Analytics MCP Server

**Purpose**: Provide AI with access to business analytics for insights and reporting.

```typescript
// mcp-servers/analytics/server.ts

const analyticsTools = [
  {
    name: 'get_sales_summary',
    description: 'Get sales summary for a period',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        granularity: { type: 'string', enum: ['day', 'week', 'month'] },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: 'get_top_products',
    description: 'Get best-selling products',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['week', 'month', 'quarter', 'year'] },
        limit: { type: 'number', default: 10 },
        category: { type: 'string' },
      },
    },
  },
  {
    name: 'get_inventory_insights',
    description: 'Get inventory status and alerts',
    inputSchema: {
      type: 'object',
      properties: {
        lowStockThreshold: { type: 'number', default: 10 },
        category: { type: 'string' },
      },
    },
  },
  {
    name: 'get_customer_analytics',
    description: 'Get customer behavior analytics',
    inputSchema: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
          enum: ['acquisition', 'retention', 'lifetime_value', 'cart_abandonment']
        },
        period: { type: 'string' },
      },
      required: ['metric'],
    },
  },
  {
    name: 'get_revenue_forecast',
    description: 'Get revenue forecast based on trends',
    inputSchema: {
      type: 'object',
      properties: {
        forecastDays: { type: 'number', default: 30 },
      },
    },
  },
  {
    name: 'get_category_performance',
    description: 'Get performance metrics by category',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['week', 'month', 'quarter', 'year'] },
      },
    },
  },
];
```

**Capabilities**:
- Sales analytics and reporting
- Inventory insights
- Customer behavior analysis
- Revenue forecasting
- Category performance metrics

---

## AI-Powered Features

### 1. Product Recommendations Engine

**Integration Points**:
- Homepage personalized recommendations
- "Customers also bought" suggestions
- "You might like" on product pages
- Cart upsell suggestions

```typescript
// lib/ai/recommendations.ts

import Anthropic from '@anthropic-ai/sdk';

interface RecommendationContext {
  userId?: string;
  currentProduct?: string;
  cartItems?: string[];
  viewHistory?: string[];
  wishlist?: string[];
}

export async function getProductRecommendations(
  context: RecommendationContext
): Promise<Product[]> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Use MCP to fetch relevant product data
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    tools: [
      {
        name: 'search_products',
        description: 'Search for products matching criteria',
        input_schema: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            priceRange: { type: 'string' },
            attributes: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      {
        name: 'get_similar_products',
        description: 'Get products similar to a given product',
        input_schema: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
            limit: { type: 'number' },
          },
          required: ['productId'],
        },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Based on this customer context, recommend products:
          - View history: ${context.viewHistory?.join(', ')}
          - Cart items: ${context.cartItems?.join(', ')}
          - Wishlist: ${context.wishlist?.join(', ')}

          Provide diverse recommendations that complement their interests.`,
      },
    ],
  });

  // Process tool calls and return recommendations
  // ...
}
```

**Implementation Strategy**:

```typescript
// components/ai/RecommendationPanel.tsx

'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

interface RecommendationPanelProps {
  context: 'homepage' | 'product' | 'cart' | 'checkout';
  productId?: string;
}

export function RecommendationPanel({ context, productId }: RecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, productId }),
      });
      const data = await response.json();
      setRecommendations(data.recommendations);
      setLoading(false);
    }

    fetchRecommendations();
  }, [context, productId]);

  if (loading) return <RecommendationSkeleton />;

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold mb-4">
        {context === 'cart' ? 'Complete your look' : 'You might also like'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
```

---

### 2. Enhanced Search with AI

**Current Search**: Basic text matching on name and description.

**AI-Enhanced Search Features**:
- Natural language understanding
- Semantic search
- Typo tolerance
- Synonym handling
- Intent detection

```typescript
// app/api/ai/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { query } = await request.json();

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // First, understand the search intent
  const intentResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: `You are a search intent analyzer for a furniture/home decor e-commerce store called VIVR.

    Categories available: Luminaires, Mobilier, Decoration, Textile, Rangement

    Analyze the user's search query and extract:
    - Product type/category
    - Price intent (budget, mid-range, luxury)
    - Style preferences (modern, classic, minimalist, bohemian)
    - Color preferences
    - Size/dimension hints
    - Any specific features mentioned`,
    messages: [
      {
        role: 'user',
        content: `Analyze this search query: "${query}"`,
      },
    ],
  });

  // Extract structured intent
  const intent = parseSearchIntent(intentResponse.content[0].text);

  // Build database query based on intent
  const products = await prisma.product.findMany({
    where: buildWhereClause(intent),
    include: { category: true, reviews: true },
    take: 20,
  });

  // Rank results using AI
  const rankedProducts = await rankSearchResults(products, query, client);

  return NextResponse.json({
    success: true,
    data: rankedProducts,
    intent: intent,
    suggestions: generateSearchSuggestions(intent),
  });
}

function parseSearchIntent(analysis: string) {
  // Parse Claude's analysis into structured intent
  // ...
}

function buildWhereClause(intent: SearchIntent) {
  // Build Prisma where clause from intent
  // ...
}

async function rankSearchResults(products, query, client) {
  // Use AI to rank products by relevance
  // ...
}
```

**Search UI Enhancement**:

```typescript
// components/layout/AISearchBar.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export function AISearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) return;

    async function fetchSuggestions() {
      const response = await fetch('/api/ai/search/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: debouncedQuery }),
      });
      const data = await response.json();
      setSuggestions(data.completions);
      setAiSuggestions(data.aiSuggestions);
    }

    fetchSuggestions();
  }, [debouncedQuery]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Describe what you're looking for..."
        className="w-full px-4 py-3 rounded-xl border"
      />

      {aiSuggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 mb-2">AI understands you want:</p>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 3. Customer Support Chatbot

**Architecture**:

```
User Message
    |
    v
+-------------------+
|  Chatbot UI       |  (React Component)
+-------------------+
    |
    v
+-------------------+
|  Chat API Route   |  (/api/ai/chat)
+-------------------+
    |
    v
+-------------------+
|  Claude API       |  (with MCP Tools)
|  - Product MCP    |
|  - Order MCP      |
|  - Support MCP    |
+-------------------+
    |
    v
+-------------------+
|  Response         |
+-------------------+
```

```typescript
// app/api/ai/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const SYSTEM_PROMPT = `You are the VIVR virtual assistant, helping customers with:
- Product questions and recommendations
- Order tracking and status
- Return and refund policies
- General shopping assistance

Brand Voice:
- Friendly and approachable, but professional
- Speak French primarily (this is a French e-commerce site)
- Be concise but helpful
- Suggest specific products when relevant
- Always offer to connect with a human agent for complex issues

Available Tools:
- search_products: Find products matching customer needs
- get_order_status: Check order status
- get_product_details: Get detailed product information
- check_return_eligibility: Check if a return is possible
- escalate_to_human: Connect to human support`;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { messages, conversationId } = await request.json();

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Define MCP tools for the chatbot
  const tools = [
    {
      name: 'search_products',
      description: 'Search for products in the VIVR catalog',
      input_schema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          category: { type: 'string', description: 'Filter by category' },
          maxPrice: { type: 'number', description: 'Maximum price filter' },
        },
      },
    },
    {
      name: 'get_order_status',
      description: 'Get the current status of a customer order',
      input_schema: {
        type: 'object',
        properties: {
          orderNumber: { type: 'string', description: 'Order number' },
        },
        required: ['orderNumber'],
      },
    },
    {
      name: 'get_product_details',
      description: 'Get detailed information about a product',
      input_schema: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          productSlug: { type: 'string' },
        },
      },
    },
    {
      name: 'check_return_eligibility',
      description: 'Check if an order is eligible for return',
      input_schema: {
        type: 'object',
        properties: {
          orderId: { type: 'string' },
        },
        required: ['orderId'],
      },
    },
    {
      name: 'escalate_to_human',
      description: 'Escalate the conversation to a human agent',
      input_schema: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Reason for escalation' },
          urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['reason'],
      },
    },
  ];

  // Create message with streaming
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: tools,
    messages: messages.map(formatMessage),
  });

  // Handle tool use
  if (response.stop_reason === 'tool_use') {
    const toolResults = await handleToolCalls(response.content, session?.user?.id);
    // Continue conversation with tool results...
  }

  return NextResponse.json({
    message: response.content,
    conversationId,
  });
}

async function handleToolCalls(content: ContentBlock[], userId?: string) {
  const results = [];

  for (const block of content) {
    if (block.type === 'tool_use') {
      const result = await executeToolCall(block.name, block.input, userId);
      results.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }
  }

  return results;
}

async function executeToolCall(toolName: string, input: any, userId?: string) {
  switch (toolName) {
    case 'search_products':
      return await searchProducts(input);
    case 'get_order_status':
      return await getOrderStatus(input.orderNumber, userId);
    case 'get_product_details':
      return await getProductDetails(input);
    case 'check_return_eligibility':
      return await checkReturnEligibility(input.orderId, userId);
    case 'escalate_to_human':
      return await escalateToHuman(input, userId);
    default:
      return { error: 'Unknown tool' };
  }
}
```

**Chat UI Component**:

```typescript
// components/ai/ChatWidget.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: Product[]; // For product recommendations
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour! Je suis l\'assistant VIVR. Comment puis-je vous aider?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          products: data.products,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-4 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 z-40"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold">Assistant VIVR</h3>
                <p className="text-xs text-gray-500">En ligne</p>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">En train d'ecrire...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

### 4. AI Content Generation

**Use Cases**:
- Product descriptions
- SEO meta tags
- Marketing copy
- Review summaries

```typescript
// lib/ai/content-generation.ts

import Anthropic from '@anthropic-ai/sdk';

export async function generateProductDescription(
  product: {
    name: string;
    category: string;
    attributes: Record<string, string>;
    existingDescription?: string;
  }
): Promise<string> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: `You are a copywriter for VIVR, a premium French home decor and furniture e-commerce brand.

    Brand Voice:
    - Elegant and sophisticated
    - Emphasize quality and craftsmanship
    - Appeal to design-conscious consumers
    - Use sensory language
    - Write in French

    Description Guidelines:
    - 150-200 words
    - Highlight key features and benefits
    - Include materials and dimensions where relevant
    - End with a subtle call to action`,
    messages: [
      {
        role: 'user',
        content: `Write a product description for:

        Name: ${product.name}
        Category: ${product.category}
        Attributes: ${JSON.stringify(product.attributes)}

        ${product.existingDescription ? `Current description to improve: ${product.existingDescription}` : ''}`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export async function generateSEOMetaTags(
  product: Product
): Promise<{ title: string; description: string; keywords: string[] }> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: 'Generate SEO-optimized meta tags for e-commerce products. Output as JSON.',
    messages: [
      {
        role: 'user',
        content: `Generate meta tags for: ${product.name} in category ${product.category.name}
        Price: ${product.price} EUR
        Description: ${product.description}`,
      },
    ],
  });

  // Parse and return structured SEO data
  return JSON.parse(response.content[0].text);
}

export async function summarizeReviews(
  reviews: Review[]
): Promise<{ summary: string; pros: string[]; cons: string[]; sentiment: number }> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: 'Summarize product reviews. Identify common themes, pros, cons, and overall sentiment. Output as JSON in French.',
    messages: [
      {
        role: 'user',
        content: `Summarize these reviews:
        ${reviews.map((r) => `Rating: ${r.rating}/5 - "${r.comment}"`).join('\n')}`,
      },
    ],
  });

  return JSON.parse(response.content[0].text);
}
```

---

## Integration Points

### 1. Claude API Integration

**API Configuration**:

```typescript
// lib/ai/anthropic.ts

import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      // Optional: Configure timeout, retries, etc.
      timeout: 30000,
      maxRetries: 2,
    });
  }

  return client;
}

// Model selection based on task
export const MODELS = {
  FAST: 'claude-sonnet-4-20250514',        // Quick responses, chat
  BALANCED: 'claude-sonnet-4-20250514',    // General purpose
  POWERFUL: 'claude-opus-4-20250514',      // Complex reasoning
} as const;

// Rate limiting helper
export class AIRateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 60, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter((t) => now - t < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const waitTime = this.requests[0] + this.windowMs - now;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}
```

### 2. Tool Definitions for MCP

```typescript
// lib/mcp/tools.ts

export const VIVR_MCP_TOOLS = {
  // Product Tools
  products: [
    {
      name: 'vivr_search_products',
      description: 'Search for products in the VIVR catalog using various filters',
      input_schema: {
        type: 'object' as const,
        properties: {
          query: {
            type: 'string',
            description: 'Natural language search query'
          },
          category: {
            type: 'string',
            description: 'Category slug to filter by'
          },
          minPrice: {
            type: 'number',
            description: 'Minimum price in EUR'
          },
          maxPrice: {
            type: 'number',
            description: 'Maximum price in EUR'
          },
          inStock: {
            type: 'boolean',
            description: 'Only show in-stock items'
          },
          featured: {
            type: 'boolean',
            description: 'Only featured products'
          },
          sortBy: {
            type: 'string',
            enum: ['price-asc', 'price-desc', 'newest', 'popular'],
            description: 'Sort order for results'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results',
            default: 10
          },
        },
      },
    },
    {
      name: 'vivr_get_product',
      description: 'Get detailed information about a specific product',
      input_schema: {
        type: 'object' as const,
        properties: {
          productId: { type: 'string' },
          slug: { type: 'string' },
        },
      },
    },
    {
      name: 'vivr_get_similar_products',
      description: 'Find products similar to a given product',
      input_schema: {
        type: 'object' as const,
        properties: {
          productId: { type: 'string' },
          limit: { type: 'number', default: 5 },
        },
        required: ['productId'],
      },
    },
  ],

  // Order Tools
  orders: [
    {
      name: 'vivr_get_order_status',
      description: 'Get the current status and details of an order',
      input_schema: {
        type: 'object' as const,
        properties: {
          orderNumber: {
            type: 'string',
            description: 'Order number (e.g., ORD-XXXXXXXX)'
          },
        },
        required: ['orderNumber'],
      },
    },
    {
      name: 'vivr_track_shipment',
      description: 'Get shipping tracking information for an order',
      input_schema: {
        type: 'object' as const,
        properties: {
          orderId: { type: 'string' },
        },
        required: ['orderId'],
      },
    },
  ],

  // Customer Service Tools
  support: [
    {
      name: 'vivr_check_return_policy',
      description: 'Check return policy for a product or order',
      input_schema: {
        type: 'object' as const,
        properties: {
          orderId: { type: 'string' },
          productCategory: { type: 'string' },
        },
      },
    },
    {
      name: 'vivr_create_support_ticket',
      description: 'Create a customer support ticket',
      input_schema: {
        type: 'object' as const,
        properties: {
          subject: { type: 'string' },
          description: { type: 'string' },
          category: {
            type: 'string',
            enum: ['order', 'product', 'shipping', 'return', 'other']
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high']
          },
        },
        required: ['subject', 'description', 'category'],
      },
    },
  ],
};

// Export all tools as a flat array
export function getAllTools() {
  return [
    ...VIVR_MCP_TOOLS.products,
    ...VIVR_MCP_TOOLS.orders,
    ...VIVR_MCP_TOOLS.support,
  ];
}
```

### 3. Context Management

```typescript
// lib/ai/context.ts

import { Product, Order, User } from '@/types';

export interface AIContext {
  user?: {
    id: string;
    name?: string;
    orderHistory: number;
    memberSince: Date;
    preferences?: UserPreferences;
  };
  session: {
    viewedProducts: string[];
    cartItems: string[];
    searchHistory: string[];
  };
  conversation?: {
    id: string;
    startedAt: Date;
    messageCount: number;
    topics: string[];
  };
}

export class ContextManager {
  private context: AIContext;

  constructor(initialContext?: Partial<AIContext>) {
    this.context = {
      session: {
        viewedProducts: [],
        cartItems: [],
        searchHistory: [],
      },
      ...initialContext,
    };
  }

  addViewedProduct(productId: string) {
    if (!this.context.session.viewedProducts.includes(productId)) {
      this.context.session.viewedProducts.push(productId);
      // Keep only last 20
      if (this.context.session.viewedProducts.length > 20) {
        this.context.session.viewedProducts.shift();
      }
    }
  }

  addSearchQuery(query: string) {
    this.context.session.searchHistory.unshift(query);
    this.context.session.searchHistory = this.context.session.searchHistory.slice(0, 10);
  }

  updateCart(cartItems: string[]) {
    this.context.session.cartItems = cartItems;
  }

  setUser(user: AIContext['user']) {
    this.context.user = user;
  }

  getContextSummary(): string {
    const parts: string[] = [];

    if (this.context.user) {
      parts.push(`Customer: ${this.context.user.name || 'Guest'}, Member since ${this.context.user.memberSince}, ${this.context.user.orderHistory} orders`);
    }

    if (this.context.session.cartItems.length > 0) {
      parts.push(`Cart: ${this.context.session.cartItems.length} items`);
    }

    if (this.context.session.viewedProducts.length > 0) {
      parts.push(`Recently viewed: ${this.context.session.viewedProducts.length} products`);
    }

    if (this.context.session.searchHistory.length > 0) {
      parts.push(`Recent searches: ${this.context.session.searchHistory.slice(0, 3).join(', ')}`);
    }

    return parts.join('\n');
  }

  toJSON(): AIContext {
    return this.context;
  }
}
```

---

## Use Cases

### 1. AI Product Descriptions

**Trigger**: Admin creates/updates product without description

```typescript
// app/api/admin/products/generate-description/route.ts

export async function POST(request: NextRequest) {
  const { productId } = await request.json();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const description = await generateProductDescription({
    name: product.name,
    category: product.category.name,
    attributes: {
      price: `${product.price} EUR`,
      stock: product.stock > 0 ? 'In stock' : 'Out of stock',
    },
    existingDescription: product.description,
  });

  await prisma.product.update({
    where: { id: productId },
    data: { description },
  });

  return NextResponse.json({ success: true, description });
}
```

### 2. Smart Search

**Flow**:
1. User types natural language query
2. AI parses intent and entities
3. Query is converted to structured filters
4. Results are ranked by relevance
5. AI suggests refinements

```typescript
// Example queries and their interpretations:
// "lampe moderne moins de 200 euros" -> { category: 'luminaires', style: 'modern', maxPrice: 200 }
// "canape confortable pour petit salon" -> { category: 'mobilier', type: 'sofa', size: 'compact', feature: 'comfort' }
// "decoration murale boheme" -> { category: 'decoration', type: 'wall', style: 'bohemian' }
```

### 3. Personalization Engine

```typescript
// lib/ai/personalization.ts

export async function getPersonalizedHomepage(userId?: string) {
  const context = await buildUserContext(userId);

  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: MODELS.BALANCED,
    max_tokens: 1000,
    tools: getAllTools(),
    messages: [
      {
        role: 'user',
        content: `Based on this user context, determine what products to show on the homepage:

        ${context.getContextSummary()}

        Recommend:
        1. 4 featured products aligned with their interests
        2. 2 categories to highlight
        3. Any special offers that might interest them`,
      },
    ],
  });

  // Process response and return personalized content
  return processPersonalizationResponse(response);
}
```

### 4. Inventory Insights

```typescript
// app/api/admin/insights/inventory/route.ts

export async function GET() {
  // Get inventory data
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      stock: true,
      category: { select: { name: true } },
      orderItems: {
        where: {
          order: {
            createdAt: { gte: subDays(new Date(), 30) },
          },
        },
        select: { quantity: true },
      },
    },
  });

  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: MODELS.POWERFUL,
    max_tokens: 2000,
    system: 'You are an inventory analyst. Analyze the data and provide actionable insights in French.',
    messages: [
      {
        role: 'user',
        content: `Analyze this inventory data and identify:
        1. Products at risk of stockout (low stock, high demand)
        2. Overstocked products (high stock, low demand)
        3. Recommended reorder quantities
        4. Seasonal trends

        Data: ${JSON.stringify(products)}`,
      },
    ],
  });

  return NextResponse.json({
    insights: response.content[0].text,
    data: {
      lowStock: products.filter((p) => p.stock < 10),
      totalProducts: products.length,
    },
  });
}
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goals**:
- Set up Anthropic SDK integration
- Create basic tool definitions
- Implement rate limiting and error handling

**Tasks**:
1. [ ] Install `@anthropic-ai/sdk` package
2. [ ] Create API key management (.env)
3. [ ] Set up base AI utilities (`lib/ai/`)
4. [ ] Implement basic error handling
5. [ ] Create tool execution framework
6. [ ] Add logging and monitoring

**Deliverables**:
- Working Claude API integration
- Basic tool infrastructure
- Error handling middleware

### Phase 2: Core Features (Weeks 3-4)

**Goals**:
- Launch customer support chatbot
- Implement AI-enhanced search

**Tasks**:
1. [ ] Build ChatWidget component
2. [ ] Create chat API endpoint
3. [ ] Implement product search tools
4. [ ] Add order status tools
5. [ ] Create search enhancement API
6. [ ] Build intent parser

**Deliverables**:
- Functional chatbot
- AI-powered search
- Tool execution for products/orders

### Phase 3: Personalization (Weeks 5-6)

**Goals**:
- Launch recommendation engine
- Implement personalization

**Tasks**:
1. [ ] Build context management system
2. [ ] Create recommendation API
3. [ ] Implement user preference learning
4. [ ] Add personalized homepage
5. [ ] Create "You might like" components
6. [ ] Build cart suggestions

**Deliverables**:
- Recommendation engine
- Personalized content
- User preference tracking

### Phase 4: Content & Analytics (Weeks 7-8)

**Goals**:
- AI content generation
- Business analytics with AI

**Tasks**:
1. [ ] Create admin content generation tools
2. [ ] Build product description generator
3. [ ] Implement SEO tag generator
4. [ ] Create review summarizer
5. [ ] Build analytics dashboard
6. [ ] Implement inventory insights

**Deliverables**:
- Content generation tools
- Analytics MCP server
- Admin dashboard enhancements

### Phase 5: MCP Servers (Weeks 9-10)

**Goals**:
- Deploy standalone MCP servers
- Enable external integrations

**Tasks**:
1. [ ] Create Product Catalog MCP server
2. [ ] Create Order Management MCP server
3. [ ] Create Customer Service MCP server
4. [ ] Create Analytics MCP server
5. [ ] Set up server authentication
6. [ ] Create documentation

**Deliverables**:
- 4 MCP servers deployed
- API documentation
- Integration guides

---

## Technical Specifications

### Environment Variables

```env
# .env.local

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# AI Feature Flags
ENABLE_AI_CHAT=true
ENABLE_AI_SEARCH=true
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_AI_CONTENT=false

# Rate Limits
AI_RATE_LIMIT_REQUESTS=100
AI_RATE_LIMIT_WINDOW_MS=60000

# Model Configuration
AI_DEFAULT_MODEL=claude-sonnet-4-20250514
AI_CHAT_MODEL=claude-sonnet-4-20250514
AI_ANALYSIS_MODEL=claude-opus-4-20250514
```

### API Routes Structure

```
app/api/ai/
  chat/
    route.ts           # Chat API
  search/
    route.ts           # Enhanced search
    suggest/route.ts   # Search suggestions
  recommendations/
    route.ts           # Product recommendations
  content/
    description/route.ts  # Generate descriptions
    seo/route.ts          # Generate SEO tags
    reviews/route.ts      # Summarize reviews
  admin/
    insights/
      inventory/route.ts  # Inventory insights
      sales/route.ts      # Sales analytics
```

### MCP Server Structure

```
mcp-servers/
  product-catalog/
    src/
      server.ts
      tools/
        search.ts
        details.ts
        similar.ts
      resources/
        catalog.ts
        categories.ts
    package.json
    tsconfig.json

  order-management/
    src/
      server.ts
      tools/
        status.ts
        tracking.ts
        history.ts
    package.json
    tsconfig.json

  customer-service/
    src/
      server.ts
      tools/
        support.ts
        returns.ts
        faq.ts
      prompts/
        greeting.ts
        responses.ts
    package.json
    tsconfig.json

  analytics/
    src/
      server.ts
      tools/
        sales.ts
        inventory.ts
        customers.ts
    package.json
    tsconfig.json
```

### Database Schema Additions

```prisma
// prisma/schema.prisma additions

model AIInteraction {
  id           String   @id @default(cuid())
  userId       String?
  user         User?    @relation(fields: [userId], references: [id])
  sessionId    String
  type         AIInteractionType
  input        String   @db.Text
  output       String   @db.Text
  toolsUsed    String[] // Array of tool names
  tokensUsed   Int
  latencyMs    Int
  success      Boolean
  errorMessage String?
  metadata     Json?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([type])
  @@index([createdAt])
}

model UserPreference {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])

  // Learned preferences
  categories    String[]
  priceRange    Json?    // { min: number, max: number }
  styles        String[]
  colors        String[]

  // Behavior metrics
  avgOrderValue    Float?
  purchaseFrequency Int?

  updatedAt DateTime @updatedAt
}

enum AIInteractionType {
  CHAT
  SEARCH
  RECOMMENDATION
  CONTENT_GENERATION
  ANALYTICS
}
```

---

## Security Considerations

### 1. API Key Protection

```typescript
// Never expose API key to client
// All AI calls must go through server-side API routes

// middleware.ts
export function middleware(request: NextRequest) {
  // Protect AI endpoints
  if (request.nextUrl.pathname.startsWith('/api/ai/admin')) {
    // Require admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
}
```

### 2. Input Sanitization

```typescript
// lib/ai/sanitize.ts

export function sanitizeUserInput(input: string): string {
  // Remove potential prompt injection attempts
  const sanitized = input
    .replace(/\[INST\]/gi, '')
    .replace(/\[\/INST\]/gi, '')
    .replace(/<\|.*?\|>/g, '')
    .replace(/<<.*?>>/g, '')
    .trim();

  // Limit length
  return sanitized.slice(0, 2000);
}
```

### 3. Rate Limiting

```typescript
// lib/ai/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true,
});

export async function checkRateLimit(userId: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(userId);

  if (!success) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)}s`);
  }

  return { limit, remaining };
}
```

### 4. Data Privacy

```typescript
// lib/ai/privacy.ts

export function maskSensitiveData(data: any): any {
  const sensitiveFields = ['email', 'password', 'phone', 'address', 'paymentId'];

  if (typeof data === 'object' && data !== null) {
    const masked = { ...data };
    for (const field of sensitiveFields) {
      if (field in masked) {
        masked[field] = '[REDACTED]';
      }
    }
    return masked;
  }

  return data;
}

// Use when sending data to AI
const safeContext = maskSensitiveData(userContext);
```

---

## Monitoring & Analytics

### 1. AI Usage Tracking

```typescript
// lib/ai/tracking.ts

export async function trackAIInteraction(
  type: AIInteractionType,
  input: string,
  output: string,
  metadata: {
    userId?: string;
    sessionId: string;
    toolsUsed: string[];
    tokensUsed: number;
    latencyMs: number;
    success: boolean;
    errorMessage?: string;
  }
) {
  await prisma.aIInteraction.create({
    data: {
      type,
      input: input.slice(0, 10000), // Limit stored input
      output: output.slice(0, 10000), // Limit stored output
      ...metadata,
    },
  });
}
```

### 2. Performance Metrics

```typescript
// lib/ai/metrics.ts

export async function getAIMetrics(period: 'day' | 'week' | 'month') {
  const startDate = getStartDate(period);

  const metrics = await prisma.aIInteraction.groupBy({
    by: ['type'],
    where: { createdAt: { gte: startDate } },
    _count: true,
    _avg: { latencyMs: true, tokensUsed: true },
  });

  const errorRate = await prisma.aIInteraction.count({
    where: {
      createdAt: { gte: startDate },
      success: false,
    },
  }) / await prisma.aIInteraction.count({
    where: { createdAt: { gte: startDate } },
  });

  return {
    byType: metrics,
    errorRate,
    totalInteractions: metrics.reduce((sum, m) => sum + m._count, 0),
  };
}
```

---

## Conclusion

This MCP integration roadmap provides VIVR with a comprehensive strategy for implementing AI-powered features. The phased approach ensures manageable implementation while delivering value incrementally.

**Key Success Factors**:
1. Start with high-impact, lower-complexity features (chatbot, search)
2. Build robust infrastructure before scaling
3. Monitor performance and user feedback continuously
4. Iterate based on real usage data
5. Maintain security and privacy throughout

**Expected Outcomes**:
- 30% reduction in customer support tickets
- 20% improvement in search relevance
- 15% increase in average order value through recommendations
- 50% faster product content creation

---

## Appendix: Quick Start Commands

```bash
# Install Anthropic SDK
npm install @anthropic-ai/sdk

# Install MCP SDK (for standalone servers)
npm install @modelcontextprotocol/sdk

# Create MCP server project
mkdir -p mcp-servers/product-catalog
cd mcp-servers/product-catalog
npm init -y
npm install @modelcontextprotocol/sdk typescript @types/node
```

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Author: VIVR Development Team*
