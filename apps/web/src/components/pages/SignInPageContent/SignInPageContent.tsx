'use client';

import { SignInForm } from '@/components/auth/SignInForm/SignInForm';
import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher/LocaleSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle/ThemeToggle';

export function SignInPageContent({ nextPath }: { nextPath: string }) {
    return (
        <main className="mx-auto max-w-md p-8">
            <div className="mb-6 flex justify-end gap-3">
                <ThemeToggle />
                <LocaleSwitcher />
            </div>
            <SignInForm nextPath={nextPath} />
        </main>
    );
}
