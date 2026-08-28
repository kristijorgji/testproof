'use client';

import { useTranslation } from 'react-i18next';

export function FlowEditorSidebarActions({
    flowId,
    onAddChild,
    onRequestDelete,
}: {
    flowId: string;
    onAddChild: (flowId: string) => void;
    onRequestDelete: (flowId: string) => void;
}) {
    const { t } = useTranslation();
    return (
        <>
            <button type="button" className="text-xs text-[var(--accent)] underline" onClick={() => onAddChild(flowId)}>
                {t('editor.addChildFlow')}
            </button>
            <button
                type="button"
                className="text-xs text-[var(--accent)] underline"
                onClick={() => onRequestDelete(flowId)}
            >
                {t('common.delete')}
            </button>
        </>
    );
}
