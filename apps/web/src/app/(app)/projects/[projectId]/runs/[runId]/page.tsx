import { runResults } from '@testproof/db';
import { eq } from 'drizzle-orm';

import { RunDetailContent, type RunResultItem } from '@/components/pages/RunDetailContent/RunDetailContent';
import { getDb } from '@/server/db';

export default async function RunDetailPage({ params }: { params: Promise<{ runId: string }> }) {
    const { runId } = await params;
    let rows: RunResultItem[] = [];
    try {
        rows = await getDb().select().from(runResults).where(eq(runResults.runId, runId));
    } catch {
        // Keep the empty list when the database is not available.
    }
    return <RunDetailContent results={rows} />;
}
