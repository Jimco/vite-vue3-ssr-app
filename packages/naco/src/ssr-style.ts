import { Plugin } from 'vite';
import path from 'path';
import hash from 'hash-sum';

/**
 * 处理开发环境 style 首屏问题
 *
 * @export
 * @returns {Plugin}
 */
export function ViteSSRStylePlugin(): Plugin {
    let isBuild = false;
    return {
        name: 'vite:naco-ssr-style',
        enforce: 'post',
        config(c, env) {
            isBuild = env.command === 'build';
        },
        transform(code, id, isSSR) {
            if (/\/vite\/dist\/client\/client.mjs/.test(id)) {
                return code.replace(
                    'const sheetsMap = new Map();',
                    `
                const sheetsMap = new Map();
                document.head.querySelectorAll('[naco-id]').forEach(el => {
                    sheetsMap.set(el.getAttribute('naco-id'), el);
                    el.removeAttribute('naco-id');
                    el.ssr = true;
                });
                `,
                );
            }
            if (/\.vue$/.test(id)) {
                code += `\n_sfc_main.id=${JSON.stringify(hash(path.relative(process.cwd(), id)))};`;
            }
            if (isBuild) return code;
            if (!isSSR || !/\.vue$/.test(id)) return code;
            const reg = /import.*?["'](.*?\.(css|less|sass|scss|styl))["']/g;
            const links = [];
            let r;

            while ((r = reg.exec(code))) {
                links.push(r[1]);
            }
            if (!links.length) return code;
            code += `
                const __naco_setup = _sfc_main.setup;
                _sfc_main.setup = (props, ctx) => {
                    const context = __useSSRContext();
                    if (!context.links) context.links = new Set();
                    ${JSON.stringify(links)}.forEach(link => context.links.add(link));
                    if (__naco_setup) return __naco_setup(props, ctx);
                }`;
            return "\nimport { useSSRContext as __useSSRContext } from 'vue'\n" + code;
        },
    };
}
