import { account } from '@testproof/db';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from './auth';
import { getDb } from './db';

export async function getSession() {
    return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
    const session = await getSession();
    if (!session?.user) redirect('/sign-in');
    return session.user;
}

export async function getGithubAccessToken(userId: string): Promise<string | undefined> {
    const rows = await getDb().select().from(account).where(eq(account.userId, userId));
    return rows.find((row) => row.providerId === 'github')?.accessToken ?? undefined;
}
