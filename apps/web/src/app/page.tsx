import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="mx-auto max-w-2xl p-8">
            <h1 className="mb-2 text-3xl font-semibold">Testproof</h1>
            <p className="mb-6 text-[var(--muted)]">Git-native test case management. Definitions stay in YAML; runs live in Postgres.</p>
            <Link className="rounded bg-[var(--accent)] px-4 py-2 text-white" href="/projects">
                Open projects
            </Link>
        </main>
    );
}
