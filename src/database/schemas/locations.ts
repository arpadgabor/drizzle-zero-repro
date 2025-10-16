import {jsonb, pgEnum, pgTable, text, uuid} from 'drizzle-orm/pg-core'
import * as z from 'zod'

import {AddressType, timestamps, userActions, uuidv7} from './util.js'
import {user} from './auth.js'
import {relations, type InferInsertModel, type InferSelectModel} from 'drizzle-orm'

export const locations = pgTable('location', {
  id: uuidv7('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  address: jsonb('address').$type<AddressType>(),
  ...timestamps(),
  ...userActions(),
})

export const locationRelations = relations(locations, ({many}) => ({
  sections: many(sections),
  wards: many(wards),
  userAccessLocation: many(userAccessLocation),
}))

export type LocationRecord = InferSelectModel<typeof locations>
export type LocationInsert = InferInsertModel<typeof locations>

export const SectionType = z.enum(['outpatients', 'pharmacy'])

export const sectionType = pgEnum('section_type', [SectionType.enum.outpatients, SectionType.enum.pharmacy])

export const SectionStatus = z.enum(['active', 'inactive'])

export const sectionStatus = pgEnum('section_status', [SectionStatus.enum.active, SectionStatus.enum.inactive])

export const sections = pgTable('section', {
  id: uuidv7('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id, {onDelete: 'cascade'}),
  type: sectionType('type').notNull().default(SectionType.enum.outpatients),
  status: sectionStatus('status'),
  costCenterNumber: text('cost_center_number'),
  orderNumber: text('order_number'),
  movementType: text('movement_type'),
  address: jsonb('address').$type<AddressType>(),
  deliveryAddress: jsonb('delivery_address').$type<AddressType>(),
  ikNumber: text('ik_number'),

  ...timestamps(),
  ...userActions(),
})

export const seactionRelations = relations(sections, ({one, many}) => ({
  location: one(locations, {
    fields: [sections.locationId],
    references: [locations.id],
  }),
  wards: many(wards),
  userAccessLocation: many(userAccessLocation),
}))

export const WardStatus = z.enum(['active', 'inactive'])

export const wardStatus = pgEnum('ward_status', [WardStatus.enum.active, WardStatus.enum.inactive])

export const wards = pgTable('ward', {
  id: uuidv7('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id, {onDelete: 'cascade'}),
  sectionId: uuid('section_id')
    .notNull()
    .references(() => sections.id, {onDelete: 'cascade'}),
  status: wardStatus('status'),
  costCenterNumber: text('cost_center_number'),
  orderNumber: text('order_number'),
  movementType: text('movement_type'),

  ...timestamps(),
  ...userActions(),
})

export const wardRelations = relations(wards, ({one, many}) => ({
  location: one(locations, {
    fields: [wards.locationId],
    references: [locations.id],
  }),
  section: one(sections, {
    fields: [wards.sectionId],
    references: [sections.id],
  }),
  userAccessLocation: many(userAccessLocation),
}))

export const userAccessLocation = pgTable('user_access_location', {
  id: uuidv7('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, {onDelete: 'cascade'}),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id, {onDelete: 'cascade'}),
  sectionId: uuid('section_id').references(() => sections.id, {onDelete: 'cascade'}),
  wardId: uuid('ward_id').references(() => wards.id, {onDelete: 'cascade'}),
})

export const userAccessLocationRelations = relations(userAccessLocation, ({one}) => ({
  user: one(user, {
    fields: [userAccessLocation.userId],
    references: [user.id],
  }),
  location: one(locations, {
    fields: [userAccessLocation.locationId],
    references: [locations.id],
  }),
  section: one(sections, {
    fields: [userAccessLocation.sectionId],
    references: [sections.id],
  }),
  ward: one(wards, {
    fields: [userAccessLocation.wardId],
    references: [wards.id],
  }),
}))
