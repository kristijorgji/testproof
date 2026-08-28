import type { Flow, LedgerPatch } from '@testproof/core';

export function dispatchFlowChange(flowId: string, partial: Partial<Flow>, apply: (patch: LedgerPatch) => void): void {
    if (partial.title !== undefined) {
        const title = partial.title.trim();
        if (title.length > 0) {
            apply({ op: 'set-flow-field', flowId, field: 'title', value: title });
        }
    }
    if (partial.notes !== undefined) {
        apply({ op: 'set-flow-field', flowId, field: 'notes', value: partial.notes || null });
    }
    if (partial.targets) {
        apply({ op: 'set-flow-targets', flowId, value: partial.targets });
    }
    if (partial.owner !== undefined) {
        apply({ op: 'set-flow-field', flowId, field: 'owner', value: partial.owner ?? null });
    }
    if (partial.preconditions !== undefined) {
        apply({ op: 'set-flow-field', flowId, field: 'preconditions', value: partial.preconditions ?? null });
    }
    if (partial.postconditions !== undefined) {
        apply({ op: 'set-flow-field', flowId, field: 'postconditions', value: partial.postconditions ?? null });
    }
    if (partial.priority !== undefined) {
        apply({ op: 'set-flow-enum', flowId, field: 'priority', value: partial.priority ?? null });
    }
    if (partial.severity !== undefined) {
        apply({ op: 'set-flow-enum', flowId, field: 'severity', value: partial.severity ?? null });
    }
    if (partial.type !== undefined) {
        apply({ op: 'set-flow-enum', flowId, field: 'type', value: partial.type ?? null });
    }
    if (partial.layer !== undefined) {
        apply({ op: 'set-flow-enum', flowId, field: 'layer', value: partial.layer ?? null });
    }
    if (partial.behavior !== undefined) {
        apply({ op: 'set-flow-enum', flowId, field: 'behavior', value: partial.behavior ?? null });
    }
    if (partial.status !== undefined) {
        apply({ op: 'set-flow-enum', flowId, field: 'status', value: partial.status ?? null });
    }
    if (partial.automation !== undefined) {
        apply({ op: 'set-flow-enum', flowId, field: 'automation', value: partial.automation ?? null });
    }
    if (partial.estimateMinutes !== undefined) {
        apply({ op: 'set-flow-number', flowId, field: 'estimateMinutes', value: partial.estimateMinutes ?? null });
    }
    if (partial.flaky !== undefined) {
        apply({ op: 'set-flow-flag', flowId, field: 'flaky', value: partial.flaky });
    }
    if (partial.muted !== undefined) {
        apply({ op: 'set-flow-flag', flowId, field: 'muted', value: partial.muted });
    }
    if (partial.manual !== undefined) {
        apply({ op: 'set-flow-flag', flowId, field: 'manual', value: partial.manual });
    }
}
