'use client';

import type { CoverageCell, Flow, Ledger, LedgerPatch } from '@testproof/core';
import { flattenFlows } from '@testproof/core/parse';
import { useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import {
    buildAddAreaPatch,
    buildAddFlowPatch,
    buildMoveFlowPatch,
    nextSelectedAfterDelete,
    removeConfirmFor,
} from './flow-editor-form-actions';

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
    toggleArea: (areaId: string) => void;
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
    const selected = flows.find((f) => f.id === selectedId);
    const [, start] = useTransition();
    const [tab, setTab] = useState<'edit' | 'changes'>('edit');
    const [newFlowId, setNewFlowId] = useState('');
    const [newFlowTitle, setNewFlowTitle] = useState('');
    const [newAreaId, setNewAreaId] = useState('');
    const [newAreaTitle, setNewAreaTitle] = useState('');
    const [createGroupKey, setCreateGroupKey] = useState(() => `${ledger.areas[0]?.id ?? 'HOME'}::0`);
    const [createParentId, setCreateParentId] = useState<string | undefined>();
    const [formError, setFormError] = useState<string | null>(null);
    const [collapsedAreas, setCollapsedAreas] = useState<Set<string>>(new Set());

    const apply = (patch: LedgerPatch): void => {
        start(() => {
            void onPatch(patch);
        });
    };

    const addFlow = (): void => {
        setFormError(null);
        const result = buildAddFlowPatch({
            ledger,
            flows,
            newFlowId,
            newFlowTitle,
            createGroupKey,
            createParentId,
            selectedId,
        });
        if (result.error) {
            setFormError(t(result.error === 'invalidFlowId' ? 'editor.invalidFlowId' : 'editor.duplicateFlowId'));
            return;
        }
        if (!result.patch) return;
        apply(result.patch);
        setSelectedId(newFlowId);
        setNewFlowId('');
        setNewFlowTitle('');
        setCreateParentId(undefined);
    };

    const addArea = (): void => {
        setFormError(null);
        const result = buildAddAreaPatch({ ledger, newAreaId, newAreaTitle });
        if ('error' in result) {
            setFormError(t('editor.areaRequired'));
            return;
        }
        apply(result.patch);
        setNewAreaId('');
        setNewAreaTitle('');
    };

    return {
        selectedId,
        setSelectedId,
        selected,
        tab,
        setTab,
        newFlowId,
        setNewFlowId,
        newFlowTitle,
        setNewFlowTitle,
        newAreaId,
        setNewAreaId,
        newAreaTitle,
        setNewAreaTitle,
        createGroupKey,
        setCreateGroupKey,
        createParentId,
        setCreateParentId,
        formError,
        apply,
        addFlow,
        addArea,
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
        toggleArea: (areaId: string) => {
            setCollapsedAreas((current) => {
                const next = new Set(current);
                if (next.has(areaId)) next.delete(areaId);
                else next.add(areaId);
                return next;
            });
        },
    };
}
