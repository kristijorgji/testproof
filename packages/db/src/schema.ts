import { sql } from 'drizzle-orm';
import {
    boolean,
    check,
    index,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core';

export const STORAGE_MODES = ['git', 'file', 'db'] as const;
export type StorageMode = (typeof STORAGE_MODES)[number];

const timestamps = {
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    issuer: text('issuer'),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable(
    'projects',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        name: text('name').notNull(),
        slug: text('slug').notNull().unique(),
        storage: text('storage').notNull().default('git'),
        ledgerPath: text('ledger_path').notNull().default('docs/testing/flows.yaml'),
        ledgerFilePath: text('ledger_file_path'),
        defaultBranch: text('default_branch').notNull().default('main'),
        coreAreaIds: text('core_area_ids').array().notNull().default([]),
        shareToken: text('share_token'),
        ...timestamps,
    },
    (table) => [check('projects_storage_check', sql`${table.storage} in ('git', 'file', 'db')`)],
);

export const ledgerDocuments = pgTable('ledger_documents', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' })
        .unique(),
    yaml: text('yaml').notNull(),
    revision: integer('revision').notNull().default(1),
    ...timestamps,
});

export const repos = pgTable('repos', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull().default('github'),
    owner: text('owner').notNull(),
    name: text('name').notNull(),
    installationId: text('installation_id'),
    ...timestamps,
});

export const drafts = pgTable(
    'drafts',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        projectId: uuid('project_id')
            .notNull()
            .references(() => projects.id, { onDelete: 'cascade' }),
        branch: text('branch').notNull(),
        baseBlobSha: text('base_blob_sha').notNull(),
        patches: jsonb('patches').notNull().default([]),
        authorId: text('author_id').notNull(),
        status: text('status').notNull().default('open'),
        ...timestamps,
    },
    (table) => [index('drafts_project_branch_author').on(table.projectId, table.branch, table.authorId)],
);

export const coverageSnapshots = pgTable('coverage_snapshots', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    commitSha: text('commit_sha').notNull(),
    branch: text('branch').notNull(),
    summary: jsonb('summary').notNull(),
    ...timestamps,
});

export const flowCoverage = pgTable(
    'flow_coverage',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        snapshotId: uuid('snapshot_id')
            .notNull()
            .references(() => coverageSnapshots.id, { onDelete: 'cascade' }),
        flowId: text('flow_id').notNull(),
        status: text('status').notNull(),
        demandedCells: jsonb('demanded_cells').notNull().default([]),
        coveredCells: jsonb('covered_cells').notNull().default([]),
        files: jsonb('files').notNull().default({}),
        ...timestamps,
    },
    (table) => [index('flow_coverage_snapshot_flow').on(table.snapshotId, table.flowId)],
);

export const runs = pgTable('runs', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    source: text('source').notNull(),
    commitSha: text('commit_sha'),
    branch: text('branch'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    status: text('status').notNull().default('complete'),
    metadata: jsonb('metadata').notNull().default({}),
    ...timestamps,
});

export const runResults = pgTable('run_results', {
    id: uuid('id').primaryKey().defaultRandom(),
    runId: uuid('run_id')
        .notNull()
        .references(() => runs.id, { onDelete: 'cascade' }),
    flowId: text('flow_id'),
    platform: text('platform'),
    dimensions: jsonb('dimensions').notNull().default({}),
    status: text('status').notNull(),
    durationMs: integer('duration_ms'),
    errorText: text('error_text'),
    attachmentIds: text('attachment_ids').array().notNull().default([]),
    notes: text('notes'),
    ...timestamps,
});

export const sessions = pgTable('sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    performedAt: timestamp('performed_at', { withTimezone: true }).notNull().defaultNow(),
    performerId: text('performer_id'),
    notes: text('notes'),
    runId: uuid('run_id').references(() => runs.id),
    ...timestamps,
});

export const attachments = pgTable('attachments', {
    id: uuid('id').primaryKey().defaultRandom(),
    runResultId: uuid('run_result_id').references(() => runResults.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    path: text('path').notNull(),
    bytes: integer('bytes'),
    ...timestamps,
});

export const apiTokens = pgTable(
    'api_tokens',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        projectId: uuid('project_id')
            .notNull()
            .references(() => projects.id, { onDelete: 'cascade' }),
        name: text('name').notNull(),
        hash: text('hash').notNull(),
        lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
        ...timestamps,
    },
    (table) => [uniqueIndex('api_tokens_hash').on(table.hash)],
);
