import {definePermissions, type Schema as ZeroSchema, createBuilder} from '@rocicorp/zero'
import {schema as genSchema} from './schema.gen.js'

export interface AuthContext {
  user: {
    id: string
    email: string
  }
}

export const schema = {
  ...genSchema,
  enableLegacyMutators: false,
  enableLegacyQueries: false,
} as const satisfies ZeroSchema

export const builder = createBuilder(schema)

export type Schema = typeof schema

// oxlint-disable-next-line no-empty-object-type
export const permissions = definePermissions<{}, Schema>(schema, () => ({}))
