/** Generated artifacts — keep in sync with .prettierignore. */
const GENERATED_PATH_SUFFIXES = ['examples/demo/flows-coverage.md', 'apps/web/next-env.d.ts'];

function isGenerated(file) {
    const normalized = file.replaceAll('\\', '/');
    return (
        normalized.includes('examples/demo/.generated/') ||
        GENERATED_PATH_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
    );
}

function hand(files) {
    return files.filter((file) => !isGenerated(file));
}

/** Function form so lint-staged does not append staged paths to the pnpm command. */
const regenerateDemoDocs = () => 'pnpm build && node packages/cli/dist/index.js generate';

const ESLINT_PACKAGE_PREFIXES = [
    ['apps/web/', 'apps/web'],
    ['packages/core/', 'packages/core'],
    ['packages/cli/', 'packages/cli'],
    ['packages/db/', 'packages/db'],
];

function eslintFixCommands(files) {
    const filtered = hand(files);
    const groups = new Map();
    for (const file of filtered) {
        const normalized = file.replaceAll('\\', '/');
        const match = ESLINT_PACKAGE_PREFIXES.find(
            ([prefix]) => normalized.includes(`/${prefix}`) || normalized.startsWith(prefix),
        );
        if (!match) continue;
        const dir = match[1];
        const list = groups.get(dir) ?? [];
        list.push(file);
        groups.set(dir, list);
    }
    return [...groups.entries()].map(
        ([dir, list]) => `eslint --config ${dir}/eslint.config.js --no-warn-ignored --fix ${list.join(' ')}`,
    );
}

/** @type {import('lint-staged').Configuration} */
export default {
    '*.{ts,tsx,js,jsx,mjs,json,css,md,yml,yaml}': (files) => {
        const filtered = hand(files);
        return filtered.length ? [`prettier --write ${filtered.join(' ')}`] : [];
    },
    '*.{ts,tsx,js,jsx,mjs}': eslintFixCommands,
    'examples/demo/**/*.{yaml,ts}': regenerateDemoDocs,
    'packages/core/src/render/**/*.ts': regenerateDemoDocs,
};
