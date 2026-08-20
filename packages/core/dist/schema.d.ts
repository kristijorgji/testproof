import { z } from 'zod';
export declare const FLOW_ID_RE: RegExp;
export declare const STEP_ID_RE: RegExp;
export declare const PARAM_ID_RE: RegExp;
export declare const flowScopeSchema: z.ZodEnum<{
    common: "common";
    web: "web";
    mobile: "mobile";
}>;
export type FlowScope = z.infer<typeof flowScopeSchema>;
export declare const coverageStatusSchema: z.ZodEnum<{
    automated: "automated";
    partial: "partial";
    todo: "todo";
    manual: "manual";
}>;
export type CoverageStatus = z.infer<typeof coverageStatusSchema>;
export declare const prioritySchema: z.ZodEnum<{
    low: "low";
    medium: "medium";
    high: "high";
    critical: "critical";
}>;
export declare const severitySchema: z.ZodEnum<{
    critical: "critical";
    trivial: "trivial";
    minor: "minor";
    normal: "normal";
    major: "major";
    blocker: "blocker";
}>;
export declare const caseTypeSchema: z.ZodEnum<{
    functional: "functional";
    smoke: "smoke";
    regression: "regression";
    security: "security";
    usability: "usability";
    performance: "performance";
    accessibility: "accessibility";
    acceptance: "acceptance";
    other: "other";
}>;
export declare const layerSchema: z.ZodEnum<{
    e2e: "e2e";
    integration: "integration";
    api: "api";
    unit: "unit";
}>;
export declare const behaviorSchema: z.ZodEnum<{
    positive: "positive";
    negative: "negative";
    destructive: "destructive";
}>;
export declare const caseStatusSchema: z.ZodEnum<{
    draft: "draft";
    active: "active";
    deprecated: "deprecated";
}>;
export declare const automationOverrideSchema: z.ZodEnum<{
    automated: "automated";
    manual: "manual";
    "to-be-automated": "to-be-automated";
}>;
export declare const resultStatusSchema: z.ZodEnum<{
    pass: "pass";
    fail: "fail";
    blocked: "blocked";
    skip: "skip";
    retest: "retest";
    flaky: "flaky";
}>;
export declare const platformNodeSchema: z.ZodType<PlatformNode>;
export interface PlatformNode {
    id: string;
    title: string;
    children?: PlatformNode[];
}
export declare const dimensionSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    values: z.ZodArray<z.ZodString>;
    appliesTo: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type Dimension = z.infer<typeof dimensionSchema>;
export declare const targetObjectSchema: z.ZodObject<{
    platform: z.ZodString;
    dimensions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export type TargetObject = z.infer<typeof targetObjectSchema>;
export declare const targetSchema: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    platform: z.ZodString;
    dimensions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>;
}, z.core.$strip>]>;
export type FlowTarget = z.infer<typeof targetSchema>;
export declare const stepSchema: z.ZodObject<{
    action: z.ZodOptional<z.ZodString>;
    expected: z.ZodOptional<z.ZodString>;
    sharedStepId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type FlowStep = z.infer<typeof stepSchema>;
export declare const linkSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    url: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type FlowLink = z.infer<typeof linkSchema>;
export declare const sharedStepSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        action: z.ZodOptional<z.ZodString>;
        expected: z.ZodOptional<z.ZodString>;
        sharedStepId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SharedStep = z.infer<typeof sharedStepSchema>;
export declare const parameterDefSchema: z.ZodObject<{
    id: z.ZodString;
    values: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
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
export declare const flowSchema: z.ZodType<Flow>;
export declare const groupSchema: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    flows: z.ZodArray<z.ZodType<Flow, unknown, z.core.$ZodTypeInternals<Flow, unknown>>>;
}, z.core.$strip>;
export type FlowGroup = z.infer<typeof groupSchema>;
export declare const areaSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    scope: z.ZodOptional<z.ZodEnum<{
        common: "common";
        web: "web";
        mobile: "mobile";
    }>>;
    intro: z.ZodOptional<z.ZodString>;
    groups: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        flows: z.ZodArray<z.ZodType<Flow, unknown, z.core.$ZodTypeInternals<Flow, unknown>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type FlowArea = z.infer<typeof areaSchema>;
export declare const ledgerSchema: z.ZodObject<{
    version: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    platforms: z.ZodOptional<z.ZodArray<z.ZodType<PlatformNode, unknown, z.core.$ZodTypeInternals<PlatformNode, unknown>>>>;
    dimensions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        values: z.ZodArray<z.ZodString>;
        appliesTo: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    sharedSteps: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        steps: z.ZodArray<z.ZodObject<{
            action: z.ZodOptional<z.ZodString>;
            expected: z.ZodOptional<z.ZodString>;
            sharedStepId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    parameters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        values: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>>;
    areas: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        scope: z.ZodOptional<z.ZodEnum<{
            common: "common";
            web: "web";
            mobile: "mobile";
        }>>;
        intro: z.ZodOptional<z.ZodString>;
        groups: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            subtitle: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
            flows: z.ZodArray<z.ZodType<Flow, unknown, z.core.$ZodTypeInternals<Flow, unknown>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type Ledger = z.infer<typeof ledgerSchema>;
/** @deprecated use Ledger */
export type FlowsLedger = Ledger;
export type FlowDefinition = Flow;
export declare const DEFAULT_PLATFORMS: PlatformNode[];
export declare const coverageCellSchema: z.ZodObject<{
    platform: z.ZodString;
    dimensions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
export type CoverageCell = z.infer<typeof coverageCellSchema>;
export declare const coveragePushFlowSchema: z.ZodObject<{
    id: z.ZodString;
    scope: z.ZodOptional<z.ZodEnum<{
        common: "common";
        web: "web";
        mobile: "mobile";
    }>>;
    status: z.ZodEnum<{
        automated: "automated";
        partial: "partial";
        todo: "todo";
        manual: "manual";
    }>;
    demanded: z.ZodOptional<z.ZodArray<z.ZodObject<{
        platform: z.ZodString;
        dimensions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>>;
    covered: z.ZodOptional<z.ZodArray<z.ZodObject<{
        platform: z.ZodString;
        dimensions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>>;
    platforms: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const coveragePushBodySchema: z.ZodObject<{
    projectId: z.ZodString;
    commitSha: z.ZodString;
    branch: z.ZodString;
    flows: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        scope: z.ZodOptional<z.ZodEnum<{
            common: "common";
            web: "web";
            mobile: "mobile";
        }>>;
        status: z.ZodEnum<{
            automated: "automated";
            partial: "partial";
            todo: "todo";
            manual: "manual";
        }>;
        demanded: z.ZodOptional<z.ZodArray<z.ZodObject<{
            platform: z.ZodString;
            dimensions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>>>;
        covered: z.ZodOptional<z.ZodArray<z.ZodObject<{
            platform: z.ZodString;
            dimensions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>>>;
        platforms: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>>;
    summary: z.ZodObject<{
        automated: z.ZodNumber;
        partial: z.ZodNumber;
        todo: z.ZodNumber;
        manual: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CoveragePushBody = z.infer<typeof coveragePushBodySchema>;
export declare const runResultSchema: z.ZodObject<{
    flowId: z.ZodNullable<z.ZodString>;
    platform: z.ZodOptional<z.ZodString>;
    dimensions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    status: z.ZodEnum<{
        pass: "pass";
        fail: "fail";
        blocked: "blocked";
        skip: "skip";
        retest: "retest";
        flaky: "flaky";
    }>;
    durationMs: z.ZodOptional<z.ZodNumber>;
    errorText: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RunResult = z.infer<typeof runResultSchema>;
export declare const runPushBodySchema: z.ZodObject<{
    projectId: z.ZodString;
    source: z.ZodEnum<{
        manual: "manual";
        playwright: "playwright";
        junit: "junit";
        maestro: "maestro";
    }>;
    commitSha: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodString>;
    finishedAt: z.ZodOptional<z.ZodString>;
    results: z.ZodArray<z.ZodObject<{
        flowId: z.ZodNullable<z.ZodString>;
        platform: z.ZodOptional<z.ZodString>;
        dimensions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        status: z.ZodEnum<{
            pass: "pass";
            fail: "fail";
            blocked: "blocked";
            skip: "skip";
            retest: "retest";
            flaky: "flaky";
        }>;
        durationMs: z.ZodOptional<z.ZodNumber>;
        errorText: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type RunPushBody = z.infer<typeof runPushBodySchema>;
//# sourceMappingURL=schema.d.ts.map