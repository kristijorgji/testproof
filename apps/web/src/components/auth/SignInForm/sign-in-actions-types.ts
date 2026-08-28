import type { AuthTab } from './auth-tab';

export interface SignInActions {
    tab: AuthTab;
    setTab: (tab: AuthTab) => void;
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    confirmPassword: string;
    setConfirmPassword: (value: string) => void;
    name: string;
    setName: (value: string) => void;
    error: string | null;
    passwordError: string | null;
    pending: boolean;
    submit: () => Promise<void>;
    signInGithub: () => Promise<void>;
}

export function mapGithubError(message: string | undefined, t: (key: string) => string): string {
    const lower = (message ?? '').toLowerCase();
    if (lower.includes('provider') || lower.includes('github') || lower.includes('not configured')) {
        return t('auth.githubNotConfigured');
    }
    return t('auth.githubFailed');
}
