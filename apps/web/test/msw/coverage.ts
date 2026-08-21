import { http, HttpResponse } from 'msw';

import { applyMswOptions, type MswHandlerOptions, mswUrl } from './_utils';

export function coveragePushHandler(
    body: { snapshotId: string },
    options?: MswHandlerOptions,
): ReturnType<typeof http.post> {
    return http.post(mswUrl('/api/v1/coverage'), async () => {
        const error = await applyMswOptions(options);
        return error ?? HttpResponse.json(body);
    });
}
