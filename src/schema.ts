import { type Schema as ZeroSchema, definePermissions } from "@rocicorp/zero";
import { schema as genSchema } from "./schema.gen.js";

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
} satisfies ZeroSchema;

export const permissions = definePermissions(schema, () => ({}));
