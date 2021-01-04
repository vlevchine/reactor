const path = require('path'),
  // cors = require('cors'),
  fs = require('fs'),
  https = require('https'),
  util = require('util'),
  { promisify } = require('util'),
  bcrypt = require('bcrypt'),
  jwt = require('jsonwebtoken'),
  { partition } = require('lodash');

const readF = promisify(fs.readFile),
  writeF = promisify(fs.writeFile),
  copyF = promisify(fs.copyFile);

const defText = 'no content!',
  getPath = (loc = []) =>
    Array.isArray(loc)
      ? path.join(__dirname, ...loc.filter((e) => !!e))
      : loc,
  readFile = async (...loc) => {
    const pth = path.resolve(...loc);
    return readF(pth, 'utf8');
  },
  writeFile = async (text = defText, ...loc) => {
    const pth = path.resolve(...loc);
    return writeF(pth, text, {
      encoding: 'utf8',
    });
  },
  writeJS = async (loc, obj = {}) => {
    const text = `const obj = ${util.inspect(obj, true, null)};
export default obj`;
    return writeFile(loc, text);
  },
  copyFile = async (from, to, name, toName) => {
    return copyF(
      getPath([from, name]),
      getPath([to, toName || name])
    );
  },
  requireFromString = (src, filename) => {
    var Module = module.constructor,
      m = new Module();
    try {
      m._compile(src, filename);
      return m.exports;
    } catch (err) {
      return {};
    }
  },
  getFilesFrom = async (loc, ext) => {
    const folder = path.resolve(...loc),
      names = getFileNamesFrom(loc, ext),
      files = await Promise.all(
        names.map((e) =>
          readFile(folder, `${e}.${ext}`).then((f) => [e, f])
        )
      );
    return Object.fromEntries(files);
    // if (err) reject(err);
  },
  getFileNamesFrom = (loc = [], ext) => {
    const folder = path.resolve(...loc),
      items = fs.readdirSync(folder);
    return items.reduce((acc, e) => {
      const tags = e.split('.'),
        last = tags.length - 1;
      if (tags[last] === ext) acc.push(tags.slice(0, last).join('.'));
      return acc;
    }, []);
  },
  createDir = async (...loc) => {
    const dir = path.resolve(...loc);
    return new Promise((resolve, reject) => {
      fs.mkdir(dir, (err) => {
        if (!err || err.code === 'EEXIST') resolve(dir);
        reject(err);
      });
    });
  },
  scanFolder = (name, root, parent = '') => {
    const fullName = path.join(root, parent, name),
      relativeName = path.join(parent, name),
      dirents = fs.readdirSync(fullName, { withFileTypes: true }),
      [dirs, files] = partition(dirents, (e) => e.isDirectory());

    return {
      name,
      relativeName,
      fullName,
      files: files.map((e) => e.name),
      folders: dirs.map((d) =>
        scanFolder(d.name, root, relativeName)
      ),
    };
  },
  generateHash = async (str, saltRounds = 10) => {
    return await bcrypt.hash(str, saltRounds);
  },
  generateHashSync = (str, saltRounds = 10) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(str, salt);
  },
  createToken = (val, secret, options = {}) => {
    options.algorithm = 'HS256';
    return jwt.sign(val, secret, options);
  },
  decodeToken = (token) => jwt.decode(token.replace('Bearer ', '')),
  verifyToken = async (tok, secret, ignoreExpiration) => {
    let res;
    try {
      res = jwt.verify(tok, secret, {
        algorithm: 'HS256',
        ignoreExpiration,
      });
    } catch (err) {
      res =
        err.name === 'JsonWebTokenError'
          ? { error: err.message }
          : { error: 'expired token', token: jwt.decode(tok) };
    }
    return res;
  },
  compareHash = (value, hash) => bcrypt.compare(value, hash);

const requestGet = (uri) => {
  return new Promise((resolve, reject) => {
    https
      .get(uri, (res) => {
        res.on('data', (d) => {
          resolve(d);
        });
      })
      .on('error', reject);
  });
};
module.exports = {
  getPath,
  readFile,
  writeFile,
  writeJS,
  copyFile,
  getFilesFrom,
  getFileNamesFrom,
  requireFromString,
  createDir,
  scanFolder,
  generateHash,
  generateHashSync,
  createToken,
  decodeToken,
  verifyToken,
  compareHash,
  requestGet,
};
