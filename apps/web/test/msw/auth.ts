import { http, HttpResponse } from 'msw';

import { applyMswOptions, type MswHandlerOptions, mswUrl } from './_utils';

export function signInEmailHandler(
    body: Record<string, unknown> = {},
    options?: MswHandlerOptions,
): ReturnType<typeof http.post> {
    return http.post(mswUrl('/api/auth/sign-in/email'), async () => {
        const error = await applyMswOptions(options);
        return error ?? HttpResponse.json(body);
    });
}

export function signUpEmailHandler(
    body: Record<string, unknown> = {},
    options?: MswHandlerOptions,
): ReturnType<typeof http.post> {
    return http.post(mswUrl('/api/auth/sign-up/email'), async () => {
        const error = await applyMswOptions(options);
        return error ?? HttpResponse.json(body);
    });
}

export function signOutHandler(
    body: { success: boolean } = { success: true },
    options?: MswHandlerOptions,
): ReturnType<typeof http.post> {
    return http.post(mswUrl('/api/auth/sign-out'), async () => {
        const error = await applyMswOptions(options);
        return error ?? HttpResponse.json(body);
    });
}
