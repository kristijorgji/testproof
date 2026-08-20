import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const workspaceRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

const config: NextConfig = {
    outputFileTracingRoot: workspaceRoot,
    transpilePackages: ['@testproof/core', '@testproof/db'],
};

export default config;
