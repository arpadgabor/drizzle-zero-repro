import {sql} from 'drizzle-orm'
import {timestamp, uuid} from 'drizzle-orm/pg-core'
import {user} from './auth.js'
import z from 'zod'

export const uuidv7 = (name: string) => uuid(name).default(sql`uuidv7()`)

export const timestamps = () => ({
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at'),
})

export const userActions = () => ({
  createdBy: uuid('created_by')
    .notNull()
    .references(() => user.id),
  updatedBy: uuid('updated_by').references(() => user.id),
  deletedBy: uuid('deleted_by').references(() => user.id),
})

export const AddressType = z.object({
  country: z.string(),
  region: z.string(),
  city: z.string(),
  zipCode: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
})

export type AddressType = z.infer<typeof AddressType>
