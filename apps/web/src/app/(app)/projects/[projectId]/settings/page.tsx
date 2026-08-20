export default async function SettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    return (
        <main className="mx-auto max-w-2xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-[var(--muted)]">Project {projectId}. Connect a GitHub repo and create a hashed API token here.</p>
        </main>
    );
}
