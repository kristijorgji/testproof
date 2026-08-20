import type { LedgerDocument } from './document.js';
import type { Flow, FlowScope } from './schema.js';
export type FlowParent = {
    areaId: string;
    groupIndex: number;
    parentFlowId?: string;
};
export type LedgerPatch = {
    op: 'set-flow-field';
    flowId: string;
    field: 'title' | 'note';
    value: string;
} | {
    op: 'set-flow-manual';
    flowId: string;
    value: boolean;
} | {
    op: 'set-flow-refs';
    flowId: string;
    value: string[];
} | {
    op: 'set-flow-targets';
    flowId: string;
    value: Array<string | {
        platform: string;
        dimensions?: Record<string, string[]>;
    }>;
} | {
    op: 'add-flow';
    parent: FlowParent;
    flow: Flow;
    index: number;
} | {
    op: 'remove-flow';
    flowId: string;
} | {
    op: 'move-flow';
    flowId: string;
    to: FlowParent & {
        index: number;
    };
} | {
    op: 'set-group-field';
    areaId: string;
    groupIndex: number;
    field: 'title' | 'subtitle' | 'notes';
    value: string;
} | {
    op: 'add-group';
    areaId: string;
    title: string;
    index: number;
} | {
    op: 'remove-group';
    areaId: string;
    groupIndex: number;
} | {
    op: 'move-group';
    areaId: string;
    from: number;
    to: number;
} | {
    op: 'set-area-field';
    areaId: string;
    field: 'title' | 'scope' | 'intro';
    value: string;
} | {
    op: 'add-area';
    area: {
        id: string;
        title: string;
        scope?: FlowScope;
    };
    index: number;
} | {
    op: 'remove-area';
    areaId: string;
} | {
    op: 'move-area';
    from: number;
    to: number;
} | {
    op: 'set-version';
    value: 1 | 2;
} | {
    op: 'set-root-seq';
    key: 'platforms' | 'dimensions';
    value: unknown;
};
export declare function applyPatch(doc: LedgerDocument, patch: LedgerPatch): void;
export declare function applyPatches(doc: LedgerDocument, patches: LedgerPatch[]): void;
//# sourceMappingURL=patch.d.ts.map