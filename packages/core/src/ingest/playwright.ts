import { WEB_FLOW_TAG_RE } from '../scan/web.js';
import type { RunResult } from '../schema.js';

interface PlaywrightTest {
    projectName?: string;
    status?: string;
    duration?: number;
    error?: { message?: string };
    tags?: string[];
    annotations?: Array<{ type?: string; description?: string }>;
    results?: Array<{ status?: string; duration?: number; error?: { message?: string } }>;
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

const FLOW_RE = /FLOW-[A-Z0-9-]+/;

function flowIdsFrom(values: string[]): string[] {
    const ids: string[] = [];
    for (const value of values) {
        const tagged = value.match(WEB_FLOW_TAG_RE) ?? [];
        for (const tag of tagged) ids.push(tag.slice(1));
        if (FLOW_RE.test(value) && !value.includes('@')) ids.push(value.replace(/^@/, ''));
    }
    return [...new Set(ids.filter((id) => FLOW_RE.test(id)))];
}

function mapStatus(status: string | undefined): RunResult['status'] {
    switch (status) {
        case 'passed':
            return 'pass';
        case 'failed':
        case 'timedOut':
            return 'fail';
        case 'skipped':
        case 'interrupted':
            return 'skip';
        case 'flaky':
            return 'flaky';
        default:
            return 'fail';
    }
}

export function parsePlaywrightJson(report: PlaywrightJsonReport, platform = 'web'): RunResult[] {
    const results: RunResult[] = [];

    const walk = (suite: PlaywrightSuite): void => {
        for (const child of suite.suites ?? []) walk(child);
        for (const spec of suite.specs ?? []) {
            const specIds = flowIdsFrom([spec.title ?? '', ...(spec.tags ?? [])]);
            for (const test of spec.tests ?? []) {
                const last = test.results?.[test.results.length - 1];
                const status = mapStatus(last?.status ?? test.status);
                const ids = flowIdsFrom([
                    ...specIds,
                    ...(test.tags ?? []),
                    ...(test.annotations ?? []).flatMap((a) => [a.type ?? '', a.description ?? '']),
                ]);
                const entry = {
                    platform: test.projectName ?? platform,
                    status,
                    durationMs: last?.duration ?? test.duration,
                    errorText: last?.error?.message ?? test.error?.message,
                };
                if (ids.length === 0) {
                    results.push({ flowId: null, ...entry });
                } else {
                    for (const flowId of ids) results.push({ flowId, ...entry });
                }
            }
        }
    };

    for (const suite of report.suites ?? []) walk(suite);
    return results;
}
