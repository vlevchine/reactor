import { last, initial, isArray } from 'lodash';
import produce from 'immer';
import { moveItem } from '@app/helpers';

const getPath = (path = '') =>
    isArray(path) ? path : path.split('.'),
  drillIn = (obj, e) =>
    isArray(obj) ? obj.find((t) => t.id === e || t === e) : obj?.[e],
  getIn = (obj = {}, path = '') =>
    getPath(path).reduce((acc = {}, e) => drillIn(acc, e), obj),
  setIn = (obj = {}, path, value) => {
    const ids = getPath(path),
      source = initial(ids).reduce((acc, id) => {
        let val = drillIn(acc, id);
        if (!val) {
          if (isArray(acc)) {
            acc.push({ id });
          } else {
            acc[id] = Object.create(null);
          }
        }
        return drillIn(acc, id);
      }, obj);
    source[last(ids)] = value;
  },
  moveInStack = (patches, cursor, backward) => {
    let pos = backward ? cursor - 1 : cursor + 1;
    if (pos < 0) pos = 0;
    if (pos >= patches.length) pos = patches.length - 1;
    return pos;
  },
  addProducer = produce((draft, path, value) => {
    let col = getIn(draft, path);
    if (col) {
      col.push(value);
    } else {
      setIn(draft, path, [value]);
    }
  }),
  removeProducer = produce((draft, path, value, back) => {
    const col = getIn(draft, path) || [],
      ind = col.findIndex((e) => e.id === value || e === value);
    Object.assign(back, col[ind]);
    col.splice(ind, 1);
  }),
  moveProducer = produce((draft, path, value, back) => {
    const { from, to } = value,
      col = getIn(draft, path) || [];
    back.from = value.to;
    back.to = value.from;
    moveItem(col, from, to, true); //keeps the same array
  }),
  updateProducer = produce((draft, path, value, back) => {
    const mod = getIn(draft, path);
    Object.assign(back, mod);
    Object.assign(mod, value);
  }),
  editProducer = produce((draft, path, value, back) => {
    const ids = getPath(path),
      source = getIn(draft, initial(ids)),
      tgtId = last(ids);
    back[tgtId] = source?.[tgtId];
    setIn(draft, path, value);
  }),
  immutable = {
    reset: (value) => value,
    remove: (model, path, value) => {
      let back = {};
      return [
        removeProducer(model, path, value, back),
        {
          back: { op: 'add', path, value: back },
          forth: { op: 'remove', path, value },
        },
      ];
    },
    move: (model, path, value) => {
      let back = {};
      return [
        moveProducer(model, path, value, back),
        {
          back: { op: 'move', path, value: back },
          forth: { op: 'move', path, value },
        },
      ];
    },
    add: produce((model, path, value) => {
      return [
        addProducer(model, path, value),
        {
          back: { op: 'remove', path, value: value.id },
          forth: { op: 'add', path, value },
        },
      ];
    }),
    update: (model, path, value) => {
      let back = {};
      return [
        updateProducer(model, path, value, back),
        {
          back: { op: 'update', path, value: back },
          forth: { op: 'update', path, value },
        },
      ];
    },
    edit: (model, path, value) => {
      let back = {};
      return [
        editProducer(model, path, value, back),
        {
          back: { op: 'edit', path, value: back },
          forth: { op: 'edit', path, value },
        },
      ];
    },
  },
  process = (model, msg) => {
    const { op = 'edit', path, value } = msg,
      oper = immutable[op];
    if (!oper) throw new Error('Unexpected operation!');
    const res = oper(model, path, value);
    return res;
  },
  applyPatch = (model, patches, cursor, backward) => {
    const pos = moveInStack(patches, cursor, backward);
    if (pos === cursor) return [model, pos];
    const [newModel] = immutable.process(
      model,
      backward ? patches[cursor].back : patches[cursor].forth
    );
    return [newModel, pos];
  },
  compressPatches = (patches) => {
    return patches.map((e) => e.forth);
  };

export { process, applyPatch, compressPatches };
