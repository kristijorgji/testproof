'use client';

import type { Flow } from '@testproof/core';
import { useTranslation } from 'react-i18next';

export function FlowDetailFlagFields({ flow, onChange }: { flow: Flow; onChange?: (patch: Partial<Flow>) => void }) {
    const { t } = useTranslation();
    return (
        <>
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
        </>
    );
}
