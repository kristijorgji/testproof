'use client';

import type { Flow } from '@testproof/core';
import { useTranslation } from 'react-i18next';

import { FlowDetailFlagFields } from './FlowDetailFlagFields';

export function FlowDetailMetaFields({ flow, onChange }: { flow: Flow; onChange?: (patch: Partial<Flow>) => void }) {
    const { t } = useTranslation();
    return (
        <>
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
            <FlowDetailFlagFields flow={flow} onChange={onChange} />
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
        </>
    );
}
