'use client';

import type { Ledger } from '@testproof/core';

import { FlowEditorAreaSection } from './FlowEditorAreaSection';
import { FlowEditorCreateForm } from './FlowEditorCreateForm';
import type { FlowCoverageById, FlowEditorActions } from './useFlowEditorActions';

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
    const { selectedId, setSelectedId, collapsedAreas, toggleArea } = actions;

    return (
        <aside className="flex max-h-[70vh] w-full flex-col border-b border-[var(--border)] md:w-80 md:border-r md:border-b-0">
            <div className="min-h-0 flex-1 overflow-y-auto">
                {ledger.areas.map((area) => (
                    <FlowEditorAreaSection
                        key={area.id}
                        area={area}
                        coverage={coverage}
                        collapsed={collapsedAreas.has(area.id)}
                        selectedId={selectedId}
                        onToggleArea={toggleArea}
                        onSelect={setSelectedId}
                        onRequestDelete={onRequestDelete}
                        onAddChild={onAddChild}
                    />
                ))}
            </div>
            <FlowEditorCreateForm ledger={ledger} actions={actions} />
        </aside>
    );
}
