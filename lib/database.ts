import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/business-management'
const USE_JSON_FALLBACK = process.env.USE_JSON_FALLBACK === 'true'

// JSONデータディレクトリ
const DATA_DIR = path.join(process.cwd(), 'data')

if (!MONGODB_URI && !USE_JSON_FALLBACK) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local or set USE_JSON_FALLBACK=true')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: any
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

// JSONファイルからデータを読み込む関数
export function getJsonData(filename: string) {
  try {
    const filePath = path.join(DATA_DIR, filename)
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(rawData)
    }
    return null
  } catch (error) {
    console.error(`Error reading JSON data from ${filename}:`, error)
    return null
  }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect

// Connect to database and return db instance
export async function connectToDatabase() {
  const connection = await dbConnect()
  return {
    db: connection.connection.db,
    client: connection.connection.getClient()
  }
}
