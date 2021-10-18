import { produce, setAutoFreeze } from 'immer'; //, original, isDraft
import { patcher, applyPatches } from './immutable_patches';
// const { isArray, initial, last, isObject, getIn } = _,
//   o = original;

setAutoFreeze(false);

// action = {
//   reset: (value) => value,
//   remove: (model, path, value) => {
//     const back = { op: 'add' },
//       res = produce(model, (draft) => {
//         patcher.remove(draft, path, value);
//       });
//     return [res, { back }];
//   },
//   add: (model, path, value) => {
//     const back = { op: 'remove', value: value.id },
//       res = produce(model, (draft) => {
//         patcher.add(draft, path, value);
//       });
//     return [res, { back }];
//   },
//   move: (model, path, value) => {
//     const { from, to } = value,
//       res = produce(model, (draft) => {
//         const mod = getIn(draft, path),
//           src = getIn(mod, from.id),
//           tgt = getIn(mod, to.id),
//           items = src.splice(from.ind, 1);
//         tgt.splice(to.ind, 0, ...items);
//       });
//     return [res, { back: { to: from, from: to } }];
//   },
//   update: (model, path, value) => {
//     const back = {},
//       res = produce(model, (draft) => {
//         const ids = getPath(path),
//           mod = getIn(draft, path);
//         if (mod) {
//           Object.assign(mod, value);
//           back.value = isDraft(mod) ? o(mod) : mod;
//         } else {
//           const parent = getIn(draft, initial(ids));
//           if (parent) parent[last(ids)] = value;
//         }
//       });
//     return [res, { value, back }];
//   },
//   rename: (model, path, value) => {
//     const back = {},
//       res = produce(model, (draft) => {
//         const ids = getPath(path),
//           initials = initial(ids),
//           parent = getIn(draft, initials),
//           id = last(ids),
//           val = parent[id];
//         delete parent[id];
//         if (value) parent[value] = val;
//         back.value = id;
//         back.path = [...initials, value].join('.');
//       });
//     return [res, { value, back }];
//   },
//   edit: (model, path, value) => {
//     const ids = getPath(path),
//       source = getIn(model, initial(ids)),
//       tgtId = _.last(ids),
//       back = {
//         value: isArray(source)
//           ? source.find((e) => e.id === tgtId)
//           : source?.[tgtId],
//       };

//     const res = produce(model, (draft) => {
//       setIn(draft, path, value);
//     });
//     return [res, { back }];
//   },
// },
const process = (model, msg) => {
    const { op, path, value } = msg,
      oper = patcher[op];
    if (!oper) return [model];
    const back = {},
      res = produce(model, (draft) => {
        oper(draft, path, value);
      });

    return [res, { back, msg }];
  },
  moveInStack = (patches, cursor, backward) => {
    let pos = backward ? cursor - 1 : cursor + 1;
    if (pos < 0) pos = 0;
    if (pos >= patches.length) pos = patches.length - 1;
    return pos;
  },
  applyPatch = (model, patches, cursor, backward) => {
    const pos = moveInStack(patches, cursor, backward);
    if (pos === cursor) return [model, pos];
    const [newModel] = process(
      model,
      backward ? patches[cursor].back : patches[cursor].forth
    );
    return [newModel, pos];
  },
  compressPatches = (patches) => {
    return patches.map((e) => e.forth);
  };

export { process, applyPatches, applyPatch, compressPatches };
