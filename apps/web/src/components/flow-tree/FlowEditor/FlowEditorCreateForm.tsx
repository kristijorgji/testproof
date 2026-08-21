'use client';

import { useTranslation } from 'react-i18next';

import type { FlowEditorActions } from './useFlowEditorActions';

export function FlowEditorCreateForm({ actions }: { actions: FlowEditorActions }) {
    const { t } = useTranslation();
    const {
        newFlowId,
        setNewFlowId,
        newFlowTitle,
        setNewFlowTitle,
        newAreaId,
        setNewAreaId,
        newAreaTitle,
        setNewAreaTitle,
        formError,
        addFlow,
        addArea,
    } = actions;

    return (
        <div className="grid gap-2 border-t border-[var(--border)] p-3 text-sm">
            <input
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
                placeholder={t('editor.newFlowId')}
                value={newFlowId}
                onChange={(e) => setNewFlowId(e.target.value)}
            />
            <input
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
                placeholder={t('editor.newFlowTitle')}
                value={newFlowTitle}
                onChange={(e) => setNewFlowTitle(e.target.value)}
            />
            <button type="button" className="rounded border border-[var(--border)] px-2 py-1" onClick={addFlow}>
                {t('editor.addFlow')}
            </button>
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
            {formError ? <p className="text-red-600">{formError}</p> : null}
        </div>
    );
}
