import { parseDocument } from 'yaml';
export function openLedgerDocument(source) {
    return parseDocument(source, { keepSourceTokens: true });
}
export function serializeLedgerDocument(doc) {
    return doc.toString({ lineWidth: 0, blockQuote: 'literal' });
}
//# sourceMappingURL=document.js.map