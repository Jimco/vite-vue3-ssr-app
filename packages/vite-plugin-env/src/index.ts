import fs from 'fs';
import path from 'path';
import { Plugin } from 'vite';

export function ViteEnvPlugin(): Plugin {
    return {
        name: 'vite:env',
        config(config) {
            if (!config.define) {
                config.define = {};
            }

            const envPath = path.resolve(config.root || process.cwd(), 'env.ts');
            if (fs.statSync(envPath).isFile()) {
                const env = require(envPath).default ?? require(envPath);

                Object.entries(env).forEach(([k, v]) => {
                    config.define![`import.meta.env.${k}`] = JSON.stringify(v);
                });
            }
            return config;
        },
    };
}
