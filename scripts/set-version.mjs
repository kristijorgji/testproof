#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
    console.error('Usage: node scripts/set-version.mjs X.Y.Z');
    process.exit(1);
}

const IMAGE_PREFIX = 'ghcr.io/kristijorgji/testproof:';

function rewritePinnedImage(filePath, oldVersion, newVersion) {
    const from = `${IMAGE_PREFIX}${oldVersion}`;
    const to = `${IMAGE_PREFIX}${newVersion}`;
    const src = fs.readFileSync(filePath, 'utf8');
    const count = src.split(from).length - 1;
    if (count < 1) {
        console.error(`${filePath} has no ${from}`);
        process.exit(1);
    }
    const next = src.split(from).join(to);
    if (next.includes(from)) {
        console.error(`${filePath} still contains ${from} after rewrite`);
        process.exit(1);
    }
    fs.writeFileSync(filePath, next);
    console.log(`Updated ${count} ${from} → ${to} in ${path.relative(root, filePath)}`);
}

const root = path.resolve(import.meta.dirname, '..');
const corePath = path.join(root, 'packages/core/package.json');
const cliPath = path.join(root, 'packages/cli/package.json');

const core = JSON.parse(fs.readFileSync(corePath, 'utf8'));
const cli = JSON.parse(fs.readFileSync(cliPath, 'utf8'));
const previous = core.version;
core.version = version;
cli.version = version;
cli.dependencies['@testproof/core'] = `^${version}`;
fs.writeFileSync(corePath, `${JSON.stringify(core, null, 4)}\n`);
fs.writeFileSync(cliPath, `${JSON.stringify(cli, null, 4)}\n`);

rewritePinnedImage(path.join(root, 'README.md'), previous, version);
rewritePinnedImage(path.join(root, 'docker-compose.yml'), previous, version);

const readmePath = path.join(root, 'README.md');
const readme = fs.readFileSync(readmePath, 'utf8');
const cliVersionFrom = `version \`${previous}\``;
const cliVersionTo = `version \`${version}\``;
if (!readme.includes(cliVersionFrom)) {
    console.error(`README.md has no ${cliVersionFrom}`);
    process.exit(1);
}
fs.writeFileSync(readmePath, readme.replaceAll(cliVersionFrom, cliVersionTo));

const cliIndexPath = path.join(root, 'packages/cli/src/index.ts');
const cliIndex = fs.readFileSync(cliIndexPath, 'utf8');
const nextIndex = cliIndex.replace(/\.version\('(?:\d+\.\d+\.\d+)'\)/, `.version('${version}')`);
if (nextIndex === cliIndex) {
    console.error('Could not update CLI program version in packages/cli/src/index.ts');
    process.exit(1);
}
fs.writeFileSync(cliIndexPath, nextIndex);

const { execFileSync } = await import('node:child_process');
execFileSync('pnpm', ['install', '--lockfile-only'], { cwd: root, stdio: 'inherit' });
console.log(`Set @testproof/core and testproof to ${version}`);
