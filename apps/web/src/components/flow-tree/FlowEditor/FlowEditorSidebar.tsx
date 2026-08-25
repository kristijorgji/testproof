'use client';

import type { Ledger } from '@testproof/core';
import { useTranslation } from 'react-i18next';

import { FlowEditorCreateForm } from './FlowEditorCreateForm';
import type { FlowCoverageById, FlowEditorActions } from './useFlowEditorActions';

import { FlowNavTree } from '@/components/flow-tree/FlowNavTree/FlowNavTree';

export function FlowEditorSidebar({
    ledger,
    coverage,
    actions,
    onRequestDelete,
    onAddChild,
}: {
    ledger: Ledger;
    coverage: FlowCoverageById;
    actions: FlowEditorActions;
    onRequestDelete: (flowId: string) => void;
    onAddChild: (flowId: string) => void;
}) {
    const { t } = useTranslation();
    const {
        selectedId,
        setSelectedId,
        collapsedAreas,
        collapsedFlows,
        toggleArea,
        toggleFlow,
        setCollapsedAreas,
        setCollapsedFlows,
        apply,
    } = actions;

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <FlowNavTree
                ledger={ledger}
                selectedId={selectedId}
                collapsedAreaIds={collapsedAreas}
                collapsedFlowIds={collapsedFlows}
                enableDrag
                statusByFlowId={(id) => coverage[id]?.status ?? 'todo'}
                renderFlowActions={(flowId) => (
                    <>
                        <button
                            type="button"
                            className="text-xs text-[var(--accent)] underline"
                            onClick={() => onAddChild(flowId)}
                        >
                            {t('editor.addChildFlow')}
                        </button>
                        <button
                            type="button"
                            className="text-xs text-[var(--accent)] underline"
                            onClick={() => onRequestDelete(flowId)}
                        >
                            {t('common.delete')}
                        </button>
                    </>
                )}
                onSelect={setSelectedId}
                onToggleArea={toggleArea}
                onToggleFlow={toggleFlow}
                onCollapsedAreaIdsChange={setCollapsedAreas}
                onCollapsedFlowIdsChange={setCollapsedFlows}
                onMove={apply}
            />
            <div className="shrink-0">
                <FlowEditorCreateForm ledger={ledger} actions={actions} />
            </div>
        </div>
    );
}
