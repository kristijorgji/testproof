'use client';

import { useTranslation } from 'react-i18next';

export function FieldSelect<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: readonly T[];
    onChange: (value: T | '') => void;
}) {
    const { t } = useTranslation();
    return (
        <label className="grid gap-1">
            {label}
            <select
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                value={value}
                onChange={(e) => onChange(e.target.value as T | '')}
            >
                <option value="">{t('editor.unset')}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </label>
    );
}
