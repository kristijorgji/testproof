import { type Document } from 'yaml';
export type LedgerDocument = Document.Parsed;
export declare function openLedgerDocument(source: string): LedgerDocument;
export declare function serializeLedgerDocument(doc: LedgerDocument): string;
//# sourceMappingURL=document.d.ts.map