import { createHash, randomBytes } from 'node:crypto';

import { createDb } from './index.js';
import { apiTokens, projects } from './schema.js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required');

const db = createDb(url);
const slug = process.env.SEED_SLUG ?? 'demo';
const name = process.env.SEED_NAME ?? 'Demo';

const existing = await db.select().from(projects);
const project =
    existing.find((row) => row.slug === slug) ??
    (
        await db
            .insert(projects)
            .values({ name, slug, shareToken: crypto.randomUUID() })
            .returning()
    )[0];

if (!project) throw new Error('Could not seed project');

const token = `tp_${randomBytes(24).toString('hex')}`;
const hash = createHash('sha256').update(token).digest('hex');
await db.insert(apiTokens).values({ projectId: project.id, name: 'seed', hash });

console.log(`Project: ${project.name} (${project.id})`);
console.log(`Token:   ${token}`);
process.exit(0);
