'use client';

import type { Ledger } from '@testproof/core';

import { FlowTreeRow } from '../FlowTreeRow/FlowTreeRow';

import { FlowEditorCreateForm } from './FlowEditorCreateForm';
import type { FlowCoverageById, FlowEditorActions } from './useFlowEditorActions';

export function FlowEditorSidebar({
    ledger,
    coverage,
    actions,
}: {
    ledger: Ledger;
    coverage: FlowCoverageById;
    actions: FlowEditorActions;
}) {
    const { selectedId, setSelectedId } = actions;

    return (
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
            <FlowEditorCreateForm actions={actions} />
        </aside>
    );
}
