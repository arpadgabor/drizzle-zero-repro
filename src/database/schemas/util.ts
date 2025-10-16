import {sql} from 'drizzle-orm'
import {timestamp, uuid} from 'drizzle-orm/pg-core'

export const uuidv7 = (name: string) => uuid(name).default(sql`uuidv7()`)

export const timestamps = () => ({
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at'),
})
