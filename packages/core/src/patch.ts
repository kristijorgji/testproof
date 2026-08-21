import { isMap, isSeq, Scalar, YAMLMap, YAMLSeq } from 'yaml';

import type { LedgerDocument } from './document.js';
import {
    automationOverrideSchema,
    behaviorSchema,
    caseStatusSchema,
    caseTypeSchema,
    type Flow,
    type FlowTarget,
    layerSchema,
    prioritySchema,
    severitySchema,
} from './schema.js';

export type FlowParent = { areaId: string; groupIndex: number; parentFlowId?: string };

export type FlowStringField = 'title' | 'notes' | 'owner' | 'preconditions' | 'postconditions';
export type FlowEnumField = 'priority' | 'severity' | 'type' | 'layer' | 'behavior' | 'status' | 'automation';
export type FlowFlagField = 'manual' | 'flaky' | 'muted';
export type FlowListField = 'tags' | 'parameters' | 'refs';

const FLOW_ENUM_SCHEMAS = {
    priority: prioritySchema,
    severity: severitySchema,
    type: caseTypeSchema,
    layer: layerSchema,
    behavior: behaviorSchema,
    status: caseStatusSchema,
    automation: automationOverrideSchema,
} as const;

export type LedgerPatch =
    | { op: 'set-flow-field'; flowId: string; field: FlowStringField; value: string | null }
    | { op: 'set-flow-enum'; flowId: string; field: FlowEnumField; value: string | null }
    | { op: 'set-flow-flag'; flowId: string; field: FlowFlagField; value: boolean }
    | { op: 'set-flow-number'; flowId: string; field: 'estimateMinutes'; value: number | null }
    | { op: 'set-flow-list'; flowId: string; field: FlowListField; value: string[] }
    | {
          op: 'set-flow-targets';
          flowId: string;
          value: Array<string | { platform: string; dimensions?: Record<string, string[]> }>;
      }
    | { op: 'add-flow'; parent: FlowParent; flow: Flow; index: number }
    | { op: 'remove-flow'; flowId: string }
    | { op: 'move-flow'; flowId: string; to: FlowParent & { index: number } }
    | {
          op: 'set-group-field';
          areaId: string;
          groupIndex: number;
          field: 'title' | 'subtitle' | 'notes';
          value: string;
      }
    | { op: 'add-group'; areaId: string; title: string; index: number }
    | { op: 'remove-group'; areaId: string; groupIndex: number }
    | { op: 'move-group'; areaId: string; from: number; to: number }
    | { op: 'set-area-field'; areaId: string; field: 'title' | 'intro'; value: string }
    | {
          op: 'set-area-targets';
          areaId: string;
          value: Array<string | { platform: string; dimensions?: Record<string, string[]> }>;
      }
    | { op: 'add-area'; area: { id: string; title: string; targets?: FlowTarget[] }; index: number }
    | { op: 'remove-area'; areaId: string }
    | { op: 'move-area'; from: number; to: number }
    | { op: 'set-root-seq'; key: 'platforms' | 'dimensions'; value: unknown };

function asMap(node: unknown): YAMLMap | undefined {
    return isMap(node) ? node : undefined;
}

function asSeq(node: unknown): YAMLSeq | undefined {
    return isSeq(node) ? node : undefined;
}

function scalar(value: string, block = false): Scalar {
    const s = new Scalar(value);
    if (block || value.includes('\n')) s.type = Scalar.BLOCK_LITERAL;
    return s;
}

function setOrDelete(map: YAMLMap, key: string, value: unknown, block = false): void {
    if (value === null) {
        map.delete(key);
        return;
    }
    if (typeof value === 'string') {
        map.set(key, scalar(value, block));
        return;
    }
    map.set(key, value);
}

function areasSeq(doc: LedgerDocument): YAMLSeq {
    const areas = asSeq(doc.get('areas'));
    if (!areas) throw new Error('ledger document has no areas sequence');
    return areas;
}

function areaMapById(doc: LedgerDocument, areaId: string): YAMLMap {
    const found = areasSeq(doc).items.find((item) => asMap(item)?.get('id') === areaId);
    const map = asMap(found);
    if (!map) throw new Error(`area "${areaId}" not found`);
    return map;
}

function groupsSeq(area: YAMLMap): YAMLSeq {
    const groups = asSeq(area.get('groups'));
    if (!groups) throw new Error('area has no groups');
    return groups;
}

function walkFlows(seq: YAMLSeq, visit: (map: YAMLMap, parent: YAMLSeq, index: number) => boolean | void): boolean {
    for (let i = 0; i < seq.items.length; i += 1) {
        const map = asMap(seq.items[i]);
        if (!map) continue;
        if (visit(map, seq, i)) return true;
        const children = asSeq(map.get('children'));
        if (children && walkFlows(children, visit)) return true;
    }
    return false;
}

function findFlow(doc: LedgerDocument, flowId: string): { map: YAMLMap; parent: YAMLSeq; index: number } {
    let found: { map: YAMLMap; parent: YAMLSeq; index: number } | undefined;
    for (const areaItem of areasSeq(doc).items) {
        const area = asMap(areaItem);
        if (!area) continue;
        const groups = asSeq(area.get('groups'));
        if (!groups) continue;
        for (const groupItem of groups.items) {
            const group = asMap(groupItem);
            const flows = asSeq(group?.get('flows'));
            if (!flows) continue;
            walkFlows(flows, (map, parent, index) => {
                if (map.get('id') === flowId) {
                    found = { map, parent, index };
                    return true;
                }
                return false;
            });
            if (found) return found;
        }
    }
    throw new Error(`flow "${flowId}" not found`);
}

function parentFlowsSeq(doc: LedgerDocument, parent: FlowParent): YAMLSeq {
    const area = areaMapById(doc, parent.areaId);
    const groups = groupsSeq(area);
    const group = asMap(groups.items[parent.groupIndex]);
    if (!group) throw new Error(`group ${parent.groupIndex} not found in ${parent.areaId}`);
    if (!parent.parentFlowId) {
        const flows = asSeq(group.get('flows'));
        if (!flows) throw new Error('group has no flows');
        return flows;
    }
    const { map } = findFlow(doc, parent.parentFlowId);
    let children = asSeq(map.get('children'));
    if (!children) {
        children = new YAMLSeq();
        map.set('children', children);
    }
    return children;
}

function flowToNode(flow: Flow): YAMLMap {
    const map = new YAMLMap();
    map.set('id', flow.id);
    map.set('title', flow.title);
    if (flow.notes) map.set('notes', scalar(flow.notes, true));
    if (flow.manual !== undefined) map.set('manual', flow.manual);
    if (flow.refs) map.set('refs', flow.refs);
    if (flow.targets) map.set('targets', flow.targets);
    if (flow.children?.length) {
        const children = new YAMLSeq();
        for (const child of flow.children) children.add(flowToNode(child));
        map.set('children', children);
    }
    return map;
}

export function applyPatch(doc: LedgerDocument, patch: LedgerPatch): void {
    switch (patch.op) {
        case 'set-flow-field': {
            const { map } = findFlow(doc, patch.flowId);
            const block =
                patch.field === 'notes' || patch.field === 'preconditions' || patch.field === 'postconditions';
            setOrDelete(map, patch.field, patch.value, block);
            return;
        }
        case 'set-flow-enum': {
            const { map } = findFlow(doc, patch.flowId);
            if (patch.value !== null) {
                FLOW_ENUM_SCHEMAS[patch.field].parse(patch.value);
            }
            setOrDelete(map, patch.field, patch.value);
            return;
        }
        case 'set-flow-flag':
        case 'set-flow-list': {
            const { map } = findFlow(doc, patch.flowId);
            map.set(patch.field, patch.value);
            return;
        }
        case 'set-flow-number': {
            const { map } = findFlow(doc, patch.flowId);
            setOrDelete(map, patch.field, patch.value);
            return;
        }
        case 'set-flow-targets': {
            const { map } = findFlow(doc, patch.flowId);
            map.set('targets', patch.value);
            return;
        }
        case 'add-flow': {
            const seq = parentFlowsSeq(doc, patch.parent);
            seq.items.splice(patch.index, 0, flowToNode(patch.flow));
            return;
        }
        case 'remove-flow': {
            const { parent, index } = findFlow(doc, patch.flowId);
            parent.items.splice(index, 1);
            return;
        }
        case 'move-flow': {
            const { map, parent, index } = findFlow(doc, patch.flowId);
            parent.items.splice(index, 1);
            const dest = parentFlowsSeq(doc, patch.to);
            dest.items.splice(patch.to.index, 0, map);
            return;
        }
        case 'set-group-field': {
            const group = asMap(groupsSeq(areaMapById(doc, patch.areaId)).items[patch.groupIndex]);
            if (!group) throw new Error('group not found');
            group.set(patch.field, scalar(patch.value, patch.field === 'notes'));
            return;
        }
        case 'add-group': {
            const groups = groupsSeq(areaMapById(doc, patch.areaId));
            const group = new YAMLMap();
            group.set('title', patch.title);
            group.set('flows', new YAMLSeq());
            groups.items.splice(patch.index, 0, group);
            return;
        }
        case 'remove-group': {
            groupsSeq(areaMapById(doc, patch.areaId)).items.splice(patch.groupIndex, 1);
            return;
        }
        case 'move-group': {
            const groups = groupsSeq(areaMapById(doc, patch.areaId));
            const [item] = groups.items.splice(patch.from, 1);
            if (item) groups.items.splice(patch.to, 0, item);
            return;
        }
        case 'set-area-field': {
            const area = areaMapById(doc, patch.areaId);
            area.set(patch.field, scalar(patch.value, patch.field === 'intro'));
            return;
        }
        case 'set-area-targets': {
            areaMapById(doc, patch.areaId).set('targets', patch.value);
            return;
        }
        case 'add-area': {
            const area = new YAMLMap();
            area.set('id', patch.area.id);
            area.set('title', patch.area.title);
            if (patch.area.targets?.length) area.set('targets', patch.area.targets);
            const groups = new YAMLSeq();
            const group = new YAMLMap();
            group.set('title', patch.area.title);
            group.set('flows', new YAMLSeq());
            groups.add(group);
            area.set('groups', groups);
            areasSeq(doc).items.splice(patch.index, 0, area);
            return;
        }
        case 'remove-area': {
            const areas = areasSeq(doc);
            const idx = areas.items.findIndex((item) => asMap(item)?.get('id') === patch.areaId);
            if (idx >= 0) areas.items.splice(idx, 1);
            return;
        }
        case 'move-area': {
            const areas = areasSeq(doc);
            const [item] = areas.items.splice(patch.from, 1);
            if (item) areas.items.splice(patch.to, 0, item);
            return;
        }
        case 'set-root-seq': {
            doc.set(patch.key, patch.value);
            return;
        }
    }
}

export function applyPatches(doc: LedgerDocument, patches: LedgerPatch[]): void {
    for (const patch of patches) applyPatch(doc, patch);
}
