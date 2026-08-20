import { type Document, parseDocument } from 'yaml';

// Document.Parsed is a namespaced type; a local alias keeps the public API readable.
// eslint-disable-next-line kj/no-pure-type-alias -- wraps yaml's namespaced Document.Parsed
export type LedgerDocument = Document.Parsed;

export function openLedgerDocument(source: string): LedgerDocument {
    return parseDocument(source, { keepSourceTokens: true });
}

export function serializeLedgerDocument(doc: LedgerDocument): string {
    return doc.toString({ lineWidth: 0, blockQuote: 'literal' });
}
