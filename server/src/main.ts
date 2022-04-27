import Koa, { Context } from 'koa';
import koaBody from 'koa-body';
import Static from 'koa-static';
import cors from '@koa/cors';
import { useApp, providerContext } from './util';
import './controller';

const c = cors({
    origin: '*',
});

async function bootstrap() {
    const app = new Koa();

    app.use(Static('server/public', { extensions: ['html'] }));
    app.use(providerContext);
    app.use(koaBody());
    app.use(async (ctx: Context, next) => {
        ctx.cookies.secure = process.env.NODE_ENV === 'production';
        await next();
    });
    // 只对 sdk 中使用的 api 做跨域支持
    app.use(async (ctx: Context, next) => {
        if (/sdk\/api\//.test(ctx.path)) {
            await c(ctx, next);
        } else {
            await next();
        }
    });

    await useApp(app);
    app.listen(process.env.PORT, () => {
        console.log(`http://localhost:${process.env.PORT}`);
    });
    process.on('uncaughtException', (error) => {
        console.error(error);
    });
}

bootstrap();
