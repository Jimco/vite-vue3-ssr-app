import path from 'path';
import c2k from 'koa-connect';
import { createRenderPage } from '@zqd/naco/src/render';
import { defineController } from '../util';
import { cacheMiddleware } from '../middleware';

const resolve = (p) => path.resolve(process.cwd(), p);

defineController(async (router) => {
    let homeRender: ReturnType<typeof createRenderPage> | undefined;
    let adminRender: ReturnType<typeof createRenderPage> | undefined;

    // admin app
    router.get(
        ['/admin', '/admin/:pathMatch(.*)'],
        cacheMiddleware({ max: 500, maxAge: 1000 * 60 }),
        async (ctx) => {
            if (ctx.path === '/admin') {
                ctx.redirect('/admin/');
                ctx.status = 301;
                return;
            }

            if (!adminRender) {
                adminRender = createRenderPage({
                    root: resolve('apps/admin'),
                    isDev: process.env.NODE_ENV !== 'production',
                    ssr: false,
                });
            }

            const { middlewares, renderPage } = await adminRender;

            await c2k(middlewares)(ctx, () => undefined);
            if (ctx.body) return;

            const { html, status, error, redirect } = await renderPage(ctx.path);
            if (error) {
                throw error;
            }

            ctx.status = status;

            if (redirect) {
                ctx.redirect(redirect);
            }

            ctx.body = html;
        }
    );

    // www app
    router.get('/:any(.*)', cacheMiddleware({ max: 500, maxAge: 1000 * 60 }), async (ctx) => {
        if (!homeRender) {
            homeRender = createRenderPage({
                root: resolve('apps/www'),
                isDev: process.env.NODE_ENV !== 'production',
                ssr: true,
            });
        }

        const { middlewares, renderPage } = await homeRender;

        await c2k(middlewares)(ctx, () => undefined);

        if (ctx.body) return;

        const { html, status, error, redirect } = await renderPage(ctx.url);
        if (error) {
            throw error;
        }

        ctx.status = status;

        if (redirect) {
            ctx.redirect(redirect);
        }

        ctx.body = html;
    });
});
