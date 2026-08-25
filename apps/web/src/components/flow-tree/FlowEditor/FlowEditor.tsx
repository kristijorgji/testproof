'use client';

import { useSearchParams } from 'next/navigation';

import type { FlowEditorProps } from './flow-editor-props';
import { FlowEditorMain } from './FlowEditorMain';
import { FlowEditorSidebar } from './FlowEditorSidebar';
import { useFlowEditorActions } from './useFlowEditorActions';
import { useFlowEditorDelete } from './useFlowEditorDelete';

import { ProjectSplitLayout } from '@/components/layout/ProjectSplitLayout/ProjectSplitLayout';

export function FlowEditor({
    ledger,
    platforms,
    coverage,
    beforeYaml,
    afterYaml,
    conflict,
    storage,
    ledgerFilePath,
    onPatch,
    onPublish,
    onReplay,
    onDiscard,
}: FlowEditorProps) {
    const searchParams = useSearchParams();
    const actions = useFlowEditorActions({
        ledger,
        coverage,
        onPatch,
        initialSelectedId: searchParams.get('flow') ?? undefined,
    });
    const { requestDeleteForFlow, confirmDialog } = useFlowEditorDelete(actions);

    return (
        <>
            <ProjectSplitLayout
                sidebar={
                    <FlowEditorSidebar
                        ledger={ledger}
                        coverage={coverage}
                        actions={actions}
                        onRequestDelete={requestDeleteForFlow}
                        onAddChild={(flowId) => {
                            actions.setSelectedId(flowId);
                            actions.setCreateParentId(flowId);
                        }}
                    />
                }
                detail={
                    <FlowEditorMain
                        actions={actions}
                        platforms={platforms}
                        coverage={coverage}
                        beforeYaml={beforeYaml}
                        afterYaml={afterYaml}
                        conflict={conflict}
                        storage={storage}
                        ledgerFilePath={ledgerFilePath}
                        onPublish={onPublish}
                        onReplay={onReplay}
                        onDiscard={onDiscard}
                        onRequestDelete={() => actions.selected && requestDeleteForFlow(actions.selected.id)}
                    />
                }
            />
            {confirmDialog}
        </>
    );
}
