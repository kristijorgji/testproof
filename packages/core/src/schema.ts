import { z } from 'zod';

export const FLOW_ID_RE = /^FLOW-[A-Z0-9-]+$/;
export const STEP_ID_RE = /^STEP-[A-Z0-9-]+$/;
export const PARAM_ID_RE = /^PARAM-[A-Z0-9-]+$/;

export const flowScopeSchema = z.enum(['common', 'web', 'mobile']);
export type FlowScope = z.infer<typeof flowScopeSchema>;

export const coverageStatusSchema = z.enum(['automated', 'partial', 'todo', 'manual']);
export type CoverageStatus = z.infer<typeof coverageStatusSchema>;

export const prioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export const severitySchema = z.enum(['trivial', 'minor', 'normal', 'major', 'critical', 'blocker']);
export const caseTypeSchema = z.enum([
    'functional',
    'smoke',
    'regression',
    'security',
    'usability',
    'performance',
    'accessibility',
    'acceptance',
    'other',
]);
export const layerSchema = z.enum(['e2e', 'integration', 'api', 'unit']);
export const behaviorSchema = z.enum(['positive', 'negative', 'destructive']);
export const caseStatusSchema = z.enum(['draft', 'active', 'deprecated']);
export const automationOverrideSchema = z.enum(['automated', 'to-be-automated', 'manual']);
export const resultStatusSchema = z.enum(['pass', 'fail', 'blocked', 'skip', 'retest', 'flaky']);

export const platformNodeSchema: z.ZodType<PlatformNode> = z.lazy(() =>
    z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        children: z.array(platformNodeSchema).optional(),
    }),
);

export interface PlatformNode {
    id: string;
    title: string;
    children?: PlatformNode[];
}

export const dimensionSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    values: z.array(z.string().min(1)).min(1),
    appliesTo: z.array(z.string().min(1)).optional(),
});
export type Dimension = z.infer<typeof dimensionSchema>;

export const targetObjectSchema = z.object({
    platform: z.string().min(1),
    dimensions: z.record(z.string(), z.array(z.string().min(1)).min(1)).optional(),
});
export type TargetObject = z.infer<typeof targetObjectSchema>;

export const targetSchema = z.union([z.string().min(1), targetObjectSchema]);
export type FlowTarget = z.infer<typeof targetSchema>;

export const stepSchema = z.object({
    action: z.string().min(1).optional(),
    expected: z.string().min(1).optional(),
    sharedStepId: z.string().regex(STEP_ID_RE).optional(),
});
export type FlowStep = z.infer<typeof stepSchema>;

export const linkSchema = z.object({
    type: z.string().min(1).optional(),
    url: z.string().min(1),
    title: z.string().min(1).optional(),
});
export type FlowLink = z.infer<typeof linkSchema>;

export const sharedStepSchema = z.object({
    id: z.string().regex(STEP_ID_RE),
    title: z.string().min(1),
    steps: z.array(stepSchema),
});
export type SharedStep = z.infer<typeof sharedStepSchema>;

export const parameterDefSchema = z.object({
    id: z.string().regex(PARAM_ID_RE),
    values: z.array(z.string().min(1)).min(1),
});
export type ParameterDef = z.infer<typeof parameterDefSchema>;

export interface Flow {
    id: string;
    title: string;
    note?: string;
    notes?: string;
    manual?: boolean;
    refs?: string[];
    children?: Flow[];
    targets?: FlowTarget[];
    priority?: z.infer<typeof prioritySchema>;
    severity?: z.infer<typeof severitySchema>;
    type?: z.infer<typeof caseTypeSchema>;
    layer?: z.infer<typeof layerSchema>;
    behavior?: z.infer<typeof behaviorSchema>;
    status?: z.infer<typeof caseStatusSchema>;
    automation?: z.infer<typeof automationOverrideSchema>;
    owner?: string;
    tags?: string[];
    flaky?: boolean;
    muted?: boolean;
    estimateMinutes?: number;
    preconditions?: string;
    postconditions?: string;
    steps?: FlowStep[];
    links?: FlowLink[];
    parameters?: string[];
    custom?: Record<string, string>;
}

export const flowSchema: z.ZodType<Flow> = z.lazy(() =>
    z.object({
        id: z.string().regex(FLOW_ID_RE, { error: `invalid FLOW id` }),
        title: z.string().min(1),
        note: z.string().min(1).optional(),
        notes: z.string().min(1).optional(),
        manual: z.boolean().optional(),
        refs: z.array(z.string()).optional(),
        children: z.array(flowSchema).optional(),
        targets: z.array(targetSchema).optional(),
        priority: prioritySchema.optional(),
        severity: severitySchema.optional(),
        type: caseTypeSchema.optional(),
        layer: layerSchema.optional(),
        behavior: behaviorSchema.optional(),
        status: caseStatusSchema.optional(),
        automation: automationOverrideSchema.optional(),
        owner: z.string().min(1).optional(),
        tags: z.array(z.string().min(1)).optional(),
        flaky: z.boolean().optional(),
        muted: z.boolean().optional(),
        estimateMinutes: z.number().nonnegative().optional(),
        preconditions: z.string().min(1).optional(),
        postconditions: z.string().min(1).optional(),
        steps: z.array(stepSchema).optional(),
        links: z.array(linkSchema).optional(),
        parameters: z.array(z.string()).optional(),
        custom: z.record(z.string(), z.string()).optional(),
    }),
);

export const groupSchema = z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
    flows: z.array(flowSchema),
});
export type FlowGroup = z.infer<typeof groupSchema>;

export const areaSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    scope: flowScopeSchema.optional(),
    intro: z.string().min(1).optional(),
    groups: z.array(groupSchema),
});
export type FlowArea = z.infer<typeof areaSchema>;

export const ledgerSchema = z.object({
    version: z.literal(2),
    platforms: z.array(platformNodeSchema).optional(),
    dimensions: z.array(dimensionSchema).optional(),
    sharedSteps: z.array(sharedStepSchema).optional(),
    parameters: z.array(parameterDefSchema).optional(),
    areas: z.array(areaSchema).min(1),
});

export type Ledger = z.infer<typeof ledgerSchema>;
/** @deprecated use Ledger */
// eslint-disable-next-line kj/no-pure-type-alias -- public deprecated alias kept for existing consumers
export type FlowsLedger = Ledger;
// eslint-disable-next-line kj/no-pure-type-alias -- public alias kept for existing consumers
export type FlowDefinition = Flow;

export const DEFAULT_PLATFORMS: PlatformNode[] = [
    { id: 'web', title: 'Web' },
    { id: 'mobile', title: 'Mobile' },
];

export const coverageCellSchema = z.object({
    platform: z.string().min(1),
    dimensions: z.record(z.string(), z.string()).default({}),
});
export type CoverageCell = z.infer<typeof coverageCellSchema>;

export const coveragePushFlowSchema = z.object({
    id: z.string(),
    scope: flowScopeSchema.optional(),
    status: coverageStatusSchema,
    demanded: z.array(coverageCellSchema).optional(),
    covered: z.array(coverageCellSchema).optional(),
    platforms: z.record(z.string(), z.array(z.string())).optional(),
});

export const coveragePushBodySchema = z.object({
    projectId: z.string().min(1),
    commitSha: z.string().min(1),
    branch: z.string().min(1),
    flows: z.array(coveragePushFlowSchema),
    summary: z.object({
        automated: z.number().int().nonnegative(),
        partial: z.number().int().nonnegative(),
        todo: z.number().int().nonnegative(),
        manual: z.number().int().nonnegative(),
    }),
});
export type CoveragePushBody = z.infer<typeof coveragePushBodySchema>;

export const runResultSchema = z.object({
    flowId: z.string().nullable(),
    platform: z.string().min(1).optional(),
    dimensions: z.record(z.string(), z.string()).optional(),
    status: resultStatusSchema,
    durationMs: z.number().nonnegative().optional(),
    errorText: z.string().optional(),
});
export type RunResult = z.infer<typeof runResultSchema>;

export const runPushBodySchema = z.object({
    projectId: z.string().min(1),
    source: z.enum(['playwright', 'junit', 'maestro', 'manual']),
    commitSha: z.string().min(1).optional(),
    branch: z.string().min(1).optional(),
    startedAt: z.string().optional(),
    finishedAt: z.string().optional(),
    results: z.array(runResultSchema),
});
export type RunPushBody = z.infer<typeof runPushBodySchema>;

export const storageModeSchema = z.enum(['git', 'file', 'db']);
export type StorageMode = z.infer<typeof storageModeSchema>;

export const ledgerGetResponseSchema = z.object({
    yaml: z.string(),
    revision: z.number().int(),
    storage: storageModeSchema,
});
export type LedgerGetResponse = z.infer<typeof ledgerGetResponseSchema>;

export const ledgerPutBodySchema = z.object({
    yaml: z.string().min(1),
    baseRevision: z.number().int(),
    message: z.string().min(1).optional(),
});
export type LedgerPutBody = z.infer<typeof ledgerPutBodySchema>;
