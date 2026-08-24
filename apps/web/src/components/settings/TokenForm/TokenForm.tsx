'use client';

import { useTranslation } from 'react-i18next';

import { useTokenForm } from './useTokenForm';

import type { ApiTokenListItem } from '@/actions/settings';
import { CopyableCode } from '@/components/common/CopyableCode/CopyableCode';
import { ProjectIdField } from '@/components/settings/ProjectIdField/ProjectIdField';
import { TokenList } from '@/components/settings/TokenList/TokenList';

export function TokenForm({
    projectId,
    tokens,
    deleteAction,
}: {
    projectId: string;
    tokens: ApiTokenListItem[];
    deleteAction: (tokenId: string) => void | Promise<void>;
}) {
    const { t } = useTranslation();
    const { plaintext, error, pending, workingLabel, onSubmit } = useTokenForm(projectId);

    return (
        <div className="grid gap-4">
            <ProjectIdField projectId={projectId} />
            <TokenList tokens={tokens} pending={pending} deleteAction={deleteAction} />
            <form
                className="grid gap-2"
                aria-busy={pending}
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit(event.currentTarget);
                }}
            >
                <input
                    name="name"
                    disabled={pending}
                    placeholder={t('settings.tokenName')}
                    className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 disabled:opacity-60"
                />
                <button
                    type="submit"
                    disabled={pending}
                    className="rounded bg-[var(--accent)] px-3 py-2 text-white disabled:opacity-60"
                >
                    {pending ? workingLabel : t('settings.createToken')}
                </button>
                {plaintext ? (
                    <div className="grid gap-1 text-sm">
                        <p>{t('settings.tokenOnce')}</p>
                        <CopyableCode
                            value={plaintext}
                            copyLabel={t('settings.copyToken')}
                            copiedLabel={t('settings.tokenCopied')}
                        />
                    </div>
                ) : null}
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </form>
        </div>
    );
}
