import { sessions } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';

import { getDb } from '@/server/db';

export default async function SessionsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    let rows: Array<{ id: string; title: string; performedAt: Date; notes: string | null }> = [];
    try {
        rows = await getDb().select().from(sessions).where(eq(sessions.projectId, projectId)).orderBy(desc(sessions.performedAt));
    } catch {
        rows = [];
    }
    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">Manual sessions</h1>
            <form className="mb-6 grid gap-2 rounded border border-[var(--border)] p-4">
                <input name="title" placeholder="Session title" className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2" />
                <textarea name="notes" placeholder="Notes" className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2" />
                <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                    New session
                </button>
            </form>
            <ul className="grid gap-2">
                {rows.map((row) => (
                    <li key={row.id} className="rounded border border-[var(--border)] p-3">
                        <strong>{row.title}</strong>
                        <div className="text-sm text-[var(--muted)]">{row.performedAt.toISOString()}</div>
                        {row.notes ? <p>{row.notes}</p> : null}
                    </li>
                ))}
            </ul>
        </main>
    );
}
