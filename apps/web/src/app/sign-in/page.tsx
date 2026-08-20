import { SignInForm } from '@/components/auth/SignInForm';
import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next } = await searchParams;
    return (
        <main className="mx-auto max-w-md p-8">
            <div className="mb-6 flex justify-end">
                <LocaleSwitcher />
            </div>
            <SignInForm nextPath={next && next.startsWith('/') ? next : '/projects'} />
        </main>
    );
}
