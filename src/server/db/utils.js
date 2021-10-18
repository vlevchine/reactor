const _ = require('lodash'),
  { nanoid } = require('nanoid');

const getPath = (path) =>
    path ? (Array.isArray(path) ? path : path.split('.')) : [],
  drillIn = (obj, e) =>
    Array.isArray(obj)
      ? obj[e] || obj.find((t) => t.id === e || t === e)
      : obj?.[e],
  getIn = (obj = {}, path, exact) => {
    return path || !exact
      ? getPath(path).reduce((acc = {}, e) => {
          return drillIn(acc, e);
        }, obj)
      : undefined;
  },
  setIn = (obj = {}, path, value) => {
    const ids = getPath(path),
      source = _.initial(ids).reduce((acc, id) => {
        let val = drillIn(acc, id);
        if (!val) {
          if (_.isArray(acc)) {
            acc.push({ id });
          } else {
            acc[id] = Object.create(null);
          }
        }
        return drillIn(acc, id);
      }, obj);
    source[_.last(ids)] = value;
    return obj;
  };

//copied from client/utils/immutable
//until imports vs commonjs issue resolved
const patcher = {
    remove: (model, path, value) => {
      const toks = value.split('.'),
        pth = [
          ...(_.isArray(path) ? path : path.split('.')),
          ..._.initial(toks),
        ],
        col = getIn(model, pth),
        v = _.last(toks),
        ind = col.findIndex((e) => e.id === v || e === v),
        rem = col[ind];
      if (!rem) return;
      col.splice(ind, 1);
      return model;
    },
    add: (model, path, value) => {
      const pth = getPath(path);
      if (_.isObject(value) && !value.id) value.id = nanoid(10);
      const src = getIn(model, _.initial(pth)),
        last = _.last(pth);
      if (_.isArray(src[last])) {
        src[last].push(value);
      } else {
        src[last] = [value];
      }
      return model;
    },
    move: (model, path, value) => {
      const { from, to } = value,
        mod = getIn(model, path),
        src = getIn(mod, from.id),
        tgt = getIn(mod, to.id),
        items = src.splice(from.ind, 1);
      tgt.splice(to.ind, 0, ...items);
      return model;
    },
    rename: (model, path, value) => {
      if (!value) return model;
      const ids = getPath(path),
        initials = _.initial(ids),
        parent = getIn(model, initials),
        id = _.last(ids),
        val = parent[id];
      delete parent[id];
      parent[value] = val;
      return model;
    },
    edit: setIn,
    update: (model, path, value) => {
      const ids = getPath(path),
        mod = getIn(model, path);
      if (mod) {
        Object.assign(mod, value);
      } else {
        const parent = getIn(model, _.initial(ids));
        if (parent) parent[_.last(ids)] = value;
      }
      return model;
    },
  },
  applyPatches = (model, patches = []) => {
    return patches.reduce((acc, msg) => {
      const { op, path, value } = msg,
        oper = patcher[op];
      return oper ? oper(acc, path, value) : model;
    }, model);
  };

// const operations = {
//     update: (model, { path, value }) => {
//       const mod = getIn(model, path);
//       Object.assign(mod, value);
//     },
//     edit: (model, { path, value }) => {
//       return setIn(model, path, value);
//     },
//     remove: (model, { path, value }) => {
//       const col = getIn(model, path) || [],
//         ind = col.findIndex((e) => e.id === value || e === value);
//       if (col[ind]) col.splice(ind, 1);
//     },
//     add: (model, { path, value }) => {
//       const pth = getPath(path);
//       // if (_.isObject(value) && !value.id) value.id = nanoid(10);
//       const src = getIn(model, _.initial(pth)),
//         last = _.last(pth);
//       if (Array.isArray(src[last])) {
//         src[last].push(value);
//       } else {
//         src[last] = [value];
//       }
//     },
//     move: (model, { path, value }) => {
//       const { from, to } = value,
//         mod = getIn(model, path),
//         src = getIn(mod, from.id),
//         tgt = getIn(mod, to.id),
//         items = src.splice(from.ind, 1);
//       tgt.splice(to.ind, 0, ...items);
//     },
//   },
//   applyPatches = (item, patches = []) => {
//     patches.forEach((patch) => {
//       operations[patch.op](item, patch);
//     });
//   };

module.exports = { applyPatches };
