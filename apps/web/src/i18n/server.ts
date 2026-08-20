import i18next, { type TFunction } from 'i18next';

import { type AppLocale, getI18nConfig } from './config';

export async function getServerTranslation(locale: AppLocale): Promise<{ t: TFunction; i18n: typeof i18next }> {
    const instance = i18next.createInstance();
    await instance.init(getI18nConfig({ lng: locale }));
    return {
        t: instance.getFixedT(locale, 'common'),
        i18n: instance,
    };
}
