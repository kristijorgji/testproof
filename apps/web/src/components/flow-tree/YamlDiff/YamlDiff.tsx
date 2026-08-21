'use client';

import { diffLines } from 'diff';

export function YamlDiff({ before, after }: { before: string; after: string }) {
    const parts = diffLines(before, after);
    return (
        <pre className="overflow-auto rounded border border-[var(--border)] bg-[var(--card)] p-3 text-xs leading-5">
            {parts.map((part, i) => (
                <span
                    key={`${i}-${part.value.slice(0, 12)}`}
                    className={part.added ? 'bg-green-900/40' : part.removed ? 'bg-red-900/40' : ''}
                >
                    {part.value}
                </span>
            ))}
        </pre>
    );
}
