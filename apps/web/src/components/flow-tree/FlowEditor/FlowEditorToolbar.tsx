'use client';

import { useTranslation } from 'react-i18next';

import type { FlowEditorActions } from './useFlowEditorActions';

export function FlowEditorToolbar({
    actions,
    onRequestDelete,
}: {
    actions: FlowEditorActions;
    onRequestDelete: () => void;
}) {
    const { t } = useTranslation();
    const { setTab, moveSelected, indentSelected, outdentSelected, selected } = actions;
    const disabled = !selected;

    return (
        <div className="flex flex-wrap gap-3 border-b border-[var(--border)] px-4 py-2 text-sm">
            <button type="button" onClick={() => setTab('edit')}>
                {t('editor.edit')}
            </button>
            <button type="button" onClick={() => setTab('changes')}>
                {t('editor.changes')}
            </button>
            <button type="button" disabled={disabled} onClick={() => moveSelected(-1)}>
                {t('editor.moveUp')}
            </button>
            <button type="button" disabled={disabled} onClick={() => moveSelected(1)}>
                {t('editor.moveDown')}
            </button>
            <button type="button" disabled={disabled} onClick={indentSelected}>
                {t('editor.indent')}
            </button>
            <button type="button" disabled={disabled} onClick={outdentSelected}>
                {t('editor.outdent')}
            </button>
            <button type="button" disabled={disabled} onClick={onRequestDelete}>
                {t('editor.deleteFlow')}
            </button>
        </div>
    );
}
