import type { CoverageCell, CoverageStatus } from '@testproof/core';
import { coverageSnapshots, flowCoverage } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';

import { getDb } from './db';

export type CoverageRow = {
    status: CoverageStatus;
    demanded: CoverageCell[];
    covered: CoverageCell[];
    files: Record<string, string[]>;
};

export type CoverageSnapshotMeta = {
    commitSha: string;
    branch: string;
    summary: Record<CoverageStatus, number>;
    createdAt: Date;
};

export type LatestCoverageSnapshot = {
    rows: Record<string, CoverageRow>;
    snapshot: CoverageSnapshotMeta | null;
};

const emptySummary = (): Record<CoverageStatus, number> => ({
    automated: 0,
    partial: 0,
    todo: 0,
    manual: 0,
});

export async function getLatestCoverageSnapshot(projectId: string): Promise<LatestCoverageSnapshot> {
    const rows: Record<string, CoverageRow> = {};
    try {
        const [snapshot] = await getDb()
            .select()
            .from(coverageSnapshots)
            .where(eq(coverageSnapshots.projectId, projectId))
            .orderBy(desc(coverageSnapshots.createdAt))
            .limit(1);
        if (!snapshot) return { rows, snapshot: null };

        const flowRows = await getDb().select().from(flowCoverage).where(eq(flowCoverage.snapshotId, snapshot.id));
        for (const row of flowRows) {
            rows[row.flowId] = {
                status: row.status as CoverageRow['status'],
                demanded: (row.demandedCells as CoverageCell[]) ?? [],
                covered: (row.coveredCells as CoverageCell[]) ?? [],
                files: (row.files as Record<string, string[]>) ?? {},
            };
        }

        const summaryRaw = snapshot.summary as Partial<Record<CoverageStatus, number>>;
        const summary = { ...emptySummary(), ...summaryRaw };

        return {
            rows,
            snapshot: {
                commitSha: snapshot.commitSha,
                branch: snapshot.branch,
                summary,
                createdAt: snapshot.createdAt,
            },
        };
    } catch {
        return { rows, snapshot: null };
    }
}

export async function getLatestCoverage(projectId: string): Promise<Record<string, CoverageRow>> {
    const { rows } = await getLatestCoverageSnapshot(projectId);
    return rows;
}
