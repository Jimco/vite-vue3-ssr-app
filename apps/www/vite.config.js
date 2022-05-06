import path from 'path';
import { defineConfig } from 'vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vuePlugin from '@vitejs/plugin-vue';
import ssrPlugin from '@zqd/naco/src/plugin';
// import { ViteEnvPlugin } from '@zqd/vite-plugin-env';
// import styleImport from 'vite-plugin-style-import';

export default defineConfig((env) => ({
    base: env.command === 'build' ? 'https://static.zqianduan.com/vite-ssr/www/' : '/',

    define: {
        'process.env.NODE_ENV': JSON.stringify(
            env.command === 'build' ? 'production' : 'development',
        ),
        'process.env.BUILD_TIMESTAMP': Date.now(),
    },

    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },

    plugins: [
        // styleImport({
        //     libs: [
        //         {
        //             libraryName: '@gaoding/gd-antd-plus',
        //             esModule: true,
        //             resolveStyle: (name) => {
        //                 return `@gaoding/gd-antd-plus/lib/${name}/style/index.css`;
        //             },
        //         },
        //     ],
        // }),
        // ViteEnvPlugin(),
        ssrPlugin,
        vuePlugin({ include: [/\.(vue|tsx|md)/] }),
        vueJsx(),
        {
            name: 'virtual',
            resolveId(id) {
                if (id === '@foo') {
                    return id
                }
            },
            load(id) {
                if (id === '@foo') {
                    return `export default { msg: 'hi' }`
                }
            }
        },
    ],

    resolve: {
        mainFields: ['esnext', 'source-code', 'module', 'main'],
        alias: {
            '/@': path.resolve(__dirname, 'src'),
        },
    },
}));
