'use client';

import type { Flow, FlowTarget } from '@testproof/core';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

const DEBOUNCE_MS = 300;

export interface FlowDetailFormState {
    title: string;
    setTitle: (value: string) => void;
    notes: string;
    setNotes: (value: string) => void;
    targets: FlowTarget[];
    localFlow: Flow;
    queueChange: (partial: Partial<Flow>) => void;
    flushPending: () => void;
    applyAdvanced: (partial: Partial<Flow>) => void;
    onTargetsChange: (next: FlowTarget[]) => void;
}

export function useFlowDetailForm(flow: Flow, onChange?: (patch: Partial<Flow>) => void): FlowDetailFormState {
    const [title, setTitle] = useState(flow.title);
    const [notes, setNotes] = useState(flow.notes ?? '');
    const [targets, setTargets] = useState<FlowTarget[]>(flow.targets ?? []);
    const [owner, setOwner] = useState(flow.owner ?? '');
    const [estimateMinutes, setEstimateMinutes] = useState<number | undefined>(flow.estimateMinutes);
    const [preconditions, setPreconditions] = useState(flow.preconditions ?? '');
    const [postconditions, setPostconditions] = useState(flow.postconditions ?? '');
    const pendingRef = useRef<Partial<Flow>>({});
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flushPending = useEffectEvent(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        const pending = pendingRef.current;
        pendingRef.current = {};
        if (Object.keys(pending).length === 0) return;
        onChange?.(pending);
    });

    const queueChange = useEffectEvent((partial: Partial<Flow>) => {
        pendingRef.current = { ...pendingRef.current, ...partial };
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => flushPending(), DEBOUNCE_MS);
    });

    useEffect(() => {
        setTitle(flow.title);
        setNotes(flow.notes ?? '');
        setTargets(flow.targets ?? []);
        setOwner(flow.owner ?? '');
        setEstimateMinutes(flow.estimateMinutes);
        setPreconditions(flow.preconditions ?? '');
        setPostconditions(flow.postconditions ?? '');
        pendingRef.current = {};
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, [
        flow.id,
        flow.title,
        flow.notes,
        flow.targets,
        flow.owner,
        flow.estimateMinutes,
        flow.preconditions,
        flow.postconditions,
    ]);

    useEffect(
        () => () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        },
        [],
    );

    return {
        title,
        setTitle,
        notes,
        setNotes,
        targets,
        localFlow: {
            ...flow,
            title,
            notes: notes || undefined,
            targets,
            owner: owner || undefined,
            estimateMinutes,
            preconditions: preconditions || undefined,
            postconditions: postconditions || undefined,
        },
        queueChange,
        flushPending,
        applyAdvanced: (partial: Partial<Flow>) => {
            if (partial.owner !== undefined) setOwner(partial.owner ?? '');
            if (partial.estimateMinutes !== undefined) setEstimateMinutes(partial.estimateMinutes);
            if (partial.preconditions !== undefined) setPreconditions(partial.preconditions ?? '');
            if (partial.postconditions !== undefined) setPostconditions(partial.postconditions ?? '');
            if (
                partial.owner !== undefined ||
                partial.estimateMinutes !== undefined ||
                partial.preconditions !== undefined ||
                partial.postconditions !== undefined ||
                partial.notes !== undefined
            ) {
                queueChange(partial);
                return;
            }
            onChange?.(partial);
        },
        onTargetsChange: (next: FlowTarget[]) => {
            setTargets(next);
            onChange?.({ targets: next });
        },
    };
}
