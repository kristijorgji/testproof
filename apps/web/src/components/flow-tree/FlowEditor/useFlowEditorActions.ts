'use client';

import type { Flow, Ledger, LedgerPatch } from '@testproof/core';
import { flattenFlows } from '@testproof/core/parse';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEditorMutations } from './create-editor-mutations';
import type { FlowCoverageById } from './flow-coverage-types';
import { toggleSetValue } from './toggle-set';
import { useFlowEditorFormState } from './useFlowEditorFormState';

export type { FlowCoverageById } from './flow-coverage-types';

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
    addChildFlow: (parentFlowId: string) => void;
    removeFlow: (flowId: string) => void;
    getRemoveConfirmFor: (flowId: string) => { title: string; description?: string } | null;
    moveSelected: (delta: number) => void;
    indentSelected: () => void;
    outdentSelected: () => void;
    focusTitleToken: number;
    bumpFocusTitle: () => void;
    collapsedAreas: Set<string>;
    collapsedFlows: Set<string>;
    collapsedGroups: Set<string>;
    toggleArea: (areaId: string) => void;
    toggleFlow: (flowId: string) => void;
    toggleGroup: (groupKey: string) => void;
    setCollapsedAreas: Dispatch<SetStateAction<Set<string>>>;
    setCollapsedFlows: Dispatch<SetStateAction<Set<string>>>;
}

export function useFlowEditorActions({
    ledger,
    coverage,
    apply,
    initialSelectedId,
}: {
    ledger: Ledger;
    coverage: FlowCoverageById;
    apply: (patch: LedgerPatch) => void;
    initialSelectedId?: string;
}): FlowEditorActions {
    const { t } = useTranslation();
    const flows = useMemo(() => flattenFlows(ledger), [ledger]);
    const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId ?? flows[0]?.id);
    const selected = flows.find((flow) => flow.id === selectedId);
    const form = useFlowEditorFormState(`${ledger.areas[0]?.id ?? 'HOME'}::0`);
    const [collapsedAreas, setCollapsedAreas] = useState<Set<string>>(new Set());
    const [collapsedFlows, setCollapsedFlows] = useState<Set<string>>(new Set());
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [focusTitleToken, setFocusTitleToken] = useState(0);
    const bumpFocusTitle = (): void => setFocusTitleToken((token) => token + 1);
    const mutations = createEditorMutations({
        ledger,
        flows,
        coverage,
        selectedId,
        apply,
        setSelectedId,
        setCollapsedFlows,
        bumpFocusTitle,
        t,
        form,
    });

    return {
        selectedId,
        setSelectedId,
        selected,
        ...form,
        apply,
        ...mutations,
        focusTitleToken,
        bumpFocusTitle,
        collapsedAreas,
        collapsedFlows,
        collapsedGroups,
        toggleArea: (areaId: string) => setCollapsedAreas((current) => toggleSetValue(current, areaId)),
        toggleFlow: (flowId: string) => setCollapsedFlows((current) => toggleSetValue(current, flowId)),
        toggleGroup: (groupKey: string) => setCollapsedGroups((current) => toggleSetValue(current, groupKey)),
        setCollapsedAreas,
        setCollapsedFlows,
    };
}
