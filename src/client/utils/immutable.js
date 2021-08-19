import { produce, setAutoFreeze, isDraft, original } from 'immer'; // var r1 = original(draft); var r2 = original(col)
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';

const { isArray, initial, isObject, getIn, setIn } = _;
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
          const col = getIn(draft, path) || [],
            ind = col.findIndex((e) => e.id === value || e === value),
            rem = col[ind];
          if (!rem) return;
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
          const mod = getIn(draft, path);
          back.value = isDraft(mod) ? original(mod) : mod;
          Object.assign(mod, value);
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
