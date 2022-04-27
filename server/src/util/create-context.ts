import { AsyncLocalStorage } from 'async_hooks';
import { Context } from 'koa';

const als = new AsyncLocalStorage<Map<symbol, any>>();
// eslint-disable-next-line
const ctxKey = Symbol();

export async function providerContext(ctx: Context, next: () => Promise<void>) {
    await new Promise((resolve) => {
        const map = new Map();
        map.set(ctxKey, ctx);

        als.run(map, async () => {
            await next();
            resolve(true);
        });
    });
}

export function useContext(): Context {
    return als.getStore().get(ctxKey);
}

export function createContext<T>(fn: (ctx: Context) => T | Promise<T>) {
    // eslint-disable-next-line
    const key = Symbol();
    return async function (): Promise<T> {
        const store = als.getStore();
        if (!store.has(key)) {
            const obj = await fn(store.get(ctxKey));
            store.set(key, obj);
        }
        return store.get(key);
    };
}

export function createSyncContext<T>(fn: (ctx: Context) => T) {
    // eslint-disable-next-line
    const key = Symbol();
    return function (): T {
        const store = als.getStore();
        if (!store.has(key)) {
            const obj = fn(store.get(ctxKey));
            store.set(key, obj);
        }
        return store.get(key);
    };
}
