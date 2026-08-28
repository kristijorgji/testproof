'use client';

import type { CoverageCell, Flow, PlatformNode } from '@testproof/core';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FlowDetailBody } from './FlowDetailBody';
import { useFlowDetailForm } from './useFlowDetailForm';

export function FlowDetail({
    flow,
    platforms,
    demanded = [],
    covered = [],
    onChange,
    focusTitleToken,
    breadcrumb,
    hideIdentity = false,
}: {
    flow: Flow;
    platforms: PlatformNode[];
    demanded?: CoverageCell[];
    covered?: CoverageCell[];
    onChange?: (patch: Partial<Flow>) => void;
    focusTitleToken?: number;
    breadcrumb?: string;
    hideIdentity?: boolean;
}) {
    const { t } = useTranslation();
    const [more, setMore] = useState(false);
    const [titleError, setTitleError] = useState<string | null>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const form = useFlowDetailForm(flow, onChange);

    useEffect(() => setTitleError(null), [flow.id]);
    useEffect(() => {
        if (focusTitleToken === undefined) return;
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
    }, [focusTitleToken]);

    return (
        <FlowDetailBody
            flowId={flow.id}
            breadcrumb={breadcrumb}
            hideIdentity={hideIdentity}
            titleInputRef={titleInputRef}
            form={form}
            titleError={titleError}
            platforms={platforms}
            demandedCount={demanded.length}
            coveredCount={covered.length}
            more={more}
            onToggleMore={() => setMore((v) => !v)}
            onTitleChange={(next) => {
                form.setTitle(next);
                if (!next.trim()) {
                    setTitleError(t('editor.titleRequired'));
                    return;
                }
                setTitleError(null);
                form.queueChange({ title: next });
            }}
            onTitleBlur={() => {
                if (!form.title.trim()) {
                    setTitleError(t('editor.titleRequired'));
                    return;
                }
                form.flushPending();
            }}
        />
    );
}
