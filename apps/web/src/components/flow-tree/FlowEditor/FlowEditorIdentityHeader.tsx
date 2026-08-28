'use client';

export function FlowEditorIdentityHeader({ flowId, breadcrumb }: { flowId: string; breadcrumb?: string }) {
    return (
        <div className="shrink-0 border-b border-[var(--border)] bg-[var(--card)] px-4 py-2">
            <code className="text-xs text-[var(--muted)]">{flowId}</code>
            {breadcrumb ? <p className="text-xs text-[var(--muted)]">{breadcrumb}</p> : null}
        </div>
    );
}
