import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'test/**/*.test.ts', '.storybook/**/*.test.ts'],
        setupFiles: [path.resolve(__dirname, 'test/vitest.setup.ts')],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@test': path.resolve(__dirname, 'test'),
        },
    },
});
