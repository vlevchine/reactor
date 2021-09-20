import { produce, setAutoFreeze, isDraft, original } from 'immer'; // var r1 = original(draft); var r2 = original(col)
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';

const { isArray, initial, last, isObject, getIn, setIn } = _,
  o = original;
setAutoFreeze(false);
const getPath = (path) =>
    path ? (isArray(path) ? path : path.split('.')) : [],
  moveInStack = (patches, cursor, backward) => {
    let pos = backward ? cursor - 1 : cursor + 1;
    if (pos < 0) pos = 0;
    if (pos >= patches.length) pos = patches.length - 1;
    return pos;
  },
  immutable = {
    reset: (value) => value,
    remove: (model, msg) => {
      const back = { op: 'add' },
        { path, value } = msg,
        res = produce(model, (draft) => {
          const toks = value.split('.'),
            pth = [...path.split('.'), ...initial(toks)],
            col = getIn(draft, pth),
            v = last(toks),
            ind = col.findIndex((e) => e.id === v || e === v),
            rem = col[ind];
          if (!rem) return;
          if (rem.ref) msg.ref = rem.ref;
          back.value = isDraft(rem) ? original(rem) : rem;
          col.splice(ind, 1);
        });
      return [res, { back }];
    },
    add: (model, msg) => {
      const { path, value } = msg,
        pth = getPath(path);
      if (isObject(value) && !value.id) value.id = nanoid(10);
      const back = { op: 'remove', value: value.id },
        res = produce(model, (draft) => {
          const src = getIn(draft, initial(pth)),
            last = _.last(pth);
          if (isArray(src[last])) {
            src[last].push(value);
          } else {
            src[last] = [value];
          }
        });
      return [res, { back }];
    },
    move: (model, msg) => {
      const { path, value } = msg,
        { from, to } = value,
        res = produce(model, (draft) => {
          const mod = getIn(draft, path),
            src = getIn(mod, from.id),
            tgt = getIn(mod, to.id),
            items = src.splice(from.ind, 1);
          tgt.splice(to.ind, 0, ...items);
        });
      return [res, { back: { to: from, from: to } }];
    },
    update: (model, msg) => {
      const { path, value } = msg,
        back = {},
        res = produce(model, (draft) => {
          const ids = getPath(path),
            mod = getIn(draft, path);
          if (mod) {
            Object.assign(mod, value);
            back.value = isDraft(mod) ? o(mod) : mod;
          } else {
            const parent = getIn(draft, initial(ids));
            if (parent) parent[last(ids)] = value;
          }
        });
      return [res, { value, back }];
    },
    rename: (model, msg) => {
      const { path, value } = msg,
        back = {},
        res = produce(model, (draft) => {
          const ids = getPath(path),
            initials = initial(ids),
            parent = getIn(draft, initials),
            id = last(ids),
            val = parent[id];
          delete parent[id];
          if (value) parent[value] = val;
          back.value = id;
          back.path = [...initials, value].join('.');
        });
      return [res, { value, back }];
    },
    edit: (model, { path, value }) => {
      const ids = getPath(path),
        source = getIn(model, initial(ids)),
        tgtId = _.last(ids),
        back = {
          value: isArray(source)
            ? source.find((e) => e.id === tgtId)
            : source?.[tgtId],
        };

      const res = produce(model, (draft) => {
        setIn(draft, path, value);
      });
      return [res, { back }];
    },
  },
  process = (model, msg) => {
    const oper = immutable[msg.op];
    if (!oper) return [model];
    const res = oper(model, msg);
    Object.assign(res[1], msg);
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
