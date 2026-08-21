'use client';

import type { CoverageCell, Flow, FlowParent, Ledger, LedgerPatch, PlatformNode } from '@testproof/core';
import { flattenFlowIds, flattenFlows } from '@testproof/core/parse';
import { FLOW_ID_RE } from '@testproof/core/schema';
import { useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import { FlowDetail } from './FlowDetail';
import { FlowTreeRow } from './FlowTreeRow';
import { PublishDialog } from './PublishDialog';
import { YamlDiff } from './YamlDiff';

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

export function FlowEditor({
    ledger,
    platforms,
    coverage,
    beforeYaml,
    afterYaml,
    conflict,
    onPatch,
    onPublish,
    onReplay,
    onDiscard,
}: {
    ledger: Ledger;
    platforms: PlatformNode[];
    coverage: Record<
        string,
        { status: 'automated' | 'partial' | 'todo' | 'manual'; demanded: CoverageCell[]; covered: CoverageCell[] }
    >;
    beforeYaml: string;
    afterYaml: string;
    conflict?: { remote: string; draft: string };
    onPatch: (patch: LedgerPatch) => Promise<void>;
    onPublish: (input: { message: string; pullRequest: boolean }) => Promise<void>;
    onReplay: () => Promise<void>;
    onDiscard: () => Promise<void>;
}) {
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

    return (
        <div className="flex min-h-[70vh] flex-col md:flex-row">
            <aside className="w-full border-b border-[var(--border)] md:w-80 md:border-r md:border-b-0">
                {ledger.areas.map((area) => (
                    <div key={area.id}>
                        <h2 className="px-3 pt-3 text-xs uppercase text-[var(--muted)]">{area.title}</h2>
                        {area.groups.flatMap((group) =>
                            group.flows.map((flow) => (
                                <FlowTreeRow
                                    key={flow.id}
                                    flow={flow}
                                    status={coverage[flow.id]?.status}
                                    selected={selectedId === flow.id}
                                    onSelect={setSelectedId}
                                />
                            )),
                        )}
                    </div>
                ))}
                <div className="grid gap-2 border-t border-[var(--border)] p-3 text-sm">
                    <input
                        className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
                        placeholder={t('editor.newFlowId')}
                        value={newFlowId}
                        onChange={(e) => setNewFlowId(e.target.value)}
                    />
                    <input
                        className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
                        placeholder={t('editor.newFlowTitle')}
                        value={newFlowTitle}
                        onChange={(e) => setNewFlowTitle(e.target.value)}
                    />
                    <button type="button" className="rounded border border-[var(--border)] px-2 py-1" onClick={addFlow}>
                        {t('editor.addFlow')}
                    </button>
                    <input
                        className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
                        placeholder={t('editor.newAreaId')}
                        value={newAreaId}
                        onChange={(e) => setNewAreaId(e.target.value)}
                    />
                    <input
                        className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
                        placeholder={t('editor.newAreaTitle')}
                        value={newAreaTitle}
                        onChange={(e) => setNewAreaTitle(e.target.value)}
                    />
                    <button type="button" className="rounded border border-[var(--border)] px-2 py-1" onClick={addArea}>
                        {t('editor.addArea')}
                    </button>
                    {formError ? <p className="text-red-600">{formError}</p> : null}
                </div>
            </aside>
            <main className="flex-1 pb-20">
                <div className="flex gap-3 border-b border-[var(--border)] px-4 py-2 text-sm">
                    <button type="button" onClick={() => setTab('edit')}>
                        {t('editor.edit')}
                    </button>
                    <button type="button" onClick={() => setTab('changes')}>
                        {t('editor.changes')}
                    </button>
                    <button type="button" onClick={() => moveSelected(-1)}>
                        {t('editor.moveUp')}
                    </button>
                    <button type="button" onClick={() => moveSelected(1)}>
                        {t('editor.moveDown')}
                    </button>
                    <button type="button" onClick={removeSelected}>
                        {t('editor.deleteFlow')}
                    </button>
                </div>
                {tab === 'changes' ? (
                    <div className="p-4">
                        <YamlDiff before={beforeYaml} after={afterYaml} />
                    </div>
                ) : selected ? (
                    <FlowDetail
                        key={selected.id}
                        flow={selected}
                        platforms={platforms}
                        demanded={coverage[selected.id]?.demanded}
                        covered={coverage[selected.id]?.covered}
                        onChange={(partial) => dispatchFlowChange(selected.id, partial, apply)}
                    />
                ) : null}
                <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--card)] p-3">
                    <PublishDialog
                        conflict={conflict}
                        onPublish={(input) => void onPublish(input)}
                        onReplay={() => void onReplay()}
                        onDiscard={() => void onDiscard()}
                    />
                </div>
            </main>
        </div>
    );
}

function dispatchFlowChange(flowId: string, partial: Partial<Flow>, apply: (patch: LedgerPatch) => void): void {
    if (partial.title) {
        apply({ op: 'set-flow-field', flowId, field: 'title', value: partial.title });
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
