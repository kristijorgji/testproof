'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export type ProjectListItem = { id: string; name: string; slug: string };

export function ProjectListRow({
    project,
    preferred,
    deleting,
    onDelete,
    onSetPreferred,
    onClearPreferred,
}: {
    project: ProjectListItem;
    preferred: boolean;
    deleting: boolean;
    onDelete: (projectId: string) => void;
    onSetPreferred: () => void;
    onClearPreferred: () => void;
}) {
    const { t } = useTranslation();

    return (
        <li className="flex flex-wrap items-center justify-between gap-3 rounded border border-[var(--border)] p-3">
            <div className="min-w-0 flex-1">
                <Link className="block" href={`/projects/${project.id}`}>
                    {project.name} <span className="text-[var(--muted)]">/{project.slug}</span>
                </Link>
                {preferred ? (
                    <span className="mt-1 inline-block text-xs text-[var(--muted)]">{t('projects.defaultBadge')}</span>
                ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
                {preferred ? (
                    <button
                        type="button"
                        className="rounded border border-[var(--border)] px-2 py-1 text-sm"
                        onClick={onClearPreferred}
                    >
                        {t('projects.clearDefault')}
                    </button>
                ) : (
                    <button
                        type="button"
                        className="rounded border border-[var(--border)] px-2 py-1 text-sm"
                        onClick={onSetPreferred}
                    >
                        {t('projects.setDefault')}
                    </button>
                )}
                <button
                    type="button"
                    disabled={deleting}
                    className="rounded border border-red-300 px-2 py-1 text-sm text-red-700 disabled:opacity-60"
                    onClick={() => onDelete(project.id)}
                >
                    {deleting ? t('projects.deleting') : t('projects.delete')}
                </button>
            </div>
        </li>
    );
}
