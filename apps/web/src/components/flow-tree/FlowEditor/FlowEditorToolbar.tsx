'use client';

import { useTranslation } from 'react-i18next';

import type { FlowEditorActions } from './useFlowEditorActions';

export function FlowEditorToolbar({ actions }: { actions: FlowEditorActions }) {
    const { t } = useTranslation();
    const { setTab, moveSelected, removeSelected } = actions;
    return (
        <div className="flex gap-3 border-b border-[var(--border)] px-4 py-2 text-sm">
            <button type="button" onClick={() => setTab('edit')}>
                {t('editor.edit')}
            </button>
            <button type="button" onClick={() => setTab('changes')}>
                {t('editor.changes')}
            </button>
            <button type="button" onClick={() => moveSelected(-1)}>
                {t('editor.moveUp')}
            </button>
            <button type="button" onClick={() => moveSelected(1)}>
                {t('editor.moveDown')}
            </button>
            <button type="button" onClick={removeSelected}>
                {t('editor.deleteFlow')}
            </button>
        </div>
    );
}
