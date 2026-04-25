import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import * as schema from './schema'

type Db = ReturnType<typeof drizzle<typeof schema>>

declare global {
  // eslint-disable-next-line no-var
  var _db: Db | undefined
}

export function useDb(): Db {
  if (global._db) return global._db
  const dbPath = resolve(process.cwd(), '.data/scenes.sqlite')
  mkdirSync(resolve(process.cwd(), '.data'), { recursive: true })
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: resolve(process.cwd(), 'lib/db/migrations') })
  global._db = db
  return db
}
