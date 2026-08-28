'use client';

import type { Ledger, PlatformNode } from '@testproof/core';

import { FlowDetail } from '../FlowDetail/FlowDetail';
import { PublishDialog } from '../PublishDialog/PublishDialog';
import { usePublishAction } from '../PublishDialog/usePublishAction';
import { YamlDiff } from '../YamlDiff/YamlDiff';

import { dispatchFlowChange } from './dispatchFlowChange';
import { flowBreadcrumb } from './flow-breadcrumb';
import { FlowEditorIdentityHeader } from './FlowEditorIdentityHeader';
import { FlowEditorPublishFooter } from './FlowEditorPublishFooter';
import { FlowEditorToolbar } from './FlowEditorToolbar';
import type { FlowCoverageById, FlowEditorActions } from './useFlowEditorActions';

import type { DraftActionResult, PublishResult, PublishStorage } from '@/actions/action-result';
import { Scrollbar } from '@/components/common/Scrollbar/Scrollbar';

export function FlowEditorMain(props: {
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
    const { actions, ledger, platforms, coverage, beforeYaml, afterYaml, onRequestDelete } = props;
    const { selected, tab, apply, focusTitleToken } = actions;
    const publish = usePublishAction({
        storage: props.storage,
        ledgerFilePath: props.ledgerFilePath,
        onPublish: props.onPublish,
        onReplay: props.onReplay,
        onDiscard: props.onDiscard,
    });
    const breadcrumb = selected ? flowBreadcrumb(ledger, selected.id) : undefined;

    return (
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0">
                <FlowEditorToolbar actions={actions} onRequestDelete={onRequestDelete} />
            </div>
            {tab === 'edit' && selected ? (
                <FlowEditorIdentityHeader flowId={selected.id} breadcrumb={breadcrumb} />
            ) : null}
            <Scrollbar className="min-h-0 flex-1 pb-4">
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
                        hideIdentity
                        focusTitleToken={focusTitleToken}
                        onChange={(partial) => dispatchFlowChange(selected.id, partial, apply)}
                    />
                ) : null}
            </Scrollbar>
            <FlowEditorPublishFooter>
                <PublishDialog
                    storage={props.storage}
                    conflict={props.conflict}
                    pending={publish.pending}
                    formError={publish.formError}
                    onPublish={publish.requestPublish}
                    onReplay={publish.replay}
                    onDiscard={publish.discard}
                />
            </FlowEditorPublishFooter>
            {publish.confirmDialog}
        </main>
    );
}
