'use client';

import type { CoverageCell, Flow, FlowParent, Ledger, LedgerPatch } from '@testproof/core';
import { flattenFlowIds, flattenFlows } from '@testproof/core/parse';
import { FLOW_ID_RE } from '@testproof/core/schema';
import { useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

export interface FlowCoverageById {
    [flowId: string]: {
        status: 'automated' | 'partial' | 'todo' | 'manual';
        demanded: CoverageCell[];
        covered: CoverageCell[];
    };
}

export interface FlowEditorActions {
    selectedId: string | undefined;
    setSelectedId: (id: string) => void;
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
    formError: string | null;
    apply: (patch: LedgerPatch) => void;
    addFlow: () => void;
    addArea: () => void;
    removeSelected: () => void;
    moveSelected: (delta: number) => void;
}

function findFlowLocation(
    ledger: Ledger,
    flowId: string,
): (FlowParent & { index: number; groupLength: number }) | undefined {
    for (const area of ledger.areas) {
        for (let groupIndex = 0; groupIndex < area.groups.length; groupIndex += 1) {
            const group = area.groups[groupIndex];
            if (!group) continue;
            const index = group.flows.findIndex((flow) => flow.id === flowId);
            if (index >= 0) {
                return { areaId: area.id, groupIndex, index, groupLength: group.flows.length };
            }
        }
    }
    return undefined;
}

export function useFlowEditorActions({
    ledger,
    coverage,
    onPatch,
}: {
    ledger: Ledger;
    coverage: FlowCoverageById;
    onPatch: (patch: LedgerPatch) => Promise<void>;
}): FlowEditorActions {
    const { t } = useTranslation();
    const flows = useMemo(() => flattenFlows(ledger), [ledger]);
    const [selectedId, setSelectedId] = useState(flows[0]?.id);
    const selected = flows.find((f) => f.id === selectedId);
    const [, start] = useTransition();
    const [tab, setTab] = useState<'edit' | 'changes'>('edit');
    const [newFlowId, setNewFlowId] = useState('');
    const [newFlowTitle, setNewFlowTitle] = useState('');
    const [newAreaId, setNewAreaId] = useState('');
    const [newAreaTitle, setNewAreaTitle] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const apply = (patch: LedgerPatch): void => {
        start(() => {
            void onPatch(patch);
        });
    };

    const addFlow = (): void => {
        setFormError(null);
        if (!FLOW_ID_RE.test(newFlowId)) {
            setFormError(t('editor.invalidFlowId'));
            return;
        }
        if (flattenFlowIds(ledger).includes(newFlowId)) {
            setFormError(t('editor.duplicateFlowId'));
            return;
        }
        const location = selectedId ? findFlowLocation(ledger, selectedId) : undefined;
        const parent: FlowParent = location
            ? { areaId: location.areaId, groupIndex: location.groupIndex }
            : { areaId: ledger.areas[0]?.id ?? 'HOME', groupIndex: 0 };
        const index = location ? location.index + 1 : 0;
        apply({
            op: 'add-flow',
            parent,
            flow: { id: newFlowId, title: newFlowTitle || newFlowId },
            index,
        });
        setSelectedId(newFlowId);
        setNewFlowId('');
        setNewFlowTitle('');
    };

    const addArea = (): void => {
        setFormError(null);
        if (!newAreaId.trim() || !newAreaTitle.trim()) {
            setFormError(t('editor.areaRequired'));
            return;
        }
        apply({
            op: 'add-area',
            area: { id: newAreaId.trim(), title: newAreaTitle.trim() },
            index: ledger.areas.length,
        });
        setNewAreaId('');
        setNewAreaTitle('');
    };

    const removeSelected = (): void => {
        if (!selected) return;
        const covered = Boolean(coverage[selected.id]);
        const ok = window.confirm(covered ? t('editor.confirmDeleteCovered') : t('editor.confirmDeleteFlow'));
        if (!ok) return;
        apply({ op: 'remove-flow', flowId: selected.id });
    };

    const moveSelected = (delta: number): void => {
        if (!selected) return;
        const location = findFlowLocation(ledger, selected.id);
        if (!location) return;
        const next = location.index + delta;
        if (next < 0 || next >= location.groupLength) return;
        apply({
            op: 'move-flow',
            flowId: selected.id,
            to: { areaId: location.areaId, groupIndex: location.groupIndex, index: next },
        });
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
        formError,
        apply,
        addFlow,
        addArea,
        removeSelected,
        moveSelected,
    };
}
