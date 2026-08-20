import type { RunResult } from '../schema.js';
interface PlaywrightTest {
    projectName?: string;
    status?: string;
    duration?: number;
    error?: {
        message?: string;
    };
    tags?: string[];
    annotations?: Array<{
        type?: string;
        description?: string;
    }>;
    results?: Array<{
        status?: string;
        duration?: number;
        error?: {
            message?: string;
        };
    }>;
}
interface PlaywrightSpec {
    title?: string;
    tags?: string[];
    tests?: PlaywrightTest[];
}
interface PlaywrightSuite {
    title?: string;
    suites?: PlaywrightSuite[];
    specs?: PlaywrightSpec[];
}
export interface PlaywrightJsonReport {
    suites?: PlaywrightSuite[];
}
export declare function parsePlaywrightJson(report: PlaywrightJsonReport, platform?: string): RunResult[];
export {};
//# sourceMappingURL=playwright.d.ts.map