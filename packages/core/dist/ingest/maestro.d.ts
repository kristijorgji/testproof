import type { RunResult } from '../schema.js';
export interface MaestroRunFile {
    path: string;
    status: RunResult['status'];
    durationMs?: number;
    errorText?: string;
}
export declare function parseMaestroResults(flowsDir: string, runs: MaestroRunFile[], platform?: string): RunResult[];
//# sourceMappingURL=maestro.d.ts.map