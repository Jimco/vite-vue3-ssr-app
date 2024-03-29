import path from 'path';
import fg from 'fast-glob';
import dotenv from 'dotenv';
import logger from './logger';
import Uploader from './alioss';

// 从执行根目录读取 .env 中的 OSS 配置
dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
});

const uploader = new Uploader({
    region: process.env.OSS_REGION,
    bucket: process.env.OSS_BUCKET,
    accessKeyId: process.env.OSS_ACCESS_ID,
    accessKeySecret: process.env.OSS_ACCESS_SECRET,
});

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
        process.exit(1);
    }

    const result = await uploader.uploadFiles(statics);

    if (result && result.error) {
        logger.error(`Failed to upload some resources.`);
        process.exit(1);
    }

    logger.success('All resources are uploaded!');
    process.exit(0);
}

upload();
