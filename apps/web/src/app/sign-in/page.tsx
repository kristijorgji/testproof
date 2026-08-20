import { SignInForm } from '@/components/auth/SignInForm';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next } = await searchParams;
    return (
        <main className="mx-auto max-w-md p-8">
            <SignInForm nextPath={next && next.startsWith('/') ? next : '/projects'} />
        </main>
    );
}
