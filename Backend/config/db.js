import mongoose from 'mongoose'
import { envConfig } from './env.js'

/**
 * Establish connection to MongoDB database
 * Uses sanitized configuration from config/env.js without leaking credentials to logs.
 */
const connectDB = async () => {
  const uri = envConfig.mongo.uri
  const masked = envConfig.mongo.maskedUri

  try {
    console.log(`⏳ [MongoDB] Connecting to MongoDB (${masked})...`)
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
      maxIdleTimeMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 1,
      heartbeatFrequencyMS: 10000,
      family: 4 // Force IPv4 to eliminate Windows IPv6 DNS resolution timeouts
    })
    console.log(`✅ [MongoDB] Database Connected: ${conn.connection.host}`)

    // Run automated category & product referential integrity migration in non-test environments (non-blocking)
    if (process.env.NODE_ENV !== 'test') {
      setTimeout(async () => {
        try {
          const { migrateCategoriesAndProducts } = await import('../utils/migrateData.js')
          migrateCategoriesAndProducts().catch((migErr) => {
            console.warn('⚠️ [Migration Warning]:', migErr.message)
          })
        } catch (migErr) {
          console.warn('⚠️ [Migration Warning]:', migErr.message)
        }
      }, 3000)
    }
  } catch (error) {
    console.error(`❌ [MongoDB] Connection Error: ${error.message}`)

    // If remote connection failed in development, attempt fallback to local MongoDB
    const localUri = 'mongodb://127.0.0.1:27017/EnquiryWebsite'
    if (!envConfig.isProduction && uri !== localUri) {
      try {
        console.log(`🔄 [MongoDB] Attempting fallback to local MongoDB (${localUri})...`)
        const localConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 3000
        })
        console.log(`✅ [MongoDB] Connected to local fallback database: ${localConn.connection.host}`)
        return
      } catch (localErr) {
        console.error(`❌ [MongoDB] Local fallback also failed: ${localErr.message}`)
      }
    }

    if (envConfig.isProduction) {
      console.error(`💡 [MongoDB Render Tip] In MongoDB Atlas -> Network Access, ensure you have added IP '0.0.0.0/0' (Allow access from anywhere) so Render cloud instances can connect.`)
    }
  }
}

export default connectDB
