'use client';

import { useTranslation } from 'react-i18next';

const inputClass = 'w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 disabled:opacity-60';

export function SignUpNameField({
    name,
    setName,
    disabled,
}: {
    name: string;
    setName: (v: string) => void;
    disabled?: boolean;
}) {
    const { t } = useTranslation();
    return (
        <input
            name="name"
            className={inputClass}
            type="text"
            autoComplete="name"
            placeholder={t('auth.nameOptional')}
            value={name}
            disabled={disabled}
            onChange={(e) => setName(e.target.value)}
        />
    );
}
