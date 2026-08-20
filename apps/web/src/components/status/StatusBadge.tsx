import type { CoverageStatus } from '@testproof/core';

import { cn } from '@/lib/cn';

const styles: Record<CoverageStatus, string> = {
    automated: 'bg-green-700 text-green-50',
    partial: 'bg-yellow-800 text-yellow-50',
    todo: 'bg-red-800 text-red-50',
    manual: 'bg-blue-800 text-blue-50',
};

export function StatusBadge({ status }: { status: CoverageStatus }) {
    return (
        <span className={cn('rounded px-1.5 py-0.5 text-[11px] uppercase tracking-wide', styles[status])}>{status}</span>
    );
}
