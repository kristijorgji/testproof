'use client';

import type { Ledger } from '@testproof/core';
import { useEffect, useMemo, useState } from 'react';

import { filterLedgerForCoverage, flowTreeContains, type CoverageStatusFilter } from './coverage-filters';

import type { CoverageRow } from '@/lib/coverage-types';

export function useCoverageFilters({
    ledger,
    coverage,
    selectedFlowId,
    onSelectedFlowIdChange,
}: {
    ledger: Ledger;
    coverage: Record<string, CoverageRow>;
    selectedFlowId: string | undefined;
    onSelectedFlowIdChange: (id: string | undefined) => void;
}) {
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<CoverageStatusFilter>('all');
    const [platformFilter, setPlatformFilter] = useState<Set<string>>(new Set());
    const [collapsedAreas, setCollapsedAreas] = useState<Set<string>>(new Set());
    const [collapsedFlows, setCollapsedFlows] = useState<Set<string>>(new Set());

    const filteredAreas = useMemo(
        () => filterLedgerForCoverage(ledger, query, statusFilter, platformFilter, coverage),
        [ledger, query, statusFilter, platformFilter, coverage],
    );

    useEffect(() => {
        if (!selectedFlowId) return;
        const visible = filteredAreas.some((area) =>
            area.groups.some((group) => group.flows.some((flow) => flowTreeContains(flow, selectedFlowId))),
        );
        if (!visible) onSelectedFlowIdChange(undefined);
    }, [filteredAreas, onSelectedFlowIdChange, selectedFlowId]);

    return {
        query,
        setQuery,
        statusFilter,
        setStatusFilter,
        platformFilter,
        togglePlatform: (platformId: string) => {
            setPlatformFilter((current) => {
                const next = new Set(current);
                if (next.has(platformId)) next.delete(platformId);
                else next.add(platformId);
                return next;
            });
        },
        clearPlatforms: () => setPlatformFilter(new Set()),
        collapsedAreas,
        collapsedFlows,
        toggleArea: (areaId: string) => {
            setCollapsedAreas((current) => {
                const next = new Set(current);
                if (next.has(areaId)) next.delete(areaId);
                else next.add(areaId);
                return next;
            });
        },
        toggleFlow: (flowId: string) => {
            setCollapsedFlows((current) => {
                const next = new Set(current);
                if (next.has(flowId)) next.delete(flowId);
                else next.add(flowId);
                return next;
            });
        },
        setCollapsedAreas,
        setCollapsedFlows,
        filteredAreas,
    };
}
