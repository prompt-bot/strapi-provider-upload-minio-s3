const path = require('path');
const Minio = require('minio');

module.exports = {
  init: config => {
    const { bucket, customUrlCb } = config;
    const minio = new Minio.Client({
      endPoint: config.endPoint,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      useSSL: config.useSSL || undefined,
      port: config.endPort || undefined,
      region: config.region || undefined,
      transport: config.transport || undefined,
      sessionToken: config.sessionToken || undefined,
      partSize: config.partSize || undefined,
      pathStyle: config.pathStyle || undefined,
    })

    return {
      get: async (fileName) => {
        return minio.getObject(bucket, fileName);
      },
      upload: async (file) => {
        console.log(minio)
        const path = file.path ? `${file.path}/` : '';

        file.public_id = `${path}${file.hash}${file.ext}`;
        try {
          await minio.putObject(bucket, file.public_id, file.buffer, {
            'Content-Type': file.mime,
          })
        } catch (err) {
          throw err;
        }

        /* eslint-enable no-param-reassign */
        if (customUrlCb) {
          file.url = customUrlCb(file, minio);
        } else {
          file.url = config.pathStyle ? `${minio.protocol}//${minio.host}:${minio.port}/${bucket}/${file.public_id}` : `${minio.protocol}//${bucket}.${minio.host}:${minio.port}/${file.public_id}`;
        }
        /* eslint-disable no-param-reassign */

        return file;
      },
      delete: async (file) => {
        const path = file.path ? `${file.path}/` : '';

        file.public_id = `${path}${file.hash}${file.ext}`;
        try {
          await minio.removeObject(bucket, file.public_id);
        } catch (err) {
          throw err;
        }
        return file;
      },
    };
  },
};
