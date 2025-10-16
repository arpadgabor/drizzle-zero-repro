import {decimal, integer, jsonb, pgEnum, pgTable, text, uuid} from 'drizzle-orm/pg-core'
import {AddressType, timestamps, userActions, uuidv7} from './util.js'
import {locations, sections, wards} from './locations.js'
import * as z from 'zod'
import {relations} from 'drizzle-orm'

export const ProductCategoryType = z.enum(['producible', 'solution', 'supportive', 'consumable'])

export const productCategoryType = pgEnum('product_category_type', [
  ProductCategoryType.enum.producible,
  ProductCategoryType.enum.solution,
  ProductCategoryType.enum.supportive,
  ProductCategoryType.enum.consumable,
])

export const ProductCategoryStatus = z.enum(['active', 'inactive'])

export const productCategoryStatus = pgEnum('section_status', [
  ProductCategoryStatus.enum.active,
  ProductCategoryStatus.enum.inactive,
])

export const productCategories = pgTable('product_category', {
  id: uuidv7('id').primaryKey(),
  name: text('name').notNull(),
  type: productCategoryType('type').notNull(),
  status: productCategoryStatus('status').default(ProductCategoryStatus.enum.active),

  ...timestamps(),
  ...userActions(),
})

export const productCategoriesRelations = relations(productCategories, ({many}) => ({
  productSubcategories: many(productSubcategories),
  activeSubstancesCategories: many(activeSubstancesCategories),
}))

export const productSubcategories = pgTable('product_subcategory', {
  id: uuidv7('id').primaryKey(),
  name: text('name').notNull(),
  parentId: uuid('parent_id')
    .notNull()
    .references(() => productCategories.id, {onDelete: 'cascade'}),

  ...timestamps(),
  ...userActions(),
})

export const productSubcategoriesRelations = relations(productSubcategories, ({one, many}) => ({
  productCategory: one(productCategories, {
    fields: [productSubcategories.parentId],
    references: [productCategories.id],
  }),
  activeSubstancesCategories: many(activeSubstancesCategories),
}))

export const CalculationMode = z.enum(['bsa', 'weight', 'absolute', 'auc'])

export const calculationMode = pgEnum('calculation_mode', [
  CalculationMode.enum.bsa,
  CalculationMode.enum.weight,
  CalculationMode.enum.absolute,
  CalculationMode.enum.auc,
])

export const activeSubstances = pgTable('active_substance', {
  id: uuidv7('id').primaryKey(),
  name: text('name').notNull(),
  unit: text('unit'),
  calculationMode: calculationMode('calculation_mode'),
  min: decimal('min', {precision: 10, scale: 4}),
  max: decimal('max', {precision: 10, scale: 4}),
  rounding: decimal('rounding', {precision: 10, scale: 4}),
  doseLimit: decimal('dose_limit', {precision: 10, scale: 4}),
  notes: text('notes'),

  ...timestamps(),
  ...userActions(),
})

export const activeSubstancesRelations = relations(activeSubstances, ({many}) => ({
  activeSubstancesCategories: many(activeSubstancesCategories),
  tradeNames: many(tradeNames),
}))

export const activeSubstancesCategories = pgTable('active_substance_category', {
  id: uuidv7('id').primaryKey(),
  activeSubstanceId: uuid('active_substance_id')
    .notNull()
    .references(() => activeSubstances.id, {onDelete: 'cascade'}),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => productCategories.id, {onDelete: 'cascade'}),
  subcategoryId: uuid('subcategory_id').references(() => productSubcategories.id, {onDelete: 'set null'}),

  ...timestamps(),
  ...userActions(),
})

export const activeSubstancesCategoriesRelations = relations(activeSubstancesCategories, ({one}) => ({
  productCategory: one(productCategories, {
    fields: [activeSubstancesCategories.categoryId],
    references: [productCategories.id],
  }),
  productSubcategory: one(productSubcategories, {
    fields: [activeSubstancesCategories.subcategoryId],
    references: [productSubcategories.id],
  }),
  activeSubstance: one(activeSubstances, {
    fields: [activeSubstancesCategories.activeSubstanceId],
    references: [activeSubstances.id],
  }),
}))

export const VendorType = z.enum(['supplier', 'producer'])

export const vendorType = pgEnum('vendor_type', [VendorType.enum.supplier, VendorType.enum.producer])

export const vendors = pgTable('vendor', {
  id: uuidv7('id').primaryKey(),
  name: text('name').notNull(),
  type: vendorType('type').notNull(),
  address: jsonb('address').$type<AddressType>(),
  notes: text('notes'),

  ...timestamps(),
  ...userActions(),
})

export const vendorsRelations = relations(vendors, ({many}) => ({
  producerTradeNames: many(tradeNames, {relationName: 'producer'}),
  suppliedTradeNames: many(tradeNames, {relationName: 'supplier'}),
}))

export const tradeNames = pgTable('trade_name', {
  id: uuidv7('id').primaryKey(),
  activeSubstanceId: uuid('active_substance_id')
    .notNull()
    .references(() => activeSubstances.id, {onDelete: 'cascade'}),
  producerId: uuid('producer_id').references(() => vendors.id, {onDelete: 'cascade'}),
  supplierId: uuid('supplier_id').references(() => vendors.id, {onDelete: 'cascade'}),
  labelName: text('label_name').notNull(),
  strength: decimal('strength', {precision: 10, scale: 4}),
  density: decimal('density', {precision: 10, scale: 4}),
  volume: decimal('volume', {precision: 10, scale: 4}),
  articleNumber: integer('article_number'),
  contraindicationId: uuid('contraindication_id').references(() => contraindications.id, {onDelete: 'set null'}),
  minConcentration: decimal('min_concentration', {precision: 10, scale: 4}),
  maxConcentration: decimal('max_concentration', {precision: 10, scale: 4}),
  containerMaterialId: uuid('container_material_id').references(() => containerMaterials.id, {onDelete: 'set null'}),

  ...timestamps(),
  ...userActions(),
})

export const tradeNamesRelations = relations(tradeNames, ({one, many}) => ({
  activeSubstance: one(activeSubstances, {
    fields: [tradeNames.activeSubstanceId],
    references: [activeSubstances.id],
  }),
  producer: one(vendors, {
    fields: [tradeNames.producerId],
    references: [vendors.id],
    relationName: 'producer',
  }),
  supplier: one(vendors, {
    fields: [tradeNames.supplierId],
    references: [vendors.id],
    relationName: 'supplier',
  }),
  contraindication: one(contraindications, {
    fields: [tradeNames.contraindicationId],
    references: [contraindications.id],
  }),
  containerMaterial: one(containerMaterials, {
    fields: [tradeNames.containerMaterialId],
    references: [containerMaterials.id],
  }),
  batches: many(batches),
}))

export const contraindications = pgTable('contraindication', {
  id: uuidv7('id').primaryKey(),
  name: text('name').notNull(),

  ...timestamps(),
  ...userActions(),
})

export const containerMaterials = pgTable('container_material', {
  id: uuidv7('id').primaryKey(),
  name: text('name').notNull(),

  ...timestamps(),
  ...userActions(),
})

export const batches = pgTable('batch', {
  id: uuidv7('id').primaryKey(),
  name: text('name').notNull(),
  expiryDate: text('expiry_date'),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id, {onDelete: 'cascade'}),
  sectionId: uuid('section_id')
    .notNull()
    .references(() => sections.id, {onDelete: 'cascade'}),
  wardId: uuid('ward_id')
    .notNull()
    .references(() => wards.id, {onDelete: 'cascade'}),
  tradeNameId: uuid('trade_name_id')
    .notNull()
    .references(() => tradeNames.id, {onDelete: 'cascade'}),
  quantity: decimal('quantity', {precision: 10, scale: 4}).notNull(),

  ...timestamps(),
  ...userActions(),
})

export const contraindicationsRelations = relations(contraindications, ({many}) => ({
  tradeNames: many(tradeNames),
}))

export const containerMaterialsRelations = relations(containerMaterials, ({many}) => ({
  tradeNames: many(tradeNames),
}))

export const batchesRelations = relations(batches, ({one}) => ({
  location: one(locations, {
    fields: [batches.locationId],
    references: [locations.id],
  }),
  section: one(sections, {
    fields: [batches.sectionId],
    references: [sections.id],
  }),
  ward: one(wards, {
    fields: [batches.wardId],
    references: [wards.id],
  }),
  tradeName: one(tradeNames, {
    fields: [batches.tradeNameId],
    references: [tradeNames.id],
  }),
}))
