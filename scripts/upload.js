const path = require('path');
const fg = require('fast-glob');
const uploader = require('./alioss');
const logger = require('./logger');

async function upload() {
    const apps = ['www', 'admin'];
    const statics = {};

    apps.forEach((app) => {
        const assets = fg.sync(`../apps/${app}/dist/client/assets/*`, {
            deep: 1,
            cwd: __dirname,
            absolute: true,
        });

        assets.forEach((p) => {
            const name = path.basename(p);
            statics[`vite-ssr/${app}/assets/${name}`] = p;
        });
    });

    if (!Object.keys(statics).length) {
        logger.error(`Assets is Empty.`);
        process.exitCode = 1;
    }

    const result = await uploader.uploadFiles(statics);

    if (result.error) {
        logger.error(`Failed to upload some resources:\n${result.errorFiles.join('\n')}`);
        process.exitCode = 1;
    }

    logger.success('All resources are uploaded!');
    process.exitCode = 0;
}

upload();
