import type { CoverageCell, Flow, Ledger } from './schema.js';
export declare function resolveTargets(ledger: Ledger, flow: Flow): CoverageCell[];
export declare function cellKey(cell: CoverageCell): string;
export declare function cellsMatch(demanded: CoverageCell, covered: CoverageCell): boolean;
//# sourceMappingURL=targets.d.ts.map