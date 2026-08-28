import type { Ledger } from '@testproof/core';
import { useEffect, useMemo, useState } from 'react';

import type { FlowCoverageById } from './useFlowEditorActions';

import {
    type CoverageStatusFilter,
    filterLedgerForCoverage,
    flowTreeContains,
} from '@/components/coverage/coverage-filters';
import type { CoverageRow } from '@/lib/coverage-types';

function toCoverageRows(coverage: FlowCoverageById): Record<string, CoverageRow> {
    const rows: Record<string, CoverageRow> = {};
    for (const [flowId, row] of Object.entries(coverage)) {
        rows[flowId] = {
            status: row.status,
            demanded: row.demanded,
            covered: row.covered,
            files: {},
        };
    }
    return rows;
}

export function useFlowEditorTreeFilters({
    ledger,
    coverage,
    selectedId,
    onSelectedIdChange,
}: {
    ledger: Ledger;
    coverage: FlowCoverageById;
    selectedId: string | undefined;
    onSelectedIdChange: (id: string | undefined) => void;
}): {
    query: string;
    setQuery: (value: string) => void;
    statusFilter: CoverageStatusFilter;
    setStatusFilter: (value: CoverageStatusFilter) => void;
    treeLedger: Ledger;
    filteredAreas: Ledger['areas'];
} {
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<CoverageStatusFilter>('all');
    const coverageRows = useMemo(() => toCoverageRows(coverage), [coverage]);
    const filteredAreas = useMemo(
        () => filterLedgerForCoverage(ledger, query, statusFilter, new Set(), coverageRows),
        [ledger, query, statusFilter, coverageRows],
    );
    const treeLedger = useMemo(() => ({ ...ledger, areas: filteredAreas }), [ledger, filteredAreas]);

    useEffect(() => {
        if (!selectedId) return;
        const visible = filteredAreas.some((area) =>
            area.groups.some((group) => group.flows.some((flow) => flowTreeContains(flow, selectedId))),
        );
        if (!visible) onSelectedIdChange(undefined);
    }, [filteredAreas, selectedId, onSelectedIdChange]);

    return {
        query,
        setQuery,
        statusFilter,
        setStatusFilter,
        treeLedger,
        filteredAreas,
    };
}
