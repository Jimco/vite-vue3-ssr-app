import { App } from 'vue';
import { Router } from 'vue-router';

export interface NacoInject {
    injectApp?(ctx: { app: App; router: Router; [k: string]: any }, isSSR: boolean): void;
    onRendered?(ctx: { app: App; router: Router; [k: string]: any }, isSSR: boolean): void;
}

export function defineInject(inject: NacoInject) {
    return inject;
}
