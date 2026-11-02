import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { envConfig, validateEnv } from './config/env.js'
import connectDB from './config/db.js'

// Import API Routes
import productRoutes from './routes/productRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import enquiryRoutes from './routes/enquiryRoutes.js'
import heroRoutes from './routes/heroRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import blogRoutes from './routes/blogRoutes.js'
import authRoutes from './routes/authRoutes.js'
import superAdminRoutes from './routes/superAdminRoutes.js'
import adminAuthRoutes from './routes/adminAuthRoutes.js'
import adminManagementRoutes from './routes/adminManagementRoutes.js'

// Validate environment on startup
validateEnv()

// Connect to MongoDB
connectDB()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const app = express()

// Trust proxy (Render, AWS, Heroku, Cloudflare reverse proxies)
app.set('trust proxy', 1)

// Configure CORS with credential support
const allowedOrigins = envConfig.cors.allowedOrigins

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)

      // If wildcard '*' is allowed, echo back the origin so credentialed requests don't fail
      if (allowedOrigins.includes('*')) {
        return callback(null, true)
      }

      const cleanOrigin = origin.replace(/\/+$/, '')
      if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes(origin) || !envConfig.isProduction) {
        return callback(null, true)
      }

      return callback(new Error(`CORS error: Origin ${origin} not allowed by Access-Control-Allow-Origin`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
)

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cookieParser())

// Serve uploaded static files
app.use('/uploads', express.static(uploadsDir))

// Health check endpoints (serves both /health for Render and /api/health for frontend)
const healthHandler = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting']
  const dbStatus = dbStates[mongoose.connection.readyState] || 'unknown'

  const healthData = {
    status: isDbConnected ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: envConfig.nodeEnv,
    database: {
      status: dbStatus,
      connected: isDbConnected
    },
    message: isDbConnected
      ? 'Enquiry Website Node.js MERN Backend API is running smoothly and database is connected.'
      : 'Enquiry Website Node.js MERN Backend API is running (database connection pending or disconnected).'
  }

  // If in production and database is completely disconnected, respond with 503
  const statusCode = envConfig.isProduction && mongoose.connection.readyState === 0 ? 503 : 200
  res.status(statusCode).json(healthData)
}

app.get('/health', healthHandler)
app.get('/api/health', healthHandler)

// Mount API Routes
app.use('/api/auth', authRoutes)
app.use('/api/super-admin', superAdminRoutes)
app.use('/api/admin/auth', adminAuthRoutes)
app.use('/api/admin', adminManagementRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/enquiries', enquiryRoutes)
app.use('/api/hero-slides', heroRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/blogs', blogRoutes)

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found - ${req.originalUrl}` })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]:', err.stack || err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

let serverInstance = null

const startServer = (port) => {
  const host = '0.0.0.0'
  serverInstance = app
    .listen(port, host, () => {
      console.log(`🚀 [Server] Node.js Express server running on port ${port} in ${envConfig.nodeEnv} mode`)
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
        // In local development, if a port is in use or blocked by Windows OS, try the next port automatically
        if (!envConfig.isProduction && port < 5020) {
          console.warn(`⚠️ [Server] Port ${port} is unavailable (${err.code}). Automatically trying port ${port + 1}...`)
          startServer(port + 1)
          return
        }
        console.error(`❌ [Fatal] Port ${port} is unavailable (${err.code}).`)
        process.exit(1)
      } else {
        console.error('❌ Server startup error:', err)
      }
    })
}

// Graceful shutdown handling for Render and system signals
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 [Server] Received ${signal}. Starting graceful shutdown...`)
  if (serverInstance) {
    serverInstance.close(async () => {
      console.log('🔌 [Server] HTTP server closed.')
      try {
        await mongoose.connection.close(false)
        console.log('🔌 [MongoDB] Database connection closed.')
      } catch (err) {
        console.error('❌ [MongoDB] Error closing database connection:', err.message)
      }
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
}


process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Process-level unhandled rejection and exception handling
process.on('unhandledRejection', (reason) => {
  console.error('❌ [Unhandled Rejection at Promise]:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('❌ [Uncaught Exception]:', err)
})

startServer(envConfig.port)

export { app, serverInstance, startServer }
export default app
