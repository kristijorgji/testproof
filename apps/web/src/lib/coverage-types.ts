import type { CoverageCell, CoverageStatus } from '@testproof/core';

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
