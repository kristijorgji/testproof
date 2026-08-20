let _pathname = '/en';

export function setPathname(pathname: string): void {
    _pathname = pathname;
}

export function usePathname(): string {
    return _pathname;
}

export function useRouter() {
    return {
        push: (path: string): void => {
            _pathname = path;
        },
        replace: (path: string): void => {
            _pathname = path;
        },
        back: (): void => undefined,
        forward: (): void => undefined,
        refresh: (): void => undefined,
        prefetch: (): void => undefined,
    };
}

export function useSearchParams(): URLSearchParams {
    return new URLSearchParams();
}

export function useParams(): { locale: string } {
    return { locale: _pathname.split('/')[1] ?? 'en' };
}

export function notFound(): never {
    throw new Error('Not Found');
}

export function redirect(url: string): void {
    _pathname = url;
}
