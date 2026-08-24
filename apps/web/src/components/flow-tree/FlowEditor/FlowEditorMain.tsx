'use client';

import type { PlatformNode } from '@testproof/core';

import { FlowDetail } from '../FlowDetail/FlowDetail';
import { PublishDialog } from '../PublishDialog/PublishDialog';
import { YamlDiff } from '../YamlDiff/YamlDiff';

import { dispatchFlowChange } from './dispatchFlowChange';
import { FlowEditorToolbar } from './FlowEditorToolbar';
import type { FlowCoverageById, FlowEditorActions } from './useFlowEditorActions';

export function FlowEditorMain({
    actions,
    platforms,
    coverage,
    beforeYaml,
    afterYaml,
    conflict,
    onPublish,
    onReplay,
    onDiscard,
    onRequestDelete,
}: {
    actions: FlowEditorActions;
    platforms: PlatformNode[];
    coverage: FlowCoverageById;
    beforeYaml: string;
    afterYaml: string;
    conflict?: { remote: string; draft: string };
    onPublish: (input: { message: string; pullRequest: boolean }) => Promise<void>;
    onReplay: () => Promise<void>;
    onDiscard: () => Promise<void>;
    onRequestDelete: () => void;
}) {
    const { selected, tab, apply } = actions;

    return (
        <main className="flex-1 pb-20">
            <FlowEditorToolbar actions={actions} onRequestDelete={onRequestDelete} />
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
    );
}
