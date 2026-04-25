import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'

export const scenes = sqliteTable('scenes', {
  id:      text('id').primaryKey(),
  title:   text('title').notNull().default(''),
  text:    text('text').notNull(),
  choices: text('choices').notNull(),
})

export const nodePositions = sqliteTable('node_positions', {
  sceneId: text('scene_id').primaryKey(),
  x:       real('x').notNull(),
  y:       real('y').notNull(),
})

export const users = sqliteTable('users', {
  id:        text('id').primaryKey(),
  name:      text('name').notNull(),
  email:     text('email').notNull().unique(),
  createdAt: integer('created_at').notNull(),
})
