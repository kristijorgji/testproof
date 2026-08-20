export function revalidatePath(): void {}
export function revalidateTag(): void {}
export function unstable_cache<T extends (...args: never[]) => unknown>(fn: T): T {
    return fn;
}
