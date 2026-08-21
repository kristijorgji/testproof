'use client';

import type { Flow } from '@testproof/core';
import { useTranslation } from 'react-i18next';

import { FieldSelect } from './FieldSelect';
import { AUTOMATIONS, BEHAVIORS, LAYERS, PRIORITIES, SEVERITIES, STATUSES, TYPES } from './flow-field-options';

export function FlowDetailEnumFields({ flow, onChange }: { flow: Flow; onChange?: (patch: Partial<Flow>) => void }) {
    const { t } = useTranslation();
    return (
        <>
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
        </>
    );
}
