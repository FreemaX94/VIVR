/**
 * OPTIMIZED Prisma client configuration
 * Features connection pooling, query optimization, and proper logging
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Create Prisma client with optimized configuration
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Logging configuration
    log:
      process.env.NODE_ENV === 'development'
        ? [
            'query', // Log all queries (development only)
            'error',
            'warn',
          ]
        : ['error'], // Only errors in production

    errorFormat: 'pretty',
  })

// Ensure singleton pattern in development
// This prevents creating multiple PrismaClient instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Graceful shutdown handler
 * Disconnects from database on server shutdown
 */
if (typeof global !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, disconnecting Prisma')
    await prisma.$disconnect()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    console.log('SIGINT received, disconnecting Prisma')
    await prisma.$disconnect()
    process.exit(0)
  })
}

export default prisma

/**
 * CONNECTION POOLING CONFIGURATION
 *
 * For optimal performance, configure your DATABASE_URL:
 *
 * LOCAL DEVELOPMENT (direct connection):
 * DATABASE_URL="postgresql://user:password@localhost:5432/vivr?schema=public"
 *
 * PRODUCTION WITH POOLING (PgBouncer):
 * DATABASE_URL="postgresql://user:password@pgbouncer.example.com:6432/vivr?schema=public&sslmode=require"
 *
 * WITH CONNECTION PARAMETERS:
 * DATABASE_URL="postgresql://user:password@localhost:5432/vivr?schema=public&connection_limit=20&statement_cache_size=250"
 *
 * KEY PARAMETERS:
 * - connection_limit: Maximum concurrent connections (default: unlimited)
 * - statement_cache_size: Number of prepared statements to cache (default: 200)
 * - pool_timeout: Time to wait for available connection (ms)
 * - idle_in_transaction_session_timeout: Close idle transactions (ms)
 *
 * RECOMMENDED POOL SIZE CALCULATION:
 * For Next.js on Node.js:
 * pool_size = (CPU_CORES × 2) + Effective_Spindle_Count
 *
 * Examples:
 * - 2 cores: pool_size = 5
 * - 4 cores: pool_size = 10
 * - 8 cores: pool_size = 20
 * - 16 cores: pool_size = 40
 *
 * Maximum safe pool_size: 50
 */

/**
 * PRISMA QUERY OPTIMIZATION TIPS
 *
 * 1. Use SELECT to fetch only needed fields:
 *    ❌ BAD:
 *      const user = await prisma.user.findUnique({
 *        where: { id: userId },
 *        include: { orders: true }  // Fetches all fields
 *      })
 *
 *    ✅ GOOD:
 *      const user = await prisma.user.findUnique({
 *        where: { id: userId },
 *        select: {
 *          id: true,
 *          email: true,
 *          name: true,
 *          orders: {
 *            select: { id: true, total: true }
 *          }
 *        }
 *      })
 *
 * 2. Use aggregation for statistics instead of fetching data:
 *    ❌ BAD:
 *      const reviews = await prisma.review.findMany({ where: { productId } })
 *      const avg = reviews.reduce((a,r) => a + r.rating, 0) / reviews.length
 *
 *    ✅ GOOD:
 *      const stats = await prisma.review.aggregate({
 *        where: { productId },
 *        _avg: { rating: true },
 *        _count: true
 *      })
 *      const avg = stats._avg.rating
 *
 * 3. Batch queries with Promise.all:
 *    ❌ BAD:
 *      const product = await prisma.product.findUnique(...)
 *      const reviews = await prisma.review.findMany(...)
 *      const related = await prisma.product.findMany(...)
 *
 *    ✅ GOOD:
 *      const [product, reviews, related] = await Promise.all([
 *        prisma.product.findUnique(...),
 *        prisma.review.findMany(...),
 *        prisma.product.findMany(...)
 *      ])
 *
 * 4. Use LIMIT with relationships:
 *    ❌ BAD:
 *      const product = await prisma.product.findUnique({
 *        where: { id },
 *        include: { reviews: true }  // Fetches ALL reviews
 *      })
 *
 *    ✅ GOOD:
 *      const product = await prisma.product.findUnique({
 *        where: { id },
 *        select: {
 *          ...fields,
 *          reviews: {
 *            take: 10,
 *            orderBy: { createdAt: 'desc' }
 *          }
 *        }
 *      })
 *
 * 5. Use transactions for consistency:
 *    await prisma.$transaction(async (tx) => {
 *      await tx.order.create({ data: {...} })
 *      await tx.product.update({ data: {...} })
 *    })
 *
 * 6. Filter at database, not application:
 *    ❌ BAD:
 *      const all = await prisma.product.findMany()
 *      const featured = all.filter(p => p.featured)
 *
 *    ✅ GOOD:
 *      const featured = await prisma.product.findMany({
 *        where: { featured: true }
 *      })
 */
