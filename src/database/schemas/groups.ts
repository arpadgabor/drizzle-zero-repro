import {pgTable, text, uuid} from 'drizzle-orm/pg-core'
import {timestamps, userActions, uuidv7} from './util.js'
import {user} from './auth.js'
import {relations} from 'drizzle-orm'

export const groups = pgTable('group', {
  id: uuidv7('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),

  ...timestamps(),
  ...userActions(),
})

export const userGroups = pgTable('user_group', {
  id: uuidv7('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, {onDelete: 'cascade'}),
  groupId: uuid('group_id')
    .notNull()
    .references(() => groups.id, {onDelete: 'cascade'}),

  ...timestamps(),
  ...userActions(),
})

export const userGroupsRelations = relations(userGroups, ({one}) => ({
  user: one(user, {
    fields: [userGroups.userId],
    references: [user.id],
  }),
  group: one(groups, {
    fields: [userGroups.groupId],
    references: [groups.id],
  }),
}))
