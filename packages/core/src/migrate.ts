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

/** Rewrite a v1 ledger to v2 in place, preserving comments via the YAML document API. */
export function migrateLedgerSource(source: string): string {
    const ledger = parseLedger(source);
    if (ledger.version === 2 && ledger.platforms?.length) return source;
    const doc = openLedgerDocument(source);
    applyPatch(doc, { op: 'set-version', value: 2 });
    if (!ledger.platforms?.length) {
        applyPatch(doc, { op: 'set-root-seq', key: 'platforms', value: DEFAULT_V2_PLATFORMS });
    }
    if (!ledger.dimensions?.length) {
        applyPatch(doc, { op: 'set-root-seq', key: 'dimensions', value: DEFAULT_V2_DIMENSIONS });
    }
    return serializeLedgerDocument(doc);
}
