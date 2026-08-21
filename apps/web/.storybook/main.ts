import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

const storybookDir = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-a11y', 'msw-storybook-addon'],
    staticDirs: ['../public'],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    viteFinal: async (viteConfig) => {
        viteConfig.plugins ??= [];
        viteConfig.plugins.push(react());
        viteConfig.resolve ??= {};
        viteConfig.resolve.alias = {
            ...viteConfig.resolve.alias,
            '@/env': path.resolve(storybookDir, './mocks/env.ts'),
            '@': path.resolve(storybookDir, '../src'),
            '@test': path.resolve(storybookDir, '../test'),
            'next/navigation': path.resolve(storybookDir, './mocks/next-navigation.ts'),
            'next/cache': path.resolve(storybookDir, './mocks/next-cache.ts'),
            'next/image': path.resolve(storybookDir, './mocks/next-image.tsx'),
            'next/link': path.resolve(storybookDir, './mocks/next-link.tsx'),
        };
        const envVars = loadEnv('development', path.resolve(storybookDir, '..'), 'NEXT_PUBLIC_');
        const define: Record<string, string> = { 'process.env.NODE_ENV': JSON.stringify('development') };
        for (const [key, value] of Object.entries(envVars)) {
            define[`process.env.${key}`] = JSON.stringify(value);
        }
        viteConfig.define = { ...viteConfig.define, ...define };
        return viteConfig;
    },
};

export default config;
