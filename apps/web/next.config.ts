import type { NextConfig } from 'next';

const config: NextConfig = {
    output: 'standalone',
    transpilePackages: ['@testproof/core', '@testproof/db'],
};

export default config;
