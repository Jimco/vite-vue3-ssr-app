import { App } from 'vue';
import { Router } from 'vue-router';
import { renderToString } from '@vue/server-renderer';
import { useNacoDataKey } from './use-naco-data';

export function defineServerEntry(createApp: (data?: any) => { app: App; router: Router }) {
    return async function renderPage(path: string, ctx: any) {
        const { app, router } = createApp();
        app.provide(useNacoDataKey, ctx.state);
        router.push(path);

        try {
            await router.isReady();
            if (router.currentRoute.value.fullPath !== path) {
                ctx.status = 301;
                ctx.redirect = router.currentRoute.value.fullPath;
                return '';
            }
            if (router.currentRoute.value.name === '404') {
                ctx.status = 404;
            }

            const html = await renderToString(app, ctx);
            return html;
        } catch (error: any) {
            ctx.state.error = error.stack;
            ctx.error = error;
            const html = await renderToString(app, ctx);
            return html;
        }
    };
}
