import { http, HttpResponse } from 'msw';

import { applyMswOptions, type MswHandlerOptions, mswUrl } from './_utils';

export function ledgerGetHandler(
    body: { yaml: string; revision: number; storage: 'git' | 'file' | 'db' },
    options?: MswHandlerOptions,
): ReturnType<typeof http.get> {
    return http.get(mswUrl('/api/v1/ledger'), async () => {
        const error = await applyMswOptions(options);
        return error ?? HttpResponse.json(body);
    });
}

export function ledgerPutHandler(body: { revision: number }, options?: MswHandlerOptions): ReturnType<typeof http.put> {
    return http.put(mswUrl('/api/v1/ledger'), async () => {
        const error = await applyMswOptions(options);
        return error ?? HttpResponse.json(body);
    });
}
