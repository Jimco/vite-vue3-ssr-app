import Router from '@koa/router';
import Application from 'koa';

const router = new Router();
const fns: (() => Promise<void>)[] = [];

export function defineController(
    fn: (router: Router, ...args) => void,
) {
    fns.push(async () => await fn(router));
}

export async function useApp(app: Application) {
    for (const fn of fns) {
        await fn();
    }
    app.use(router.routes());
}
