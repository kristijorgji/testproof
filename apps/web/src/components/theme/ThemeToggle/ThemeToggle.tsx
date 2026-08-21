'use client';

import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { type ReactElement, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ThemeMode } from '../ThemeProvider/theme-context';
import { useTheme } from '../ThemeProvider/useTheme';

const options: Array<{ mode: ThemeMode; icon: typeof Sun }> = [
    { mode: 'light', icon: Sun },
    { mode: 'dark', icon: Moon },
    { mode: 'system', icon: Monitor },
];

export function ThemeToggle(): ReactElement {
    const { mode, setMode } = useTheme();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const menuId = useId();
    const ActiveIcon = options.find((option) => option.mode === mode)?.icon ?? Monitor;

    useEffect(() => {
        if (!open) return;
        function onPointerDown(event: MouseEvent): void {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        function onKey(event: KeyboardEvent): void {
            if (event.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                aria-expanded={open}
                aria-controls={menuId}
                aria-haspopup="menu"
                aria-label={t('theme.label')}
                className="rounded border border-[var(--border)] p-1.5"
                onClick={() => setOpen((value) => !value)}
            >
                <ActiveIcon className="h-4 w-4" />
            </button>
            {open ? (
                <ul
                    id={menuId}
                    role="menu"
                    className="absolute right-0 z-20 mt-1 min-w-36 rounded border border-[var(--border)] bg-[var(--card)] py-1 shadow"
                >
                    {options.map((option) => {
                        const Icon = option.icon;
                        const selected = option.mode === mode;
                        return (
                            <li key={option.mode} role="none">
                                <button
                                    type="button"
                                    role="menuitem"
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm"
                                    onClick={() => {
                                        setMode(option.mode);
                                        setOpen(false);
                                    }}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="flex-1">{t(`theme.${option.mode}`)}</span>
                                    {selected ? <Check className="h-4 w-4" /> : null}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </div>
    );
}
