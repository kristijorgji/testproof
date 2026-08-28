'use client';

import { useState } from 'react';

import { parseGroupKey } from './flow-editor-helpers';

import { flowIdPrefixForArea } from '@/lib/format-flow-id-display';

function prefixForGroupKey(groupKey: string): string {
    const parent = parseGroupKey(groupKey);
    return parent ? flowIdPrefixForArea(parent.areaId) : 'FLOW-';
}

export function useFlowEditorFormState(initialGroupKey: string): {
    tab: 'edit' | 'changes';
    setTab: (tab: 'edit' | 'changes') => void;
    newFlowId: string;
    setNewFlowId: (value: string) => void;
    newFlowTitle: string;
    setNewFlowTitle: (value: string) => void;
    newAreaId: string;
    setNewAreaId: (value: string) => void;
    newAreaTitle: string;
    setNewAreaTitle: (value: string) => void;
    createGroupKey: string;
    setCreateGroupKey: (value: string) => void;
    createParentId: string | undefined;
    setCreateParentId: (value: string | undefined) => void;
    formError: string | null;
    setFormError: (value: string | null) => void;
} {
    const [tab, setTab] = useState<'edit' | 'changes'>('edit');
    const [createGroupKey, setCreateGroupKeyState] = useState(initialGroupKey);
    const [newFlowId, setNewFlowId] = useState(() => prefixForGroupKey(initialGroupKey));
    const [newFlowTitle, setNewFlowTitle] = useState('');
    const [newAreaId, setNewAreaId] = useState('');
    const [newAreaTitle, setNewAreaTitle] = useState('');
    const [createParentId, setCreateParentId] = useState<string | undefined>();
    const [formError, setFormError] = useState<string | null>(null);

    const setCreateGroupKey = (value: string): void => {
        setCreateGroupKeyState(value);
        const nextPrefix = prefixForGroupKey(value);
        setNewFlowId((current) => {
            if (!current || /^FLOW-[A-Z0-9]+-$/.test(current)) return nextPrefix;
            return current;
        });
    };

    return {
        tab,
        setTab,
        newFlowId,
        setNewFlowId,
        newFlowTitle,
        setNewFlowTitle,
        newAreaId,
        setNewAreaId,
        newAreaTitle,
        setNewAreaTitle,
        createGroupKey,
        setCreateGroupKey,
        createParentId,
        setCreateParentId,
        formError,
        setFormError,
    };
}
