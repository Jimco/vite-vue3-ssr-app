import fs from 'fs';
import path from 'path';
import { build as viteBuild } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export async function build(root: string = process.cwd(), ssr = true) {
    await viteBuild({
        root: root,
        plugins: [legacy()],
        build: {
            emptyOutDir: true,
            ssrManifest: true,
            rollupOptions: {
                context: 'this',
                output: {
                    dir: path.resolve(root, 'dist', 'client'),
                },
            },
        },
    });

    if (!ssr) {
        return;
    }
    await viteBuild({
        root: root,
        cacheDir: path.join(process.cwd(), '.cache'),
        build: {
            emptyOutDir: false,
            ssr: true,
            target: 'es6',
            rollupOptions: {
                input: path.resolve(root, 'entry-server.ts'),
                output: {
                    format: 'esm',
                    dir: path.resolve(root, 'dist', 'server'),
                },
            },
        },
    });

    await viteBuild({
        configFile: false,
        resolve: {
            mainFields: ['esnext', 'source-code', 'main', 'module'],
        },
        build: {
            target: ['node14'],
            emptyOutDir: false,
            lib: {
                entry: path.resolve(root, 'dist', 'server', 'entry-server.js'),
                fileName: 'entry-server',
                formats: ['cjs'],
            },
            minify: false,
            rollupOptions: {
                external: ['axios'],
                output: {
                    dir: path.resolve(root, 'dist', 'server'),
                },
            },
        },
    });

    fs.renameSync(
        path.resolve(root, 'dist', 'server', 'entry-server.cjs.js'),
        path.resolve(root, 'dist', 'server', 'entry-server.js'),
    );
}
