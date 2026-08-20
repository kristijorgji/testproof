import { parse as parseYaml } from 'yaml';

import {
    findPlatform,
    inferAreaScope,
    ledgerPlatforms,
    scopeToTargets,
    targetDimensions,
    targetPlatformId,
} from './platforms.js';
import {
    DEFAULT_PLATFORMS,
    type Flow,
    FLOW_ID_RE,
    type FlowArea,
    type Ledger,
    ledgerSchema,
    type PlatformNode,
} from './schema.js';

export function flattenFlows(ledger: Ledger): Flow[] {
    const out: Flow[] = [];
    const walk = (flows: Flow[]): void => {
        for (const flow of flows) {
            out.push(flow);
            if (flow.children?.length) walk(flow.children);
        }
    };
    for (const area of ledger.areas) {
        for (const group of area.groups) walk(group.flows);
    }
    return out;
}

export function flattenFlowIds(ledger: Ledger): string[] {
    return flattenFlows(ledger).map((f) => f.id);
}

export function attachImplicitTargets(ledger: Ledger): Ledger {
    const walk = (flows: Flow[], area: FlowArea): Flow[] =>
        flows.map((flow) => ({
            ...flow,
            targets: flow.targets ?? (area.scope ? scopeToTargets(area.scope) : ['web', 'mobile']),
            children: flow.children?.length ? walk(flow.children, area) : flow.children,
        }));

    return {
        ...ledger,
        platforms: ledger.platforms?.length ? ledger.platforms : DEFAULT_PLATFORMS,
        areas: ledger.areas.map((area) => ({
            ...area,
            scope: inferAreaScope(area, ledgerPlatforms(ledger)),
            groups: area.groups.map((group) => ({
                ...group,
                flows: walk(group.flows, area),
            })),
        })),
    };
}

function assertRefs(ledger: Ledger): void {
    const platforms = ledgerPlatforms(ledger);
    const dimById = new Map((ledger.dimensions ?? []).map((d) => [d.id, d]));
    const shared = new Set((ledger.sharedSteps ?? []).map((s) => s.id));
    const params = new Set((ledger.parameters ?? []).map((p) => p.id));

    const checkFlow = (flow: Flow, area: FlowArea): void => {
        if (!FLOW_ID_RE.test(flow.id)) {
            throw new Error(`flows ledger: invalid FLOW id "${flow.id}"`);
        }
        for (const target of flow.targets ?? []) {
            const platformId = targetPlatformId(target);
            if (!findPlatform(platforms, platformId)) {
                throw new Error(`flows ledger: unknown platform "${platformId}" on ${flow.id}`);
            }
            const dims = targetDimensions(target);
            if (!dims) continue;
            for (const [dimId, values] of Object.entries(dims)) {
                const dim = dimById.get(dimId);
                if (!dim) throw new Error(`flows ledger: unknown dimension "${dimId}" on ${flow.id}`);
                if (
                    dim.appliesTo?.length &&
                    !dim.appliesTo.some((p) => platformId === p || platformId.startsWith(`${p}.`))
                ) {
                    throw new Error(
                        `flows ledger: dimension "${dimId}" does not apply to platform "${platformId}" on ${flow.id}`,
                    );
                }
                for (const value of values) {
                    if (!dim.values.includes(value)) {
                        throw new Error(
                            `flows ledger: unknown value "${value}" for dimension "${dimId}" on ${flow.id}`,
                        );
                    }
                }
            }
        }
        for (const step of flow.steps ?? []) {
            if (step.sharedStepId && !shared.has(step.sharedStepId)) {
                throw new Error(`flows ledger: unknown sharedStepId "${step.sharedStepId}" on ${flow.id}`);
            }
        }
        for (const paramId of flow.parameters ?? []) {
            if (!params.has(paramId)) {
                throw new Error(`flows ledger: unknown parameter "${paramId}" on ${flow.id}`);
            }
        }
        void area;
        for (const child of flow.children ?? []) checkFlow(child, area);
    };

    for (const area of ledger.areas) {
        if (ledger.version === 1 && !area.scope) {
            throw new Error(`flows ledger: areas[].scope must be common|web|mobile (got "${String(area.scope)}")`);
        }
        for (const group of area.groups) {
            for (const flow of group.flows) checkFlow(flow, area);
        }
    }

    const seen = new Set<string>();
    for (const id of flattenFlowIds(ledger)) {
        if (seen.has(id)) throw new Error(`flows ledger: duplicate FLOW id "${id}"`);
        seen.add(id);
    }

    const platformIds = new Set<string>();
    const walkP = (nodes: PlatformNode[]): void => {
        for (const node of nodes) {
            if (platformIds.has(node.id)) throw new Error(`flows ledger: duplicate platform id "${node.id}"`);
            platformIds.add(node.id);
            if (node.children) walkP(node.children);
        }
    };
    walkP(platforms);
}

export function parseLedger(yamlSource: string): Ledger {
    const raw = parseYaml(yamlSource) as unknown;
    let parsed;
    try {
        parsed = ledgerSchema.parse(raw);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/invalid_format|FLOW_ID_RE|regex/i.test(message) || message.includes('FLOW')) {
            throw new Error(`flows ledger: invalid FLOW id ${message}`, { cause: error });
        }
        if (/scope/.test(message)) {
            throw new Error(`flows ledger: areas[].scope must be common|web|mobile`, { cause: error });
        }
        throw new Error(`flows ledger: ${message}`, { cause: error });
    }
    if (parsed.version === 1 && parsed.areas.some((a) => !a.scope)) {
        throw new Error('flows ledger: areas[].scope must be common|web|mobile');
    }
    const normalized = attachImplicitTargets(parsed);
    assertRefs(normalized);
    return normalized;
}

/** Alias kept for existing consumer configs. */
export const parseFlowsLedger = parseLedger;
