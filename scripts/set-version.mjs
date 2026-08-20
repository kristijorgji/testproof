#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
    console.error('Usage: node scripts/set-version.mjs X.Y.Z');
    process.exit(1);
}

const root = path.resolve(import.meta.dirname, '..');
const corePath = path.join(root, 'packages/core/package.json');
const cliPath = path.join(root, 'packages/cli/package.json');

const core = JSON.parse(fs.readFileSync(corePath, 'utf8'));
const cli = JSON.parse(fs.readFileSync(cliPath, 'utf8'));
core.version = version;
cli.version = version;
cli.dependencies['@testproof/core'] = `^${version}`;
fs.writeFileSync(corePath, `${JSON.stringify(core, null, 4)}\n`);
fs.writeFileSync(cliPath, `${JSON.stringify(cli, null, 4)}\n`);
console.log(`Set @testproof/core and testproof to ${version}`);
