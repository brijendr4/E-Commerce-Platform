import { createClient } from 'redis'

let redisClient = null
let isConnected = false

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

async function connectRedis() {
  if (redisClient) return redisClient

  try {
    const client = createClient({
      url: REDIS_URL,
      RESP: 2, // Explicitly use RESP2 protocol to avoid HELLO command error on older Redis versions
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 1) {
            // Stop retrying and return error to trigger catch block
            return new Error('Redis connection attempts exhausted');
          }
          return 500; // wait 500ms
        }
      }
    })
    
    client.on('error', (err) => {
      // Catch connection errors silently so we don't crash
      console.warn('⚠️ Redis Client Error:', err.message)
      isConnected = false
    })

    client.on('connect', () => {
      console.log('✅ Redis connected successfully')
      isConnected = true
    })

    await client.connect()
    redisClient = client
    return client
  } catch (err) {
    console.warn('⚠️ Could not connect to Redis. Running in DB-only mode. Details:', err.message)
    isConnected = false
    return null
  }
}

// Initial connection attempt
connectRedis()

// Resilient cache helpers
export const cache = {
  async get(key) {
    if (!isConnected || !redisClient) return null
    try {
      const data = await redisClient.get(key)
      return data ? JSON.parse(data) : null
    } catch (err) {
      console.warn('⚠️ Redis get error:', err.message)
      return null
    }
  },

  async set(key, value, expirySeconds = 3600) {
    if (!isConnected || !redisClient) return false
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: expirySeconds
      })
      return true
    } catch (err) {
      console.warn('⚠️ Redis set error:', err.message)
      return false
    }
  },

  async del(key) {
    if (!isConnected || !redisClient) return false
    try {
      await redisClient.del(key)
      return true
    } catch (err) {
      console.warn('⚠️ Redis del error:', err.message)
      return false
    }
  },

  // Clear cache matching a pattern (e.g. products:*)
  async clearPattern(pattern) {
    if (!isConnected || !redisClient) return false
    try {
      const keys = await redisClient.keys(pattern)
      if (keys.length > 0) {
        await redisClient.del(keys)
      }
      return true
    } catch (err) {
      console.warn('⚠️ Redis clearPattern error:', err.message)
      return false
    }
  }
}
