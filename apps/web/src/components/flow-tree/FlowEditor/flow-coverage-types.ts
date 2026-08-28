import type { CoverageCell } from '@testproof/core';

export interface FlowCoverageById {
    [flowId: string]: {
        status: 'automated' | 'partial' | 'todo' | 'manual';
        demanded: CoverageCell[];
        covered: CoverageCell[];
    };
}
