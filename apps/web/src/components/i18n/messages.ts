export const locales = ['en', 'de'] as const;
export type AppLocale = (typeof locales)[number];

export const localeFlags: Record<AppLocale, string> = { en: '🇬🇧', de: '🇩🇪' };

export const messages: Record<AppLocale, Record<string, string>> = {
    en: {
        'app.name': 'Testproof',
        'nav.flows': 'Flows',
        'nav.coverage': 'Coverage',
        'nav.runs': 'Runs',
        'nav.sessions': 'Sessions',
        'nav.settings': 'Settings',
        'editor.more': 'More fields',
        'editor.publish': 'Publish',
        'editor.changes': 'Changes',
        'editor.targets': 'Targets',
        'editor.note': 'Note',
        'editor.platformWhole': 'Leaving a dimension untouched means the platform as a whole.',
        'coverage.empty': 'No coverage snapshot yet. Run `testproof push` from CI.',
        'sessions.new': 'New session',
        'conflict.title': 'Remote ledger changed',
        'conflict.replay': 'Replay my patches onto latest',
        'conflict.discard': 'Discard mine',
    },
    de: {
        'app.name': 'Testproof',
        'nav.flows': 'Flows',
        'nav.coverage': 'Abdeckung',
        'nav.runs': 'Läufe',
        'nav.sessions': 'Sitzungen',
        'nav.settings': 'Einstellungen',
        'editor.more': 'Weitere Felder',
        'editor.publish': 'Veröffentlichen',
        'editor.changes': 'Änderungen',
        'editor.targets': 'Ziele',
        'editor.note': 'Notiz',
        'editor.platformWhole': 'Eine unberührte Dimension bedeutet die Plattform als Ganzes.',
        'coverage.empty': 'Noch kein Coverage-Snapshot. Führe `testproof push` in CI aus.',
        'sessions.new': 'Neue Sitzung',
        'conflict.title': 'Remote-Ledger geändert',
        'conflict.replay': 'Patches auf neueste Version anwenden',
        'conflict.discard': 'Meine verwerfen',
    },
};
