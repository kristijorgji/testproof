'use client';

import { useSearchParams } from 'next/navigation';

import type { FlowEditorProps } from './flow-editor-props';
import { FlowEditorMain } from './FlowEditorMain';
import { FlowEditorSidebar } from './FlowEditorSidebar';
import { useFlowEditorActions } from './useFlowEditorActions';
import { useFlowEditorDelete } from './useFlowEditorDelete';
import { useWorkingLedger } from './useWorkingLedger';

import { ProjectSplitLayout } from '@/components/layout/ProjectSplitLayout/ProjectSplitLayout';

export function FlowEditor({
    ledger: serverLedger,
    platforms,
    coverage,
    beforeYaml,
    afterYaml: serverAfterYaml,
    conflict,
    storage,
    ledgerFilePath,
    onPatch,
    onPublish,
    onReplay,
    onDiscard,
}: FlowEditorProps) {
    const searchParams = useSearchParams();
    const working = useWorkingLedger({
        serverLedger,
        serverAfterYaml,
        onPatch,
    });
    const actions = useFlowEditorActions({
        ledger: working.ledger,
        coverage,
        apply: working.apply,
        initialSelectedId: searchParams.get('flow') ?? undefined,
    });
    const { requestDeleteForFlow, confirmDialog } = useFlowEditorDelete(actions);

    return (
        <>
            <ProjectSplitLayout
                sidebar={
                    <FlowEditorSidebar
                        ledger={working.ledger}
                        coverage={coverage}
                        actions={actions}
                        onRequestDelete={requestDeleteForFlow}
                    />
                }
                detail={
                    <FlowEditorMain
                        actions={actions}
                        ledger={working.ledger}
                        platforms={platforms}
                        coverage={coverage}
                        beforeYaml={beforeYaml}
                        afterYaml={working.afterYaml}
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
