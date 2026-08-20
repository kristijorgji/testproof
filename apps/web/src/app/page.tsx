import Link from 'next/link';

import { T } from '@/components/i18n/T';

export default function HomePage() {
    return (
        <main className="mx-auto max-w-2xl p-8">
            <h1 className="mb-2 text-3xl font-semibold">
                <T k="app.name" />
            </h1>
            <p className="mb-6 text-[var(--muted)]">
                <T k="home.tagline" />
            </p>
            <Link className="rounded bg-[var(--accent)] px-4 py-2 text-white" href="/projects">
                <T k="home.openProjects" />
            </Link>
        </main>
    );
}
