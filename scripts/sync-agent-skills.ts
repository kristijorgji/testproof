import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_SYNC_SOURCES = ['@kristijorgji/eslint-plugin'];

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = join(root, '.agents', 'skills', 'vendor');

function resolvePackageDir(pkg: string): string | undefined {
    const nested = join(root, 'node_modules', pkg);
    if (existsSync(nested)) return nested;
    try {
        return dirname(createRequire(import.meta.url).resolve(`${pkg}/package.json`));
    } catch {
        return undefined;
    }
}

rmSync(vendorDir, { recursive: true, force: true });
mkdirSync(vendorDir, { recursive: true });

const copied: string[] = [];

for (const pkg of SKILL_SYNC_SOURCES) {
    const pkgDir = resolvePackageDir(pkg);
    if (!pkgDir) continue;
    const skillsRoot = join(pkgDir, 'skills');
    if (!existsSync(skillsRoot)) continue;
    for (const name of readdirSync(skillsRoot)) {
        if (copied.includes(name)) continue;
        const src = join(skillsRoot, name);
        if (!existsSync(join(src, 'SKILL.md'))) continue;
        cpSync(src, join(vendorDir, name), { recursive: true });
        copied.push(name);
    }
}

const sourceList = SKILL_SYNC_SOURCES.join(', ');
console.log(
    copied.length === 0
        ? `synced 0 skills (looked in ${sourceList})`
        : `synced ${copied.length} skill${copied.length === 1 ? '' : 's'} from ${sourceList}: ${copied.join(', ')}`,
);
process.exit(0);
