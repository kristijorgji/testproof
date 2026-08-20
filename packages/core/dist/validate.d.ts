import type { PlatformScannerConfig } from './config.js';
export interface ValidateResult {
    maestroIds: string[];
    webIds: string[];
    ledgerIds: string[];
    missingFromLedger: string[];
    incompleteCoreIds: string[];
}
export declare function validateLedger(options: {
    yamlSource: string;
    scanners: PlatformScannerConfig[];
    coreAreaIds?: string[];
}): ValidateResult;
//# sourceMappingURL=validate.d.ts.map