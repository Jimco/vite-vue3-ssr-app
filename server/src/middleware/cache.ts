import { Context } from 'koa';
import LRU from 'lru-cache';

export function cacheMiddleware(options: { max: number; maxAge: number }) {
    const cache = new LRU(options);
    return async (ctx: Context, next) => {
        if (process.env.NODE_ENV === 'development') {
            return await next();
        }
        if (cache.has(ctx.path)) {
            ctx.body = cache.get(ctx.path);
        } else {
            await next();
            if (ctx.status === 200) {
                cache.set(ctx.path, ctx.body);
            }
        }
    };
}
