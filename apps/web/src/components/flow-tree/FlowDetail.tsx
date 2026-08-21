'use client';

import type { CoverageCell, Flow, FlowTarget, PlatformNode } from '@testproof/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TargetPicker } from './TargetPicker';

const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
const SEVERITIES = ['trivial', 'minor', 'normal', 'major', 'critical', 'blocker'] as const;
const TYPES = [
    'functional',
    'smoke',
    'regression',
    'security',
    'usability',
    'performance',
    'accessibility',
    'acceptance',
    'other',
] as const;
const LAYERS = ['e2e', 'integration', 'api', 'unit'] as const;
const BEHAVIORS = ['positive', 'negative', 'destructive'] as const;
const STATUSES = ['draft', 'active', 'deprecated'] as const;
const AUTOMATIONS = ['automated', 'to-be-automated', 'manual'] as const;

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
    const [note, setNote] = useState(flow.note ?? '');
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
                {t('coverage.demandedCovered', { demanded: demanded.length, covered: covered.length })}
            </div>
            <button type="button" className="text-sm underline" onClick={() => setMore((v) => !v)}>
                {t('editor.more')}
            </button>
            {more ? (
                <div className="grid gap-2 text-sm">
                    <FieldSelect
                        label={t('editor.priority')}
                        value={flow.priority ?? ''}
                        options={PRIORITIES}
                        onChange={(value) => onChange?.({ priority: value || undefined })}
                    />
                    <FieldSelect
                        label={t('editor.severity')}
                        value={flow.severity ?? ''}
                        options={SEVERITIES}
                        onChange={(value) => onChange?.({ severity: value || undefined })}
                    />
                    <FieldSelect
                        label={t('editor.type')}
                        value={flow.type ?? ''}
                        options={TYPES}
                        onChange={(value) => onChange?.({ type: value || undefined })}
                    />
                    <FieldSelect
                        label={t('editor.layer')}
                        value={flow.layer ?? ''}
                        options={LAYERS}
                        onChange={(value) => onChange?.({ layer: value || undefined })}
                    />
                    <FieldSelect
                        label={t('editor.behavior')}
                        value={flow.behavior ?? ''}
                        options={BEHAVIORS}
                        onChange={(value) => onChange?.({ behavior: value || undefined })}
                    />
                    <FieldSelect
                        label={t('editor.status')}
                        value={flow.status ?? ''}
                        options={STATUSES}
                        onChange={(value) => onChange?.({ status: value || undefined })}
                    />
                    <FieldSelect
                        label={t('editor.automation')}
                        value={flow.automation ?? ''}
                        options={AUTOMATIONS}
                        onChange={(value) => onChange?.({ automation: value || undefined })}
                    />
                    <label className="grid gap-1">
                        {t('editor.owner')}
                        <input
                            className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                            defaultValue={flow.owner ?? ''}
                            onBlur={(e) => onChange?.({ owner: e.target.value || undefined })}
                        />
                    </label>
                    <label className="grid gap-1">
                        {t('editor.estimate')}
                        <input
                            type="number"
                            min={0}
                            className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                            defaultValue={flow.estimateMinutes ?? ''}
                            onBlur={(e) =>
                                onChange?.({
                                    estimateMinutes: e.target.value === '' ? undefined : Number(e.target.value),
                                })
                            }
                        />
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            defaultChecked={flow.flaky}
                            onChange={(e) => onChange?.({ flaky: e.target.checked })}
                        />
                        {t('editor.flaky')}
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            defaultChecked={flow.muted}
                            onChange={(e) => onChange?.({ muted: e.target.checked })}
                        />
                        {t('editor.muted')}
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            defaultChecked={flow.manual}
                            onChange={(e) => onChange?.({ manual: e.target.checked })}
                        />
                        {t('editor.manual')}
                    </label>
                    <label className="grid gap-1">
                        {t('editor.preconditions')}
                        <textarea
                            className="min-h-16 rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                            defaultValue={flow.preconditions ?? ''}
                            onBlur={(e) => onChange?.({ preconditions: e.target.value || undefined })}
                        />
                    </label>
                    <label className="grid gap-1">
                        {t('editor.postconditions')}
                        <textarea
                            className="min-h-16 rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                            defaultValue={flow.postconditions ?? ''}
                            onBlur={(e) => onChange?.({ postconditions: e.target.value || undefined })}
                        />
                    </label>
                </div>
            ) : null}
        </section>
    );
}

function FieldSelect<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: readonly T[];
    onChange: (value: T | '') => void;
}) {
    const { t } = useTranslation();
    return (
        <label className="grid gap-1">
            {label}
            <select
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                value={value}
                onChange={(e) => onChange(e.target.value as T | '')}
            >
                <option value="">{t('editor.unset')}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </label>
    );
}
