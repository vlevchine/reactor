import { produce } from 'immer'; //, original
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';

const getPath = (path) =>
    path ? (_.isArray(path) ? path : path.split('.')) : [],
  moveInStack = (patches, cursor, backward) => {
    let pos = backward ? cursor - 1 : cursor + 1;
    if (pos < 0) pos = 0;
    if (pos >= patches.length) pos = patches.length - 1;
    return pos;
  },
  addProducer = produce((draft, path, value) => {
    let col = _.getIn(draft, path);
    if (!value.id) value.id = nanoid(10);
    if (col) {
      //col.unshift(value);
      col.push(value);
    } else {
      _.setIn(draft, path, [value]);
    }
  }),
  removeProducer = produce((draft, path, value, back) => {
    const col = _.getIn(draft, path) || [],
      ind = col.findIndex((e) => e.id === value || e === value);
    Object.assign(back, col[ind]);
    col.splice(ind, 1);
  }),
  moveProducer = produce((draft, path, value, back) => {
    //from/to in format {value,path}, value is index
    const { from, to } = value,
      model = _.getIn(draft, path),
      src = _.getIn(model, from.path),
      tgt = _.getIn(model, to.path);

    const items = from.ind
      .sort()
      .map((ind, i) => src.splice(ind - i, 1));

    tgt.splice(to.pos, 0, ...items.flat());
    back.from = to;
    back.to = from;
  }),
  updateProducer = produce((draft, path, value, back) => {
    const mod = _.getIn(draft, path);
    Object.assign(back, mod);
    Object.assign(mod, value);
  }),
  editProducer = produce((draft, path, value, back) => {
    const ids = getPath(path),
      source = _.getIn(draft, _.initial(ids)),
      tgtId = _.last(ids);
    back[tgtId] = _.isArray(source)
      ? source.find((e) => e.id === tgtId)
      : source?.[tgtId];
    _.setIn(draft, path, value);
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
