import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';

const getPath = (path) =>
    path ? (_.isArray(path) ? path : path.split('.')) : [],
  { getIn, setIn } = _;
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

export { patcher, applyPatches };
