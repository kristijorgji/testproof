'use client';

import type { CoverageCell, Ledger, LedgerPatch, PlatformNode } from '@testproof/core';
import { flattenFlows } from '@testproof/core/parse';
import { useMemo, useState, useTransition } from 'react';

import { useT } from '../i18n/LocaleProvider';

import { FlowDetail } from './FlowDetail';
import { FlowTreeRow } from './FlowTreeRow';
import { PublishDialog } from './PublishDialog';
import { YamlDiff } from './YamlDiff';

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
    const t = useT();
    const flows = useMemo(() => flattenFlows(ledger), [ledger]);
    const [selectedId, setSelectedId] = useState(flows[0]?.id);
    const selected = flows.find((f) => f.id === selectedId);
    const [, start] = useTransition();
    const [tab, setTab] = useState<'edit' | 'changes'>('edit');

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
            </aside>
            <main className="flex-1 pb-20">
                <div className="flex gap-3 border-b border-[var(--border)] px-4 py-2 text-sm">
                    <button type="button" onClick={() => setTab('edit')}>
                        Edit
                    </button>
                    <button type="button" onClick={() => setTab('changes')}>
                        {t('editor.changes')}
                    </button>
                </div>
                {tab === 'changes' ? (
                    <div className="p-4">
                        <YamlDiff before={beforeYaml} after={afterYaml} />
                    </div>
                ) : selected ? (
                    <FlowDetail
                        flow={selected}
                        platforms={platforms}
                        demanded={coverage[selected.id]?.demanded}
                        covered={coverage[selected.id]?.covered}
                        onChange={(partial) => {
                            start(() => {
                                if (partial.title) {
                                    void onPatch({
                                        op: 'set-flow-field',
                                        flowId: selected.id,
                                        field: 'title',
                                        value: partial.title,
                                    });
                                }
                                if (partial.note !== undefined) {
                                    void onPatch({
                                        op: 'set-flow-field',
                                        flowId: selected.id,
                                        field: 'note',
                                        value: partial.note ?? '',
                                    });
                                }
                                if (partial.targets) {
                                    void onPatch({
                                        op: 'set-flow-targets',
                                        flowId: selected.id,
                                        value: partial.targets,
                                    });
                                }
                            });
                        }}
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
