'use client';

import type { Ledger } from '@testproof/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FlowCreateFields } from './FlowCreateFields';
import type { FlowEditorActions } from './useFlowEditorActions';

import { FormAlert } from '@/components/common/FormAlert/FormAlert';

export function FlowEditorCreateForm({ ledger, actions }: { ledger: Ledger; actions: FlowEditorActions }) {
    const { t } = useTranslation();
    const { newAreaId, setNewAreaId, newAreaTitle, setNewAreaTitle, formError, addArea } = actions;
    const groupOptions = useMemo(
        () =>
            ledger.areas.flatMap((area) =>
                area.groups.map((group, groupIndex) => ({
                    key: `${area.id}::${groupIndex}`,
                    label: `${area.title} / ${group.subtitle ? `${group.title} — ${group.subtitle}` : group.title}`,
                })),
            ),
        [ledger.areas],
    );

    return (
        <div className="grid gap-2 border-t border-[var(--border)] p-3 text-sm">
            <FlowCreateFields actions={actions} groupOptions={groupOptions} />
            <input
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
                placeholder={t('editor.newAreaId')}
                value={newAreaId}
                onChange={(e) => setNewAreaId(e.target.value)}
            />
            <input
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
                placeholder={t('editor.newAreaTitle')}
                value={newAreaTitle}
                onChange={(e) => setNewAreaTitle(e.target.value)}
            />
            <button type="button" className="rounded border border-[var(--border)] px-2 py-1" onClick={addArea}>
                {t('editor.addArea')}
            </button>
            {formError ? <FormAlert variant="error" message={formError} /> : null}
        </div>
    );
}
