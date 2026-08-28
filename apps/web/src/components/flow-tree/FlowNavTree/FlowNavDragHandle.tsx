'use client';

import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function FlowNavDragHandle({
    attributes,
    listeners,
}: {
    attributes?: DraggableAttributes;
    listeners?: DraggableSyntheticListeners;
}) {
    const { t } = useTranslation();
    return (
        <button
            type="button"
            className="shrink-0 cursor-grab px-1 text-[var(--muted)] active:cursor-grabbing"
            aria-label={t('editor.dragHandle')}
            {...(attributes ?? {})}
            {...(listeners ?? {})}
        >
            <GripVertical className="h-3.5 w-3.5" aria-hidden />
        </button>
    );
}
