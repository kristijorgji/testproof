'use client';

import type { Ledger, LedgerPatch, PlatformNode } from '@testproof/core';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { FlowEditorMain } from './FlowEditorMain';
import { FlowEditorSidebar } from './FlowEditorSidebar';
import { type FlowCoverageById, useFlowEditorActions } from './useFlowEditorActions';

import { useMountedConfirmDialog } from '@/components/common/ConfirmDialog/useMountedConfirmDialog';

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
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const initialSelectedId = searchParams.get('flow') ?? undefined;
    const actions = useFlowEditorActions({ ledger, coverage, onPatch, initialSelectedId });
    const { selected, setSelectedId, setCreateParentId, getRemoveConfirmFor, removeFlow } = actions;
    const { requestConfirm, confirmDialog } = useMountedConfirmDialog();

    const requestDeleteForFlow = (flowId: string): void => {
        const confirm = getRemoveConfirmFor(flowId);
        if (!confirm) return;
        requestConfirm({
            title: confirm.title,
            description: confirm.description,
            confirmLabel: t('common.delete'),
            cancelLabel: t('common.cancel'),
            variant: 'destructive',
            onConfirm: () => removeFlow(flowId),
        });
    };

    return (
        <div className="flex min-h-[70vh] flex-col md:flex-row">
            <FlowEditorSidebar
                ledger={ledger}
                coverage={coverage}
                actions={actions}
                onRequestDelete={requestDeleteForFlow}
                onAddChild={(flowId) => {
                    setSelectedId(flowId);
                    setCreateParentId(flowId);
                }}
            />
            <FlowEditorMain
                actions={actions}
                platforms={platforms}
                coverage={coverage}
                beforeYaml={beforeYaml}
                afterYaml={afterYaml}
                conflict={conflict}
                onPublish={onPublish}
                onReplay={onReplay}
                onDiscard={onDiscard}
                onRequestDelete={() => selected && requestDeleteForFlow(selected.id)}
            />
            {confirmDialog}
        </div>
    );
}
