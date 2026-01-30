import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    // Use pooled connection URL from Neon/Vercel Postgres
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
      },
    },
    // Logging configuration
    log:
      process.env.NODE_ENV === 'development'
        ? [
            {
              emit: 'stdout',
              level: 'query',
            },
            {
              emit: 'stdout',
              level: 'error',
            },
            {
              emit: 'stdout',
              level: 'warn',
            },
          ]
        : [
            {
              emit: 'stdout',
              level: 'error',
            },
          ],
    // Add middleware for performance monitoring
    ...(process.env.NODE_ENV === 'development' && {
      errorFormat: 'pretty',
    }),
  })
}

// Add middleware for slow query detection
function addPerformanceMonitoring(client: PrismaClient) {
  const slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10)

  // Middleware to track query performance
  client.$use(async (params, next) => {
    const start = Date.now()
    try {
      const result = await next(params)
      const duration = Date.now() - start

      if (duration > slowQueryThreshold) {
        console.warn(
          `[SLOW QUERY - ${duration}ms] ${params.model}.${params.action}`,
          process.env.NODE_ENV === 'development' ? params.args : ''
        )
      }

      return result
    } catch (error) {
      const duration = Date.now() - start
      console.error(`[QUERY ERROR - ${duration}ms] ${params.model}.${params.action}`, error)
      throw error
    }
  })

  return client
}

export const prisma = addPerformanceMonitoring(
  globalForPrisma.prisma ?? createPrismaClient()
)

// Only cache in development to avoid stale connections in serverless
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Health check function for deployment
export async function ensureDatabaseReady() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('[DB] Connection pool ready')
    return true
  } catch (error) {
    console.error('[DB] Connection pool check failed:', error)
    return false
  }
}

export default prisma
