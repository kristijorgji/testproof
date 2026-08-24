'use client';

import type { Ledger, LedgerPatch, PlatformNode } from '@testproof/core';
import { useSearchParams } from 'next/navigation';

import { FlowDetail } from '../FlowDetail/FlowDetail';
import { PublishDialog } from '../PublishDialog/PublishDialog';
import { YamlDiff } from '../YamlDiff/YamlDiff';

import { dispatchFlowChange } from './dispatchFlowChange';
import { FlowEditorSidebar } from './FlowEditorSidebar';
import { FlowEditorToolbar } from './FlowEditorToolbar';
import { type FlowCoverageById, useFlowEditorActions } from './useFlowEditorActions';

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
    coverage: FlowCoverageById;
    beforeYaml: string;
    afterYaml: string;
    conflict?: { remote: string; draft: string };
    onPatch: (patch: LedgerPatch) => Promise<void>;
    onPublish: (input: { message: string; pullRequest: boolean }) => Promise<void>;
    onReplay: () => Promise<void>;
    onDiscard: () => Promise<void>;
}) {
    const searchParams = useSearchParams();
    const initialSelectedId = searchParams.get('flow') ?? undefined;
    const actions = useFlowEditorActions({ ledger, coverage, onPatch, initialSelectedId });
    const { selected, tab, apply } = actions;

    return (
        <div className="flex min-h-[70vh] flex-col md:flex-row">
            <FlowEditorSidebar ledger={ledger} coverage={coverage} actions={actions} />
            <main className="flex-1 pb-20">
                <FlowEditorToolbar actions={actions} />
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
