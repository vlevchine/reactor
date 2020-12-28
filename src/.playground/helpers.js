const path = require('path'),
  cors = require('cors'),
  fs = require('fs'),
  { partition } = require('lodash');

const defText = (text = 'no content!'),
  getPath = (loc = []) =>
    Array.isArray(loc) ? path.join(__dirname, ...loc) : loc,
  readFile = async (loc = []) =>
    new Promise((resolve, reject) => {
      fs.readFile(getPath(loc), 'utf8', (err, content) => {
        if (err) reject(err);
        resolve(content);
      });
    }),
  writeFile = async (loc = [], text = defText, options = {}) => {
    //skip: - falsy to overwrite file
    const location = getPath(loc);
    return new Promise((resolve, reject) => {
      fs.writeFile(
        location,
        text,
        { encoding: 'utf8', flag: options.skip ? 'wx' : 'w' },
        (err) => {
          if (err) reject(err);
          resolve(text);
        }
      );
    });
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
  getFilesFrom = async (loc = [], ext) => {
    const folder = getPath(loc);
    return new Promise((resolve, reject) => {
      fs.readdir(folder, (err, items = []) => {
        if (err) reject(err);
        const names = items.filter((e) => {
          const tags = e.split('.');
          return tags[1] === ext;
        });

        Promise.all(names.map((e) => readFile([...loc, e]))).then(
          (files) => {
            resolve(
              files.reduce(
                (acc, e, i) => ({
                  ...acc,
                  [names[i].split('.')[0]]: e,
                }),
                {}
              )
            );
          }
        );
      });
    });
  },
  getFileNamesFrom = async (loc = [], ext) => {
    const folder = getPath(loc);
    return new Promise((resolve, reject) => {
      fs.readdir(folder, (err, items = []) => {
        if (err) reject(err);
        const names = items
          .map((e) => e.split('.'))
          .filter((tags) => tags[1] === ext);

        return resolve(names.map((e) => e[0]));
      });
    });
  },
  ext = ['js', 'css', 'json'],
  findInDir = (loc = [], files) => {
    return new Promise((resolve, reject) => {
      fs.readdir(getPath(loc), (err, items) => {
        if (err) reject(err);
        const folders = items.filter((e) => {
          const tags = e.split('.'),
            use = tags.length === 1 || !ext.includes(tags[1]);
          return files ? !use : use;
        });
        resolve(folders);
      });
    });
  },
  createDir = async (loc = []) => {
    const dir = getPath(loc);
    return new Promise((resolve, reject) => {
      fs.mkdir(dir, (err) => {
        if (!err || err.code === 'EEXIST') resolve(dir);
        reject(err);
      });
    });
  },
  readdir = async (dir, options = {}) =>
    new Promise((resolve, reject) => {
      fs.readdir(dir, options, (err, files) => {
        if (err) reject(err);
        resolve(files);
      });
    }),
  scanFolder = async (loc, name = '') => {
    const parts = name.split('//');
    const dir = path.resolve(loc, name),
      dirents = await readdir(dir, { withFileTypes: true }),
      [dirs, files] = partition(dirents, (e) => e.isDirectory()),
      folders = await Promise.all(
        dirs.map((d) => scanFolder(dir, d.name))
      );

    return {
      name,
      fullName: path.join(loc, name),
      files: files.map((e) => e.name),
      folders,
    };
  };

module.exports = {
  getPath,
  readFile,
  writeFile,
  getFilesFrom,
  getFileNamesFrom,
  requireFromString,
  findInDir,
  createDir,
  scanFolder,
};
