import fs from 'fs';
import path from 'path';
import Module from 'module';
import { template } from 'lodash';
import { ViteDevServer, ModuleGraph } from 'vite';
import { SourceMapConsumer, RawSourceMap } from 'source-map';
// import { POINT_CONVERSION_HYBRID } from 'constants';

let offset: number;
try {
    // eslint-disable-next-line
    new Function('throw new Error(1)')();
} catch (e) {
    // in Node 12, stack traces account for the function wrapper.
    // in Node 13 and later, the function wrapper adds two lines,
    // which must be subtracted to generate a valid mapping
    const match = /:(\d+):\d+\)$/.exec(e.stack.split('\n')[1]);
    offset = match ? +match[1] - 1 : 0;
}

export function ssrRewriteStacktrace(stack: string, moduleGraph: ModuleGraph) {
    return stack
        .split('\n')
        .map((line) => {
            return line.replace(
                /^ {4}at (?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?)\)?/,
                (input, varName, url, line, column) => {
                    if (!url) return input;

                    const mod = moduleGraph.urlToModuleMap.get(url);
                    const rawSourceMap = mod?.ssrTransformResult?.map;

                    if (!rawSourceMap) {
                        return input;
                    }

                    const consumer = new SourceMapConsumer(rawSourceMap as any as RawSourceMap);

                    const pos = consumer.originalPositionFor({
                        line: Number(line) - offset,
                        column: Number(column) - 6,
                        bias: SourceMapConsumer.LEAST_UPPER_BOUND,
                    });

                    if (!pos.source) {
                        return input;
                    }

                    const source = `${pos.source}:${pos.line - offset || 0}:${pos.column || 0}`;
                    if (!varName || varName === 'eval') {
                        return `    at ${source}`;
                    } else {
                        return `    at ${varName} (${source})`;
                    }
                },
            );
        })
        .join('\n');
}

interface Manifest {
    [key: string]: string[];
}

function renderPreloadLinks(modules: Set<string>, manifest: Manifest): string {
    let links = '';
    const seen = new Set();
    modules.forEach((id) => {
        const files = manifest[id];
        if (files) {
            files.forEach((file) => {
                if (!seen.has(file)) {
                    seen.add(file);
                    links += renderPreloadLink(file);
                }
            });
        }
    });
    return links;
}

function renderPreloadLink(file: string): string {
    if (file.endsWith('.js')) {
        if (/[.-]legacy/.test(file)) return '';
        return `<link rel="modulepreload" crossorigin href="${file}">`;
    } else if (file.endsWith('.css')) {
        return `<link rel="stylesheet" href="${file}">`;
    } else if (file.endsWith('.woff')) {
        return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
    } else if (file.endsWith('.woff2')) {
        return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
    } else if (file.endsWith('.gif')) {
        return ` <link rel="preload" href="${file}" as="image" type="image/gif" crossorigin>`;
    } else if (file.endsWith('.jpg')) {
        return ` <link rel="preload" href="${file}" as="image" type="image/jpeg" crossorigin>`;
    } else if (file.endsWith('.jpeg')) {
        return ` <link rel="preload" href="${file}" as="image" type="image/jpeg" crossorigin>`;
    } else if (file.endsWith('.png')) {
        return ` <link rel="preload" href="${file}" as="image" type="image/png" crossorigin>`;
    } else {
        // TODO
        return '';
    }
}

interface Options<T extends boolean> {
    isDev: T;
    /**
     * 是否禁止降级渲染
     *
     * @type {boolean}
     * @memberof Options
     */
    disabledDemotion?: boolean;
    ssr: boolean;
    root: string;
}

// type Mable<T, S> = T extends true ? S : undefined;

function htmlToTemplate(html: string) {
    return template(html, { interpolate: /{{([\s\S]+?)}}/g });
}

function createCtx() {
    return {
        state: {
            title: '',
        },
        title: '',
        status: 200,
        error: null as Error,
        redirect: '',
        links: new Set<string>(),
        modules: new Set<string>(),
        heads: new Set<string>(),
    };
}
let port = 24768;
export async function createRenderPage<T extends boolean>(options: Options<T>) {
    const manifest =
        options.isDev || !options.ssr
            ? null
            : JSON.parse(
                  fs
                      .readFileSync(path.join(options.root, 'dist', 'client', 'ssr-manifest.json'))
                      .toString(),
              );
    let viteDevServer: ViteDevServer;
    let render: any;
    if (options.isDev) {
        const vite = require('vite');

        viteDevServer = await vite.createServer({
            root: options.root,
            logLevel: 'info',
            mode: process.env.VITE_MODE,
            server: {
                hmr: {
                    port: (port += 1),
                },
                middlewareMode: 'ssr',
                watch: {
                    usePolling: true,
                    interval: 100,
                },
            },
        });

        if (options.ssr) {
            render = (await viteDevServer.ssrLoadModule('/src/entry-server.ts')).default;
            viteDevServer.watcher.on('change', async () => {
                render = (await viteDevServer.ssrLoadModule('/src/entry-server.ts')).default;
            });
        }
    } else if (options.ssr) {
        // 因为通过 ncc 编译后，无法动态加载文件， 所以使用 Module.createRequire 方式规避该问题
        const m = Module.createRequire(__dirname)(
            path.join(options.root, 'dist', 'server', 'entry-server.js'),
        );
        render = m?.default ?? m;
    }

    const template = htmlToTemplate(
        fs.readFileSync(
            options.isDev
                ? path.resolve(options.root, 'index.html')
                : path.resolve(options.root, 'dist', 'client', 'index.html'),
            'utf-8',
        ),
    );

    return {
        ws: viteDevServer?.ws,
        middlewares: options.isDev
            ? viteDevServer?.middlewares
            : (req, res, next) => {
                  next();
              },
        async renderPage(url: string) {
            if (!options.ssr) {
                const html = template({ BODY: '<div id="app"></div>', HEAD: [], TITLE: '' });

                return {
                    html: options.isDev ? await viteDevServer.transformIndexHtml(url, html) : html,
                    status: 200,
                    redirect: null,
                    error: null,
                };
            }
            const ctx = createCtx();
            try {
                let body = await render(url, ctx);

                if (options.isDev) {
                    const cssHeads = await cssDepsToLinks(Array.from(ctx.links), viteDevServer);
                    ctx.heads.add(cssHeads.join('\n'));
                } else {
                    ctx.heads.add(renderPreloadLinks(ctx.modules, manifest));
                }

                body += `<script>NACO_DATA=${JSON.stringify(ctx.state)}</script>`;

                if (ctx.error) {
                    ctx.error.stack = ssrRewriteStacktrace(
                        ctx.error.stack,
                        viteDevServer.moduleGraph,
                    );
                }
                const html = template({
                    BODY: `<div id="app">${body}</div>`,
                    TITLE: ctx.title,
                    HEAD: Array.from(ctx.heads).join('\n'),
                });
                return {
                    html: options.isDev ? await viteDevServer.transformIndexHtml(url, html) : html,
                    status: ctx.status,
                    error: ctx.error,
                };
            } catch (error) {
                if (options.isDev) viteDevServer.ssrFixStacktrace(error);
                if (!options.disabledDemotion) {
                    return {
                        html: template({ BODY: '<div id="app"></div>', HEAD: [], TITLE: '' }),
                        status: 200,
                        redirect: ctx.redirect,
                        error,
                    };
                }
                return {
                    html: null,
                    status: ctx.status || 500,
                    redirect: ctx.redirect,
                    error,
                };
            }
        },
    };
}

async function cssDepsToLinks(deps: string[], server: ViteDevServer) {
    const links = await Promise.all(
        deps.map(async (link) => {
            const [, id] = await server.moduleGraph.resolveUrl(link);
            const module = server.moduleGraph.getModuleById(id);
            let style = '';
            if (module && /\.(css|less|sass|scss|styl)$/.test(link)) {
                const reg = /const css = (".*")\s/;
                const res = (await server.transformRequest(module.url)) as { code: string };
                const r = reg.exec(res.code);
                if (r) {
                    style = JSON.parse(r[1]);
                }
            } else if (!module?.ssrTransformResult) {
                style = fs.readFileSync(id.replace(/\?.*/, '')).toString();
            } else {
                // eslint-disable-next-line
                style = new Function(
                    '__vite_ssr_exports__ = {};\n' +
                        module.ssrTransformResult.code +
                        '\nreturn __vite_ssr_exports__.default',
                )();
            }
            if (style) {
                return `<style type="text/css" naco-id="${id}">${style}</style>`;
            }
        }),
    );
    return links;
}
