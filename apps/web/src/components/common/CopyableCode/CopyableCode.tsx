'use client';

import { useState } from 'react';

export function CopyableCode({
    value,
    copyLabel,
    copiedLabel,
}: {
    value: string;
    copyLabel: string;
    copiedLabel: string;
}) {
    const [copied, setCopied] = useState(false);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <code className="break-all rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs">
                {value}
            </code>
            <button
                type="button"
                className="rounded border border-[var(--border)] px-2 py-1 text-sm"
                onClick={() => {
                    void navigator.clipboard.writeText(value).then(() => {
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 2000);
                    });
                }}
            >
                {copied ? copiedLabel : copyLabel}
            </button>
        </div>
    );
}
