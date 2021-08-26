const path = require('path');
const Minio = require('minio');

module.exports = {
  init: config => {
    const { bucketName, customUrlCb } = config;
    const minio = new Minio.Client(config)

    return {
      get: async (fileName) => {
        return minio.getObject(bucketName, fileName);
      },
      upload: async (file) => {
        console.log(minio)
        const path = file.path ? `${file.path}/` : '';

        file.public_id = `${path}${file.hash}${file.ext}`;
        try {
          await minio.putObject(bucketName, file.public_id, file.buffer, {
            'Content-Type': file.mime,
          })
        } catch (err) {
          throw err;
        }

        /* eslint-enable no-param-reassign */
        if (customUrlCb) {
          file.url = customUrlCb(file, minio);
        } else {
          file.url = config.pathStyle ? `${minio.protocol}//${minio.host}:${minio.port}/${bucketName}/${file.public_id}` : `${minio.protocol}//${bucketName}.${minio.host}:${minio.port}/${file.public_id}`;
        }
        /* eslint-disable no-param-reassign */

        return file;
      },
      delete: async (file) => {
        const path = file.path ? `${file.path}/` : '';

        file.public_id = `${path}${file.hash}${file.ext}`;
        try {
          await minio.removeObject(bucketName, file.public_id);
        } catch (err) {
          throw err;
        }
        return file;
      },
    };
  },
};
