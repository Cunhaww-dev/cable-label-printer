import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

const createdAt = () =>
  timestamp('created_at', { mode: 'date' }).defaultNow().notNull();
const updatedAt = () =>
  timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .onUpdateNow()
    .notNull();
const deletedAt = () => timestamp('deleted_at', { mode: 'date' });

export const userRoleEnum = mysqlEnum('role', ['ADMIN', 'SELLER']);

export const stores = mysqlTable(
  'stores',
  {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    address: varchar('address', { length: 255 }).notNull(),
    neighborhood: varchar('neighborhood', { length: 120 }).notNull(),
    number: varchar('number', { length: 30 }).notNull(),
    city: varchar('city', { length: 120 }).notNull(),
    state: varchar('state', { length: 2 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    deletedAt: deletedAt(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('stores_is_active_idx').on(table.isActive),
    index('stores_deleted_at_idx').on(table.deletedAt),
  ],
);

export const users = mysqlTable(
  'users',
  {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum.notNull(),
    storeId: int('store_id', { unsigned: true })
      .notNull()
      .references(() => stores.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    isActive: boolean('is_active').default(true).notNull(),
    deletedAt: deletedAt(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    index('users_store_id_idx').on(table.storeId),
    index('users_role_idx').on(table.role),
    index('users_is_active_idx').on(table.isActive),
    index('users_deleted_at_idx').on(table.deletedAt),
  ],
);

export const cables = mysqlTable(
  'cables',
  {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    code: varchar('code', { length: 50 }).notNull(),
    internalCode: int('internal_code', { unsigned: true }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    brand: varchar('brand', { length: 120 }).notNull(),
    color: varchar('color', { length: 80 }).notNull(),
    mm: decimal('mm', { precision: 8, scale: 2 }).notNull(),
    type: varchar('type', { length: 120 }).notNull(),
    pricePerMeter: decimal('price_per_meter', {
      precision: 10,
      scale: 2,
    }).notNull(),
    storeId: int('store_id', { unsigned: true }).references(() => stores.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
    imageUrl: varchar('image_url', { length: 500 }),
    isActive: boolean('is_active').default(true).notNull(),
    deletedAt: deletedAt(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('cables_internal_code_unique').on(table.internalCode),
    // MySQL permite múltiplos NULL em UNIQUE; cabos globais ainda precisam de guarda no service.
    uniqueIndex('cables_brand_color_mm_store_unique').on(
      table.brand,
      table.color,
      table.mm,
      table.storeId,
    ),
    index('cables_code_idx').on(table.code),
    index('cables_store_id_idx').on(table.storeId),
    index('cables_is_active_idx').on(table.isActive),
    index('cables_deleted_at_idx').on(table.deletedAt),
    check(
      'cables_internal_code_range_check',
      sql`${table.internalCode} between 0 and 999999`,
    ),
    check('cables_mm_positive_check', sql`${table.mm} > 0`),
    check(
      'cables_price_per_meter_positive_check',
      sql`${table.pricePerMeter} >= 0`,
    ),
  ],
);

export const labels = mysqlTable(
  'labels',
  {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    cableId: int('cable_id', { unsigned: true })
      .notNull()
      .references(() => cables.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    cableNameSnapshot: varchar('cable_name_snapshot', {
      length: 255,
    }).notNull(),
    internalCodeSnapshot: int('internal_code_snapshot', {
      unsigned: true,
    }).notNull(),
    pricePerMeterSnapshot: decimal('price_per_meter_snapshot', {
      precision: 10,
      scale: 2,
    }).notNull(),
    meters: decimal('meters', { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
    barcode: varchar('barcode', { length: 120 }).notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    userId: int('user_id', { unsigned: true })
      .notNull()
      .references(() => users.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    storeId: int('store_id', { unsigned: true })
      .notNull()
      .references(() => stores.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('labels_barcode_unique').on(table.barcode),
    index('labels_cable_id_idx').on(table.cableId),
    index('labels_user_id_idx').on(table.userId),
    index('labels_store_id_idx').on(table.storeId),
    index('labels_expires_at_idx').on(table.expiresAt),
    check('labels_meters_positive_check', sql`${table.meters} > 0`),
    check('labels_total_price_positive_check', sql`${table.totalPrice} >= 0`),
  ],
);

export const auditLogs = mysqlTable(
  'audit_logs',
  {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    userId: int('user_id', { unsigned: true })
      .notNull()
      .references(() => users.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    storeId: int('store_id', { unsigned: true })
      .notNull()
      .references(() => stores.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    action: varchar('action', { length: 80 }).notNull(),
    entity: varchar('entity', { length: 80 }).notNull(),
    entityId: int('entity_id', { unsigned: true }).notNull(),
    beforeData: json('before_data'),
    afterData: json('after_data'),
    createdAt: createdAt(),
  },
  (table) => [
    index('audit_logs_user_id_idx').on(table.userId),
    index('audit_logs_store_id_idx').on(table.storeId),
    index('audit_logs_entity_idx').on(table.entity, table.entityId),
    index('audit_logs_created_at_idx').on(table.createdAt),
  ],
);

export const refreshTokens = mysqlTable(
  'refresh_tokens',
  {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    userId: int('user_id', { unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    token: varchar('token', { length: 512 }).notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('refresh_tokens_token_unique').on(table.token),
    index('refresh_tokens_user_id_idx').on(table.userId),
    index('refresh_tokens_expires_at_idx').on(table.expiresAt),
  ],
);

export const storesRelations = relations(stores, ({ many }) => ({
  users: many(users),
  cables: many(cables),
  labels: many(labels),
  auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  store: one(stores, {
    fields: [users.storeId],
    references: [stores.id],
  }),
  labels: many(labels),
  auditLogs: many(auditLogs),
  refreshTokens: many(refreshTokens),
}));

export const cablesRelations = relations(cables, ({ many, one }) => ({
  store: one(stores, {
    fields: [cables.storeId],
    references: [stores.id],
  }),
  labels: many(labels),
}));

export const labelsRelations = relations(labels, ({ one }) => ({
  cable: one(cables, {
    fields: [labels.cableId],
    references: [cables.id],
  }),
  user: one(users, {
    fields: [labels.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [labels.storeId],
    references: [stores.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [auditLogs.storeId],
    references: [stores.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));
