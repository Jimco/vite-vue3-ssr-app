import { createApp } from './main';

const { app, router } = createApp((window as any).NACO_DATA);

// wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => {
    app.mount('#app', true);
});
