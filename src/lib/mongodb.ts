import { MongoClient, Db, Collection } from 'mongodb'

// Load environment variables if not already loaded
if (!process.env.DATABASE_URL) {
  try {
    require('dotenv').config()
  } catch (e) {
    // dotenv might not be available in production
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_URL"')
}

const uri = process.env.DATABASE_URL
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

// Database helper functions
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db('enyamedia')
}

export async function getCollection(name: string): Promise<Collection> {
  const db = await getDatabase()
  return db.collection(name)
}

// Collection names
export const Collections = {
  USERS: 'users',
  VIDEOS: 'videos',
  ACTIVITIES: 'activities',
  COMMENTS: 'comments'
} as const