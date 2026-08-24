'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import { TokenListItem } from './TokenListItem';

import type { ApiTokenListItem } from '@/actions/settings';
import { useMountedConfirmDialog } from '@/components/common/ConfirmDialog/useMountedConfirmDialog';

export function TokenList({
    tokens,
    pending,
    deleteAction,
}: {
    tokens: ApiTokenListItem[];
    pending: boolean;
    deleteAction: (tokenId: string) => void | Promise<void>;
}) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [deleting, startDelete] = useTransition();
    const { requestConfirm, confirmDialog } = useMountedConfirmDialog();
    const busy = pending || deleting;

    if (tokens.length === 0) {
        return <p className="text-sm text-[var(--muted)]">{t('settings.tokensEmpty')}</p>;
    }

    const requestRevoke = (tokenId: string): void => {
        requestConfirm({
            title: t('settings.confirmRevokeToken'),
            confirmLabel: t('settings.revokeToken'),
            cancelLabel: t('common.cancel'),
            variant: 'destructive',
            onConfirm: () => {
                startDelete(async () => {
                    await deleteAction(tokenId);
                    router.refresh();
                });
            },
        });
    };

    return (
        <>
            <ul className="grid gap-2">
                {tokens.map((row) => (
                    <TokenListItem key={row.id} row={row} busy={busy} locale={i18n.language} onRevoke={requestRevoke} />
                ))}
            </ul>
            {confirmDialog}
        </>
    );
}
