export { hex_sha1 } from './hex_sha1';

const fs = require('fs');
const currPath = process.cwd();

const writeFileRecursive = function(path, buffer, callback) {
  const lastPath = path.substring(0, path.lastIndexOf('/'));
  fs.mkdir(lastPath, { recursive: true }, err => {
    if (err) return callback(err);
    fs.writeFile(path, buffer, function(err) {
      if (err) return callback(err);
      return callback(null);
    });
  });
};

export const readGlobalConfig = callback => {
  const path = `${currPath}/globalconfig/config.json`;
  fs.readFile(path, function(err, data) {
    if (err) {
      writeFileRecursive(
        path,
        JSON.stringify({
          ip: '172.168.201.90',
          port: '19090',
        }),
        function(err) {
          if (!err) {
            callback && callback('172.168.201.90', '19090');
          }
        }
      );
    } else {
      const { ip, port } = JSON.parse(data.toString());
      callback(ip, port);
    }
  });
};

export const writeGlobalConfig = content => {
  const path = `${currPath}/globalconfig/config.json`;
  fs.readFile(path, function(err, data) {
    if (!err) {
      const config = JSON.parse(data.toString());
      fs.writeFile(
        path,
        JSON.stringify({
          ...config,
          ...content,
        }),
        function() {}
      );
    }
  });
};
