import OSS from 'ali-oss';
import logger from './logger';

interface IOssOptions {
    region: string;
    bucket: string;
    accessKeyId: string;
    accessKeySecret: string;
}

export default class Uploader {
    client: any;

    constructor(options: IOssOptions) {
        const requireParams = ['region', 'bucket', 'accessKeyId', 'accessKeySecret'];

        for (let i = 0; i < requireParams.length; i++) {
            const key = requireParams[i];
            if (!options[key]) {
                logger.error(`oss ${key} is required.`);
                process.exit(1);
            }
        }

        this.client = new OSS(options);
    }

    /**
     * @param  {String} key: 对象名
     * @param  {String} path: 上传对象绝对路径
     * @param  {Boolean} force: 是否覆盖上传（默认 false）
     */
    async uploadFile(key: string, path: string, force = false) {
        const uploadErrors = [];
        try {
            if (force) {
                // 主动抛错，全覆盖式上传
                await Promise.reject({ status: 10009 });
                return;
            }
            const result = await this.client.get(key);
            logger.warn(`✔ ${result.res.status} "${key}" already exists.`);
        } catch (err) {
            try {
                const result = await this.client.put(key, path);
                logger.done(`${result.res.status} "${key}" upload success!`);
            } catch (error) {
                uploadErrors.push({ [key]: path });
                logger.error(`${error.status || 10010} "${key}" upload error.`);
            }
        }

        return {
            error: !!uploadErrors.length,
            errorFiles: uploadErrors[0]
        };
    }

    /**
     * 批量资源上传
     * @param {Object} statics 待上传资源表 { key: value }
     * @param {Boolean} force 是否覆盖上传（默认 false）
     */
    async uploadFiles(statics: Record<string, string>, force = false) {
        const uploadErrors = [];

        for (const key in statics) {
            try {
                if (force) {
                    // 主动抛错，全覆盖式上传
                    await Promise.reject({ status: 10009 });
                    return;
                }
                const result = await this.client.get(key);
                logger.warn(`${result.res.status} "${key}" already exists.`);
            } catch (err) {
                try {
                    // if (`${statics[key]}`.indexOf(".tgz") >= 0) {
                    //     await Promise.reject({
                    //         status: 404
                    //     });
                    //     return
                    // }
                    // await Promise.resolve({
                    //     res: { status: 200 }
                    // });
                    // const result = await Promise.reject({
                    //     status: 404
                    // });
                    const result = await this.client.put(key, statics[key]);
                    logger.done(`${result.res.status} "${key}" upload success!`);
                } catch (error) {
                    uploadErrors.push({ [key]: statics[key] });
                    logger.error(`${error.status || 10010} "${key}" upload error.`);
                }
            }
        }

        return {
            error: !!uploadErrors.length,
            errorFiles: uploadErrors
        };
    }

    /**
     *
     * @param {String} objName
     * @param {String} localFile
     * @returns
     */
    async getFile(objName: string, localFile: string) {
        try {
            const result = await this.client.get(objName, localFile);

            return result;
        } catch (error) {
            logger.error(`${error.status} ${objName} 资源下载失败，请重试`);
            return error;
        }
    }

    /**
     * 删除资源
     * @param {Object} statics
     * @returns
     */
    async deleteFiles(statics: Record<string, string>) {
        const delErrors = [];

        for (const key in statics) {
            try {
                const result = await this.client.delete(key);
                logger.done(`✔ ${result.res.status} "${key}" deleted success.`);
            } catch (err) {
                delErrors.push({ [key]: statics[key] });
                logger.error(`${err.status} ${key} error.`);
            }
        }

        return {
            error: !!delErrors.length,
            errorFiles: delErrors
        };
    }

    /**
     * 查看文件列表
     * @param {Object} obj
     * @returns
     */
    async listFiles(obj = {}) {
        let params = obj || {};

        try {
            const result = await this.client.list(params);
            return result;
        } catch (err) {
            logger.error(`${err.name} 查看文件列表失败，请检查 OSS 配置。`);
            return err;
        }
    }
}
