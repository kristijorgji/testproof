import { parseDocument, type Document } from 'yaml';

export type LedgerDocument = Document.Parsed;

export function openLedgerDocument(source: string): LedgerDocument {
    return parseDocument(source, { keepSourceTokens: true });
}

export function serializeLedgerDocument(doc: LedgerDocument): string {
    return doc.toString({ lineWidth: 0, blockQuote: 'literal' });
}
