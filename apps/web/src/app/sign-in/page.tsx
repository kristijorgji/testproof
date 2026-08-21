import { SignInPageContent } from '@/components/pages/SignInPageContent/SignInPageContent';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next } = await searchParams;
    return <SignInPageContent nextPath={next && next.startsWith('/') ? next : '/projects'} />;
}
