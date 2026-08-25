'use client';

import { useState } from 'react';

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
    const [newFlowId, setNewFlowId] = useState('');
    const [newFlowTitle, setNewFlowTitle] = useState('');
    const [newAreaId, setNewAreaId] = useState('');
    const [newAreaTitle, setNewAreaTitle] = useState('');
    const [createGroupKey, setCreateGroupKey] = useState(initialGroupKey);
    const [createParentId, setCreateParentId] = useState<string | undefined>();
    const [formError, setFormError] = useState<string | null>(null);
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
