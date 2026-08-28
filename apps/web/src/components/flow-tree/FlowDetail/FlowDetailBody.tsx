'use client';

import type { PlatformNode } from '@testproof/core';
import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { TargetPicker } from '../TargetPicker/TargetPicker';

import { FlowDetailAdvancedFields } from './FlowDetailAdvancedFields';
import type { FlowDetailFormState } from './useFlowDetailForm';

export function FlowDetailBody({
    flowId,
    breadcrumb,
    hideIdentity = false,
    titleInputRef,
    form,
    titleError,
    platforms,
    demandedCount,
    coveredCount,
    more,
    onToggleMore,
    onTitleChange,
    onTitleBlur,
}: {
    flowId: string;
    breadcrumb?: string;
    hideIdentity?: boolean;
    titleInputRef: RefObject<HTMLInputElement | null>;
    form: FlowDetailFormState;
    titleError: string | null;
    platforms: PlatformNode[];
    demandedCount: number;
    coveredCount: number;
    more: boolean;
    onToggleMore: () => void;
    onTitleChange: (value: string) => void;
    onTitleBlur: () => void;
}) {
    const { t } = useTranslation();
    return (
        <section className="flex flex-col gap-3 p-4">
            {!hideIdentity && <code className="text-xs text-[var(--muted)]">{flowId}</code>}
            {!hideIdentity && breadcrumb ? <p className="text-xs text-[var(--muted)]">{breadcrumb}</p> : null}
            <input
                ref={titleInputRef}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-lg"
                value={form.title}
                aria-label={t('editor.title')}
                aria-invalid={Boolean(titleError)}
                onChange={(e) => onTitleChange(e.target.value)}
                onBlur={onTitleBlur}
            />
            {titleError ? <p className="text-xs text-red-600">{titleError}</p> : null}
            <label className="text-sm text-[var(--muted)]">{t('editor.targets')}</label>
            <TargetPicker platforms={platforms} targets={form.targets} onChange={form.onTargetsChange} />
            <p className="text-xs text-[var(--muted)]">{t('editor.platformWhole')}</p>
            <label className="text-sm text-[var(--muted)]">{t('editor.notes')}</label>
            <textarea
                className="min-h-24 rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                value={form.notes}
                onChange={(e) => {
                    form.setNotes(e.target.value);
                    form.queueChange({ notes: e.target.value });
                }}
                onBlur={() => form.flushPending()}
            />
            <div className="rounded border border-[var(--border)] p-2 text-xs">
                {t('coverage.demandedCovered', { demanded: demandedCount, covered: coveredCount })}
            </div>
            <button type="button" className="text-sm underline" onClick={onToggleMore}>
                {t('editor.more')}
            </button>
            {more ? <FlowDetailAdvancedFields flow={form.localFlow} onChange={form.applyAdvanced} /> : null}
        </section>
    );
}
