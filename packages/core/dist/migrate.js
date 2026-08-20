import { parse as parseYaml } from 'yaml';
import { openLedgerDocument, serializeLedgerDocument } from './document.js';
import { applyPatch } from './patch.js';
import { parseLedger } from './parse.js';
const DEFAULT_V2_PLATFORMS = [
    {
        id: 'web',
        title: 'Web',
        children: [
            { id: 'web.chrome', title: 'Chrome' },
            { id: 'web.safari', title: 'Safari' },
        ],
    },
    {
        id: 'mobile',
        title: 'Mobile app',
        children: [
            { id: 'mobile.ios', title: 'iOS' },
            { id: 'mobile.android', title: 'Android' },
        ],
    },
];
const DEFAULT_V2_DIMENSIONS = [
    { id: 'viewport', title: 'Viewport', values: ['mobile', 'tablet', 'desktop'], appliesTo: ['web'] },
    { id: 'theme', title: 'Theme', values: ['light', 'dark'] },
    { id: 'locale', title: 'Locale', values: ['en', 'de', 'sq'] },
    { id: 'role', title: 'Role', values: ['guest', 'user', 'professional'] },
];
function rawRootSeq(source, key) {
    const raw = parseYaml(source);
    const value = raw?.[key];
    return Array.isArray(value) ? value : undefined;
}
/** Rewrite a v1 ledger to v2 in place, preserving comments via the YAML document API. */
export function migrateLedgerSource(source) {
    parseLedger(source);
    const hasPlatforms = (rawRootSeq(source, 'platforms')?.length ?? 0) > 0;
    const hasDimensions = (rawRootSeq(source, 'dimensions')?.length ?? 0) > 0;
    if (hasPlatforms && hasDimensions && /^version:\s*2\b/m.test(source)) {
        return source;
    }
    const doc = openLedgerDocument(source);
    applyPatch(doc, { op: 'set-version', value: 2 });
    if (!hasPlatforms) {
        applyPatch(doc, { op: 'set-root-seq', key: 'platforms', value: DEFAULT_V2_PLATFORMS });
    }
    if (!hasDimensions) {
        applyPatch(doc, { op: 'set-root-seq', key: 'dimensions', value: DEFAULT_V2_DIMENSIONS });
    }
    return serializeLedgerDocument(doc);
}
//# sourceMappingURL=migrate.js.map