'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export type ProjectListItem = { id: string; name: string; slug: string };

export function ProjectListRow({
    project,
    deleting,
    onDelete,
}: {
    project: ProjectListItem;
    deleting: boolean;
    onDelete: (projectId: string) => void;
}) {
    const { t } = useTranslation();

    return (
        <li className="flex items-center justify-between gap-3 rounded border border-[var(--border)] p-3">
            <Link className="min-w-0 flex-1" href={`/projects/${project.id}`}>
                {project.name} <span className="text-[var(--muted)]">/{project.slug}</span>
            </Link>
            <button
                type="button"
                disabled={deleting}
                className="shrink-0 rounded border border-red-300 px-2 py-1 text-sm text-red-700 disabled:opacity-60"
                onClick={() => onDelete(project.id)}
            >
                {deleting ? t('projects.deleting') : t('projects.delete')}
            </button>
        </li>
    );
}
