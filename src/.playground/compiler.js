const path = require('path'),
  {
    getPath,
    readFile,
    writeFile,
    createDir,
    scanFolder,
  } = appRequire('utils'),
  { partition } = require('lodash');

const cssFileName = 'styles.css',
  readTemplates = async (templateDir) => {
    var [js, jsItem, jsAddItem, container, css] = await Promise.all(
      [
        'page.js',
        'page_item.js',
        'page_add_item.js',
        'page_container.js',
        'page.css',
      ].map((e) => readFile([templateDir, e]))
    );
    return { page: { js, jsItem, jsAddItem, container, css } };
  };

let templates = {};
const init = async (templateDir = './templates') => {
  templates = await readTemplates(templateDir);
};

const pageFiles = ['js', 'css'],
  addFile = async (dir, name, text, files) => {
    return files.includes(name)
      ? Promise.resolve(false)
      : writeFile(`${dir}\\${name}`, text, { skip: true });
  },
  addPageComponent = async (dir, def, files) => {
    const { id, pages, component, key } = def,
      name = `${key}.js`,
      text = id
        ? templates.page.jsItem
            .replace(/T_Page/g, component)
            .replace(/_id/g, `${key}Id`)
        : id === 0
        ? templates.page.jsAddItem.replace(/T_Page/g, component)
        : templates.page[pages ? 'container' : 'js'].replace(
            /T_Page/g,
            component
          );
    return addFile(dir, name, text, files);
  },
  addPageFile = async (def, path, rel) => {
    const { id, component, items } = def,
      name = `${path}\\${id}.js`,
      text =
        component && items
          ? templates.page.container
          : templates.page.jsItem
              .replace(/T_Page/g, component)
              .replace(/_id/g, `${id}Id`)
              .replace(/T_depth/g, rel);

    return writeFile(name, text, { skip: true });
  },
  fileOrFolder = (items = []) => {
    const files = items.filter((e) => e.component),
      folders = items.filter((e) => e.items);
    return { files, folders };
  },
  addImportFromFolder = (imports, path, items = []) => {
    const { files, folders } = fileOrFolder(items);
    files.forEach(({ id, component }) => {
      if (component)
        imports.push(
          `export { default as ${component} } from '${path}/${id}';`
        );
    });
    folders.forEach((e) =>
      addImportFromFolder(
        imports,
        `${path}/${e.component ? '_' : ''}${e.id}`,
        e.items
      )
    );
    return imports;
  },
  addIndexFile = async (pages = [], pth) => {
    const imports = addImportFromFolder([], '.', pages),
      txt = imports.join('\n');
    //  +
    // '\n\n' +
    // `export default {${col.names.join(', ')}};`;
    return writeFile(path.join(pth, 'index.js'), txt);
  },
  processFolder = async (pages = [], folder = {}, rel) => {
    const { files, folders } = fileOrFolder(pages);
    await Promise.all(
      files.map(async (f) => {
        const nm = [f.id, 'js'].join('.');
        fl = folder.files.find((e) => e === nm);
        return fl
          ? Promise.resolve(false)
          : addPageFile(f, folder.fullName, rel);
      })
    );
    await folders.map(async (f) => {
      let name = f.component ? '_' + f.id : f.id,
        fld = folder.folders.find((e) => e.name === name);
      if (!fld) {
        fld = {
          name,
          fullName: [folder.fullName, name].join('\\'),
          files: [],
          folders: [],
        };
        await createDir(fld.fullName);
      }
      const rl = rel === '.' ? '..' : '../' + rel;
      return processFolder(f.items, fld, rl);
    });
  },
  processConfig = async (model = {}, options = {}) => {
    const path = options.root,
      name = getPath([path]),
      appRoot = { ...(await scanFolder(name)), name },
      pages = [
        { id: 'misc', items: model.miscPages },
        ...model.pages,
      ];
    await Promise.all([
      addIndexFile(pages, name),
      processFolder(pages, appRoot, '.'),
    ]);
    return;
  };

module.exports = { processConfig, init };
