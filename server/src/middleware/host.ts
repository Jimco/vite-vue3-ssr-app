import Router from '@koa/router';
import { Context } from 'koa';

export function hostMiddleware(host: string[], router: Router) {
    const routes = router.routes();
    return async (ctx: Context, next) => {
        if (host.includes(ctx.host)) {
            await routes(ctx as any, next);
        } else {
            await next();
        }
    };
}
