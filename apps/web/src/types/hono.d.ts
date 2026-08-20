import 'hono';

declare module 'hono' {
    interface ContextVariableMap {
        projectId: string;
    }
}
