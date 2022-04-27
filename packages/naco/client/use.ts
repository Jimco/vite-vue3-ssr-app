import { App } from 'vue';
import { NacoHead, NacoScript } from './head';

export function Naco(app: App) {
    app.component('naco-head', NacoHead);
    app.component('naco-script', NacoScript);
}
