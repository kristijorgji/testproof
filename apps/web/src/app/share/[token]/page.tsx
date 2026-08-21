import { coverageSnapshots, flowCoverage, projects } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';

import { SharePageContent } from '@/components/pages/SharePageContent/SharePageContent';
import { getDb } from '@/server/db';

export const metadata = { robots: { index: false, follow: false } };

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    let rows: Array<{ flowId: string; status: string }> = [];
    try {
        const [project] = await getDb().select().from(projects).where(eq(projects.shareToken, token)).limit(1);
        if (project) {
            const [snapshot] = await getDb()
                .select()
                .from(coverageSnapshots)
                .where(eq(coverageSnapshots.projectId, project.id))
                .orderBy(desc(coverageSnapshots.createdAt))
                .limit(1);
            if (snapshot) {
                rows = await getDb().select().from(flowCoverage).where(eq(flowCoverage.snapshotId, snapshot.id));
            }
        }
    } catch {
        rows = [];
    }
    return <SharePageContent rows={rows} />;
}
