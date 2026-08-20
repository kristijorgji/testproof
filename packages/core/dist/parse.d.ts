import { type Flow, type Ledger } from './schema.js';
export declare function flattenFlows(ledger: Ledger): Flow[];
export declare function flattenFlowIds(ledger: Ledger): string[];
export declare function attachImplicitTargets(ledger: Ledger): Ledger;
export declare function parseLedger(yamlSource: string): Ledger;
/** Alias kept for existing consumer configs. */
export declare const parseFlowsLedger: typeof parseLedger;
//# sourceMappingURL=parse.d.ts.map