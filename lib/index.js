const path = require('path');
const Minio = require('minio');

/**
 * Returns the connection with a SFTP host.
 *
 * @param {string} endPoint
 * @param {string} accessKey
 * @param {string} secretKey
 * @param {string | number} port
 * @param {string | boolean} useSSL
 * @returns {Promise}
 */
const getConnection = ({ endPoint, accessKey, secretKey, port = 80, useSSL = true }) => {
  return minioClient = new Minio.Client({
    endPoint,
    port,
    useSSL,
    accessKey,
    secretKey,
  });
};


module.exports = {
  init: config => {
    const { bucketName, baseUrl } = config;
    const minio = getConnection(config);

    return {
      upload: async (file) => {
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
        file.url = baseUrl ? `${baseUrl}?hash=${file.public_id}` : `${minio.protocol}//${minio.host}:${minio.port}/${config.bucket}/${file.public_id}`;
        /* eslint-disable no-param-reassign */

        return file;
      },
      delete: async (file) => {

        try {
          await minio.removeObject(bucketName, file.public_id);
        } catch (err) {
          throw err;
        }

        await sftp.end();

        return file;
      },
    };
  },
};
