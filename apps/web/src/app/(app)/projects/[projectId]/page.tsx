import Link from 'next/link';

export default async function ProjectOverview({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const links = [
        ['Flows', 'flows'],
        ['Coverage', 'coverage'],
        ['Runs', 'runs'],
        ['Sessions', 'sessions'],
        ['Settings', 'settings'],
    ] as const;
    return (
        <main className="mx-auto max-w-3xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">Project</h1>
            <nav className="grid gap-2">
                {links.map(([label, href]) => (
                    <Link key={href} className="rounded border border-[var(--border)] p-3" href={`/projects/${projectId}/${href}`}>
                        {label}
                    </Link>
                ))}
            </nav>
        </main>
    );
}
