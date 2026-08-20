import { cookies } from 'next/headers';

import { type AppLocale, defaultLocale, isAppLocale, LOCALE_COOKIE } from './config';

export async function getLocaleFromCookie(): Promise<AppLocale> {
    const store = await cookies();
    const value = store.get(LOCALE_COOKIE)?.value;
    return isAppLocale(value) ? value : defaultLocale;
}
