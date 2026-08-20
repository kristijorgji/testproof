'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { defaultLocale, getI18nConfig } from './config';

void i18next.use(initReactI18next).init(getI18nConfig({ lng: defaultLocale }));

export default i18next;
