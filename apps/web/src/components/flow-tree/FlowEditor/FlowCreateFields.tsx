'use client';

import { useTranslation } from 'react-i18next';

import type { FlowEditorActions } from './useFlowEditorActions';

export function FlowCreateFields({
    actions,
    groupOptions,
}: {
    actions: FlowEditorActions;
    groupOptions: { key: string; label: string }[];
}) {
    const { t } = useTranslation();
    const {
        newFlowId,
        setNewFlowId,
        newFlowTitle,
        setNewFlowTitle,
        createGroupKey,
        setCreateGroupKey,
        createParentId,
        setCreateParentId,
        addFlow,
    } = actions;

    return (
        <>
            {groupOptions.length > 1 ? (
                <label className="grid gap-1">
                    <span className="text-xs text-[var(--muted)]">{t('editor.selectGroup')}</span>
                    <select
                        className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
                        value={createGroupKey}
                        onChange={(event) => setCreateGroupKey(event.target.value)}
                    >
                        {groupOptions.map((option) => (
                            <option key={option.key} value={option.key}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            ) : null}
            {createParentId ? (
                <p className="text-xs text-[var(--muted)]">
                    {t('editor.addChildFlow')}: <code>{createParentId}</code>
                    <button type="button" className="ml-2 underline" onClick={() => setCreateParentId(undefined)}>
                        {t('common.cancel')}
                    </button>
                </p>
            ) : null}
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
        </>
    );
}
