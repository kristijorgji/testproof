'use client';

import type { Flow, Ledger, LedgerPatch } from '@testproof/core';
import type { TFunction } from 'i18next';

import type { FlowCoverageById } from './flow-coverage-types';
import {
    buildAddAreaPatch,
    buildAddChildFlowPatch,
    buildAddFlowPatch,
    buildIndentFlowPatch,
    buildMoveFlowPatch,
    buildOutdentFlowPatch,
    nextSelectedAfterDelete,
    removeConfirmFor,
} from './flow-editor-form-actions';
import { parseGroupKey } from './flow-editor-helpers';

import { flowIdPrefixForArea } from '@/lib/format-flow-id-display';

export function createEditorMutations(input: {
    ledger: Ledger;
    flows: Flow[];
    coverage: FlowCoverageById;
    selectedId?: string;
    apply: (patch: LedgerPatch) => void;
    setSelectedId: (id: string | undefined) => void;
    setCollapsedFlows: (update: (current: Set<string>) => Set<string>) => void;
    bumpFocusTitle: () => void;
    t: TFunction;
    form: {
        newFlowId: string;
        newFlowTitle: string;
        createGroupKey: string;
        createParentId?: string;
        newAreaId: string;
        newAreaTitle: string;
        setFormError: (value: string | null) => void;
        setNewFlowId: (value: string) => void;
        setNewFlowTitle: (value: string) => void;
        setCreateParentId: (value: string | undefined) => void;
        setNewAreaId: (value: string) => void;
        setNewAreaTitle: (value: string) => void;
    };
}): {
    addFlow: () => void;
    addArea: () => void;
    addChildFlow: (parentFlowId: string) => void;
    removeFlow: (flowId: string) => void;
    getRemoveConfirmFor: (flowId: string) => { title: string; description?: string } | null;
    moveSelected: (delta: number) => void;
    indentSelected: () => void;
    outdentSelected: () => void;
} {
    const { ledger, flows, coverage, selectedId, apply, setSelectedId, setCollapsedFlows, bumpFocusTitle, t, form } =
        input;
    const selected = flows.find((flow) => flow.id === selectedId);

    return {
        addFlow: () => {
            form.setFormError(null);
            const result = buildAddFlowPatch({
                ledger,
                flows,
                newFlowId: form.newFlowId,
                newFlowTitle: form.newFlowTitle,
                createGroupKey: form.createGroupKey,
                createParentId: form.createParentId,
                selectedId,
            });
            if (result.error) {
                form.setFormError(
                    t(result.error === 'invalidFlowId' ? 'editor.invalidFlowId' : 'editor.duplicateFlowId'),
                );
                return;
            }
            if (!result.patch) return;
            if (form.createParentId) {
                const parentId = form.createParentId;
                setCollapsedFlows((current) => {
                    if (!current.has(parentId)) return current;
                    const next = new Set(current);
                    next.delete(parentId);
                    return next;
                });
            }
            apply(result.patch);
            setSelectedId(form.newFlowId);
            const parent = parseGroupKey(form.createGroupKey);
            form.setNewFlowId(parent ? flowIdPrefixForArea(parent.areaId) : 'FLOW-');
            form.setNewFlowTitle('');
            form.setCreateParentId(undefined);
            bumpFocusTitle();
        },
        addArea: () => {
            form.setFormError(null);
            const result = buildAddAreaPatch({ ledger, newAreaId: form.newAreaId, newAreaTitle: form.newAreaTitle });
            if ('error' in result) {
                form.setFormError(t('editor.areaRequired'));
                return;
            }
            apply(result.patch);
            form.setNewAreaId('');
            form.setNewAreaTitle('');
        },
        addChildFlow: (parentFlowId: string) => {
            const patch = buildAddChildFlowPatch(ledger, parentFlowId);
            if (!patch || patch.op !== 'add-flow') return;
            setCollapsedFlows((current) => {
                if (!current.has(parentFlowId)) return current;
                const next = new Set(current);
                next.delete(parentFlowId);
                return next;
            });
            apply(patch);
            setSelectedId(patch.flow.id);
            bumpFocusTitle();
        },
        removeFlow: (flowId: string) => {
            if (!flows.some((flow) => flow.id === flowId)) return;
            apply({ op: 'remove-flow', flowId });
            setSelectedId(nextSelectedAfterDelete(ledger, flowId, selectedId));
        },
        getRemoveConfirmFor: (flowId: string) => {
            const confirm = removeConfirmFor(flowId, flows, coverage, ledger);
            if (!confirm) return null;
            return {
                title: t(confirm.kind === 'covered' ? 'editor.confirmDeleteCovered' : 'editor.confirmDeleteFlow'),
                description: confirm.hasChildren ? t('editor.confirmDeleteChildren') : undefined,
            };
        },
        moveSelected: (delta: number) => {
            if (!selected) return;
            const patch = buildMoveFlowPatch(ledger, selected.id, delta);
            if (patch) apply(patch);
        },
        indentSelected: () => {
            if (!selected) return;
            const patch = buildIndentFlowPatch(ledger, selected.id);
            if (patch) apply(patch);
        },
        outdentSelected: () => {
            if (!selected) return;
            const patch = buildOutdentFlowPatch(ledger, selected.id);
            if (patch) apply(patch);
        },
    };
}
