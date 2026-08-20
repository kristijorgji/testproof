'use client';

import type { CoverageCell, Flow, FlowTarget, PlatformNode } from '@testproof/core';
import { useState } from 'react';

import { useT } from '../i18n/LocaleProvider';

import { TargetPicker } from './TargetPicker';

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
    const t = useT();
    const [more, setMore] = useState(false);
    const [title, setTitle] = useState(flow.title);
    const [note, setNote] = useState(flow.note ?? '');
    const [targets, setTargets] = useState<FlowTarget[]>(flow.targets ?? []);

    return (
        <section className="flex flex-col gap-3 p-4">
            <code className="text-xs text-[var(--muted)]">{flow.id}</code>
            <input
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-lg"
                value={title}
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
            <label className="text-sm text-[var(--muted)]">{t('editor.note')}</label>
            <textarea
                className="min-h-24 rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                value={note}
                onChange={(e) => {
                    setNote(e.target.value);
                    onChange?.({ note: e.target.value });
                }}
            />
            <div className="rounded border border-[var(--border)] p-2 text-xs">
                demanded {demanded.length} · covered {covered.length}
            </div>
            <button type="button" className="text-sm underline" onClick={() => setMore((v) => !v)}>
                {t('editor.more')}
            </button>
            {more ? (
                <div className="grid gap-2 text-sm">
                    <input placeholder="priority" defaultValue={flow.priority} />
                    <input placeholder="severity" defaultValue={flow.severity} />
                    <input placeholder="type" defaultValue={flow.type} />
                    <input placeholder="owner" defaultValue={flow.owner} />
                </div>
            ) : null}
        </section>
    );
}
