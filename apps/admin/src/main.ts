import { createSSRApp, createApp as createBrowserApp, ssrContextKey } from 'vue';
import { Naco, useNacoDataKey } from '@zqd/naco/client';
import { createRouter } from './router';
import App from './app.vue';

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
const isBrowser = typeof window !== 'undefined';

export function createApp(nacoData: any) {
    const app = isBrowser ? createBrowserApp(App) : createSSRApp(App);

    if (isBrowser) {
        app.provide(ssrContextKey, {});
    }

    const router = createRouter();
    app.use(router);

    if (nacoData) {
        app.provide(useNacoDataKey, nacoData);
    }

    app.use(Naco);

    return { app, router };
}
