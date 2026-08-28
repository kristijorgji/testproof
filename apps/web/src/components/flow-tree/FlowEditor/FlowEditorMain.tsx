'use client';

import type { Ledger, PlatformNode } from '@testproof/core';

import { FlowDetail } from '../FlowDetail/FlowDetail';
import { PublishDialog } from '../PublishDialog/PublishDialog';
import { usePublishAction } from '../PublishDialog/usePublishAction';
import { YamlDiff } from '../YamlDiff/YamlDiff';

import { dispatchFlowChange } from './dispatchFlowChange';
import { flowBreadcrumb } from './flow-breadcrumb';
import { FlowEditorToolbar } from './FlowEditorToolbar';
import type { FlowCoverageById, FlowEditorActions } from './useFlowEditorActions';

import type { DraftActionResult, PublishResult, PublishStorage } from '@/actions/action-result';

export function FlowEditorMain({
    actions,
    ledger,
    platforms,
    coverage,
    beforeYaml,
    afterYaml,
    conflict,
    storage,
    ledgerFilePath,
    onPublish,
    onReplay,
    onDiscard,
    onRequestDelete,
}: {
    actions: FlowEditorActions;
    ledger: Ledger;
    platforms: PlatformNode[];
    coverage: FlowCoverageById;
    beforeYaml: string;
    afterYaml: string;
    conflict?: { remote: string; draft: string };
    storage: PublishStorage;
    ledgerFilePath: string | null;
    onPublish: (input: { message: string; pullRequest: boolean }) => Promise<PublishResult>;
    onReplay: () => Promise<DraftActionResult>;
    onDiscard: () => Promise<DraftActionResult>;
    onRequestDelete: () => void;
}) {
    const { selected, tab, apply, focusTitleToken } = actions;
    const publish = usePublishAction({ storage, ledgerFilePath, onPublish, onReplay, onDiscard });

    return (
        <main className="flex min-h-0 flex-1 flex-col">
            <FlowEditorToolbar actions={actions} onRequestDelete={onRequestDelete} />
            <div className="min-h-0 flex-1 overflow-y-auto pb-4">
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
                        breadcrumb={flowBreadcrumb(ledger, selected.id)}
                        focusTitleToken={focusTitleToken}
                        onChange={(partial) => dispatchFlowChange(selected.id, partial, apply)}
                    />
                ) : null}
            </div>
            <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--card)] p-3">
                <PublishDialog
                    storage={storage}
                    conflict={conflict}
                    pending={publish.pending}
                    formError={publish.formError}
                    onPublish={publish.requestPublish}
                    onReplay={publish.replay}
                    onDiscard={publish.discard}
                />
            </div>
            {publish.confirmDialog}
        </main>
    );
}
