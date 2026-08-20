import { z } from 'zod';
export const FLOW_ID_RE = /^FLOW-[A-Z0-9-]+$/;
export const STEP_ID_RE = /^STEP-[A-Z0-9-]+$/;
export const PARAM_ID_RE = /^PARAM-[A-Z0-9-]+$/;
export const flowScopeSchema = z.enum(['common', 'web', 'mobile']);
export const coverageStatusSchema = z.enum(['automated', 'partial', 'todo', 'manual']);
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
export const platformNodeSchema = z.lazy(() => z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    children: z.array(platformNodeSchema).optional(),
}));
export const dimensionSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    values: z.array(z.string().min(1)).min(1),
    appliesTo: z.array(z.string().min(1)).optional(),
});
export const targetObjectSchema = z.object({
    platform: z.string().min(1),
    dimensions: z.record(z.string(), z.array(z.string().min(1)).min(1)).optional(),
});
export const targetSchema = z.union([z.string().min(1), targetObjectSchema]);
export const stepSchema = z.object({
    action: z.string().min(1).optional(),
    expected: z.string().min(1).optional(),
    sharedStepId: z.string().regex(STEP_ID_RE).optional(),
});
export const linkSchema = z.object({
    type: z.string().min(1).optional(),
    url: z.string().min(1),
    title: z.string().min(1).optional(),
});
export const sharedStepSchema = z.object({
    id: z.string().regex(STEP_ID_RE),
    title: z.string().min(1),
    steps: z.array(stepSchema),
});
export const parameterDefSchema = z.object({
    id: z.string().regex(PARAM_ID_RE),
    values: z.array(z.string().min(1)).min(1),
});
export const flowSchema = z.lazy(() => z.object({
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
}));
export const groupSchema = z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
    flows: z.array(flowSchema),
});
export const areaSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    scope: flowScopeSchema.optional(),
    intro: z.string().min(1).optional(),
    groups: z.array(groupSchema),
});
export const ledgerSchema = z.object({
    version: z.union([z.literal(1), z.literal(2)]),
    platforms: z.array(platformNodeSchema).optional(),
    dimensions: z.array(dimensionSchema).optional(),
    sharedSteps: z.array(sharedStepSchema).optional(),
    parameters: z.array(parameterDefSchema).optional(),
    areas: z.array(areaSchema).min(1),
});
export const DEFAULT_PLATFORMS = [
    { id: 'web', title: 'Web' },
    { id: 'mobile', title: 'Mobile' },
];
export const coverageCellSchema = z.object({
    platform: z.string().min(1),
    dimensions: z.record(z.string(), z.string()).default({}),
});
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
export const runResultSchema = z.object({
    flowId: z.string().nullable(),
    platform: z.string().min(1).optional(),
    dimensions: z.record(z.string(), z.string()).optional(),
    status: resultStatusSchema,
    durationMs: z.number().nonnegative().optional(),
    errorText: z.string().optional(),
});
export const runPushBodySchema = z.object({
    projectId: z.string().min(1),
    source: z.enum(['playwright', 'junit', 'maestro', 'manual']),
    commitSha: z.string().min(1).optional(),
    branch: z.string().min(1).optional(),
    startedAt: z.string().optional(),
    finishedAt: z.string().optional(),
    results: z.array(runResultSchema),
});
//# sourceMappingURL=schema.js.map