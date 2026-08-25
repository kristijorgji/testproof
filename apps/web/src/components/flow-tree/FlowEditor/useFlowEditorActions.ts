'use client';

import type { CoverageCell, Flow, Ledger, LedgerPatch } from '@testproof/core';
import { flattenFlows } from '@testproof/core/parse';
import { type Dispatch, type SetStateAction, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import {
    buildAddAreaPatch,
    buildAddFlowPatch,
    buildMoveFlowPatch,
    nextSelectedAfterDelete,
    removeConfirmFor,
} from './flow-editor-form-actions';
import { toggleSetValue } from './toggle-set';
import { useFlowEditorFormState } from './useFlowEditorFormState';

export interface FlowEditorActions {
    selectedId: string | undefined;
    setSelectedId: (id: string | undefined) => void;
    selected: Flow | undefined;
    tab: 'edit' | 'changes';
    setTab: (tab: 'edit' | 'changes') => void;
    newFlowId: string;
    setNewFlowId: (value: string) => void;
    newFlowTitle: string;
    setNewFlowTitle: (value: string) => void;
    newAreaId: string;
    setNewAreaId: (value: string) => void;
    newAreaTitle: string;
    setNewAreaTitle: (value: string) => void;
    createGroupKey: string;
    setCreateGroupKey: (value: string) => void;
    createParentId: string | undefined;
    setCreateParentId: (value: string | undefined) => void;
    formError: string | null;
    apply: (patch: LedgerPatch) => void;
    addFlow: () => void;
    addArea: () => void;
    removeFlow: (flowId: string) => void;
    getRemoveConfirmFor: (flowId: string) => { title: string; description?: string } | null;
    moveSelected: (delta: number) => void;
    collapsedAreas: Set<string>;
    collapsedFlows: Set<string>;
    toggleArea: (areaId: string) => void;
    toggleFlow: (flowId: string) => void;
    setCollapsedAreas: Dispatch<SetStateAction<Set<string>>>;
    setCollapsedFlows: Dispatch<SetStateAction<Set<string>>>;
}

export interface FlowCoverageById {
    [flowId: string]: {
        status: 'automated' | 'partial' | 'todo' | 'manual';
        demanded: CoverageCell[];
        covered: CoverageCell[];
    };
}

export function useFlowEditorActions({
    ledger,
    coverage,
    onPatch,
    initialSelectedId,
}: {
    ledger: Ledger;
    coverage: FlowCoverageById;
    onPatch: (patch: LedgerPatch) => Promise<void>;
    initialSelectedId?: string;
}): FlowEditorActions {
    const { t } = useTranslation();
    const flows = useMemo(() => flattenFlows(ledger), [ledger]);
    const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId ?? flows[0]?.id);
    const selected = flows.find((flow) => flow.id === selectedId);
    const [, start] = useTransition();
    const form = useFlowEditorFormState(`${ledger.areas[0]?.id ?? 'HOME'}::0`);
    const [collapsedAreas, setCollapsedAreas] = useState<Set<string>>(new Set());
    const [collapsedFlows, setCollapsedFlows] = useState<Set<string>>(new Set());
    const apply = (patch: LedgerPatch): void => {
        start(() => {
            void onPatch(patch);
        });
    };

    return {
        selectedId,
        setSelectedId,
        selected,
        ...form,
        apply,
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
            form.setNewFlowId('');
            form.setNewFlowTitle('');
            form.setCreateParentId(undefined);
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
        removeFlow: (flowId: string) => {
            if (!flows.some((flow) => flow.id === flowId)) return;
            apply({ op: 'remove-flow', flowId });
            setSelectedId(nextSelectedAfterDelete(ledger, flowId, selectedId));
        },
        getRemoveConfirmFor: (flowId: string) => {
            const kind = removeConfirmFor(flowId, flows, coverage);
            if (!kind) return null;
            return { title: t(kind === 'covered' ? 'editor.confirmDeleteCovered' : 'editor.confirmDeleteFlow') };
        },
        moveSelected: (delta: number) => {
            if (!selected) return;
            const patch = buildMoveFlowPatch(ledger, selected.id, delta);
            if (patch) apply(patch);
        },
        collapsedAreas,
        collapsedFlows,
        toggleArea: (areaId: string) => setCollapsedAreas((current) => toggleSetValue(current, areaId)),
        toggleFlow: (flowId: string) => setCollapsedFlows((current) => toggleSetValue(current, flowId)),
        setCollapsedAreas,
        setCollapsedFlows,
    };
}
