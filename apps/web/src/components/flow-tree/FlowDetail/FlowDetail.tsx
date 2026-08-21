'use client';

import type { CoverageCell, Flow, FlowTarget, PlatformNode } from '@testproof/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TargetPicker } from '../TargetPicker/TargetPicker';

import { FlowDetailAdvancedFields } from './FlowDetailAdvancedFields';

export function FlowDetail({
    flow,
    platforms,
    demanded = [],
    covered = [],
    onChange,
}: {
    flow: Flow;
    platforms: PlatformNode[];
    demanded?: CoverageCell[];
    covered?: CoverageCell[];
    onChange?: (patch: Partial<Flow>) => void;
}) {
    const { t } = useTranslation();
    const [more, setMore] = useState(false);
    const [title, setTitle] = useState(flow.title);
    const [notes, setNotes] = useState(flow.notes ?? '');
    const [targets, setTargets] = useState<FlowTarget[]>(flow.targets ?? []);

    return (
        <section className="flex flex-col gap-3 p-4">
            <code className="text-xs text-[var(--muted)]">{flow.id}</code>
            <input
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-lg"
                value={title}
                aria-label={t('editor.title')}
                onChange={(e) => {
                    setTitle(e.target.value);
                    onChange?.({ title: e.target.value });
                }}
            />
            <label className="text-sm text-[var(--muted)]">{t('editor.targets')}</label>
            <TargetPicker
                platforms={platforms}
                targets={targets}
                onChange={(next) => {
                    setTargets(next);
                    onChange?.({ targets: next });
                }}
            />
            <p className="text-xs text-[var(--muted)]">{t('editor.platformWhole')}</p>
            <label className="text-sm text-[var(--muted)]">{t('editor.notes')}</label>
            <textarea
                className="min-h-24 rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                value={notes}
                onChange={(e) => {
                    setNotes(e.target.value);
                    onChange?.({ notes: e.target.value });
                }}
            />
            <div className="rounded border border-[var(--border)] p-2 text-xs">
                {t('coverage.demandedCovered', { demanded: demanded.length, covered: covered.length })}
            </div>
            <button type="button" className="text-sm underline" onClick={() => setMore((v) => !v)}>
                {t('editor.more')}
            </button>
            {more ? <FlowDetailAdvancedFields flow={flow} onChange={onChange} /> : null}
        </section>
    );
}
