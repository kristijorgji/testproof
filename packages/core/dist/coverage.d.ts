import type { PlatformScannerConfig } from './config.js';
import type { CoverageCell, CoverageStatus, FlowScope, Ledger } from './schema.js';
import { collectWebE2eFlowFileMap } from './scan/web.js';
export interface PlatformCoverage {
    files: string[];
}
export interface FlowCoverage {
    id: string;
    scope: FlowScope;
    manual: boolean;
    web: PlatformCoverage;
    mobile: PlatformCoverage;
    filesByPlatform: Record<string, string[]>;
    demanded: CoverageCell[];
    covered: CoverageCell[];
    status: CoverageStatus;
}
export interface DeriveCoverageOptions {
    scanners?: PlatformScannerConfig[];
    /** @deprecated use scanners */
    maestroFlowsDir?: string;
    /** @deprecated use scanners */
    webSpecsDir?: string;
    maestroLinkPrefix?: string;
    webLinkPrefix?: string;
}
export declare function collectMaestroFlowFileMap(flowsDir: string): Map<string, string[]>;
export declare function coverageStatusFor(scope: FlowScope, manual: boolean, webFiles: string[], mobileFiles: string[]): CoverageStatus;
export declare function deriveCoverage(ledger: Ledger, options: DeriveCoverageOptions): Map<string, FlowCoverage>;
export declare function summarizeCoverage(coverage: Map<string, FlowCoverage>): Record<CoverageStatus, number>;
export declare function collectIncompleteCoreIds(ledger: Ledger, coverage: Map<string, FlowCoverage>, coreAreaIds: string[]): string[];
export { collectWebE2eFlowFileMap };
//# sourceMappingURL=coverage.d.ts.map