const Minio = require('minio');
const _ = require('lodash');

module.exports = {
  init: config => {
    const { bucket, customUrlCb, endPoint = '' } = config;
    const matched = endPoint.match(/((?<protocol>.*?):\/\/){0,1}(?<host>.*?):(?<port>\d+){0,1}/);
    const groups = _.get(matched, 'groups', {});
    let { protocol, host, port } = groups;
    let useSSL;
    protocol = protocol || 'http';
    port = Number(port || (protocol === 'https' ? 443 : 80));
    useSSL = protocol === 'https';

    const minio = new Minio.Client({
      endPoint: host,
      port: port,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      useSSL: useSSL,
      region: config.region || undefined,
      transport: config.transport || undefined,
      sessionToken: config.sessionToken || undefined,
      partSize: config.partSize || undefined,
      pathStyle: config.pathStyle || undefined,
    });

    return {
      get: async (fileName) => {
        return minio.getObject(bucket, fileName);
      },
      upload: async (file) => {
        const path = file.path ? `${file.path}/` : '';

        file.public_id = `${path}${file.hash}${file.ext}`;
        try {
          await minio.putObject(bucket, file.public_id, file.buffer, {
            'Content-Type': file.mime,
          });
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
