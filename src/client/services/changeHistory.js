import { _ } from '@app/helpers';
import cache from '@app/utils/storage';

const storagePath = 'formit',
  cacheName = (name) => [storagePath, name];
//Tracks changes for the Form between resets,
//i.e.changes are cleared at reset (on save)
//TBD: cache in/retrieve from local storage? indexedDB?
export class History {
  constructor(type, id, prop, relType) {
    this.type = type;
    this.id = id;
    this.changes = [];
    this.deps = {};
    if (prop && relType)
      this.deps[prop] = {
        type: relType,
        items: new Map(),
      };
    this.added = new Map();
    this.removed = new Map();
  } //'T_Template', id, 'tasks'
  addDependent(prop, id, type) {
    const hist = new History(type, id);
    if (!this.deps[prop] && type)
      this.deps[prop] = {
        type: type,
        items: new Map(),
      };
    this.deps[prop].items.set(id, hist);
    return hist;
  }
  removeDependent(prop, id) {
    const depGroup = this.deps[prop],
      item = depGroup?.items.get(id);
    if (item) {
      item.reset();
      depGroup.items.delete(id);
      if (!depGroup.items.size) this.deps[prop] = undefined;
    }
    return depGroup?.type;
  }
  hasChildren(prop) {
    return prop
      ? this.deps[prop]?.items.has(prop)
      : Object.keys(this.deps) > 0;
  }
  addChange(msg) {
    const { op, ref, path } = msg;
    // if (op === 'add' && !id) {
    //   msg.id = msg.value.id; // _.last(_.getIn(model, msg.path))?.id;
    // }
    this.changes.push(msg);
    if (op === 'remove' && ref) {
      removeItem(this.deps[path].type, ref);
      // const type = this.removeDependent(id, path);
      // if (!this.changes.find((c) => c.id === id && c.op === 'add')) {
      //   this.addDependent(type, id, path).addChange({
      //     op: 'remove',
      //     id,
      //   });
      // }
    }
  }
  getAll() {
    const dependencies = Object.values(this.deps).map((d) => [
      ...d.items.values(),
    ]);
    return [this, ...dependencies.flat()];
  }
  getChanges(withDeps) {
    return withDeps
      ? this.getAll()
          .filter((e) => e.changes.length)
          .map((e) => e.getOwnChanges())
      : this.getOwnChanges();
  }
  hasChanges(withDeps) {
    return withDeps
      ? this.getAll().some((e) => e.hasOwnChanges())
      : this.hasOwnChanges();
  }
  getOwnChanges() {
    const res = _.pick(this, ['id', 'type']);
    res.changes = this.changes.map((e) => e.msg || e);
    return res;
  }
  hasOwnChanges() {
    return this.changes.length > 0;
  }
  reset(withDeps) {
    this.changes.length = 0;
    if (withDeps)
      Object.values(this.deps).forEach((d) => d.items.clear());
  }
  toCache() {
    cache.set(cacheName(this.id), {
      type: this.type,
      id: this.id,
      changes: this.changes,
    });
  }
  fromCache(id) {
    const cached = cache.get(cacheName(id)),
      { type, changes } = cached;
    this.type = type;
    this.id = id;
    this.changes = changes;
  }
  addItem(type, id) {
    this.added.set(id, { type, add: true });
  }
  removeItem(type, id) {
    const item = this.added.get(id);
    if (item) {
      item.add = false;
    } else this.removed.set(id, type);
  }
  getDependencies() {
    return { added: this.added, removed: this.removed };
  }
  clearDependencies() {
    this.added.clear();
    this.removed.clear();
  }
  markAsRemoved(items = [], type) {
    items.forEach((e) => this.removed.set(e, type));
  }
}

const historyItems = new Map(),
  getItemHistory = (id) => historyItems.get(id),
  clearHistory = (id) => historyItems.delete(id),
  removeItem = (depends, type, id) => {
    const src = getItemHistory(depends);
    src?.removeItem(type, id);
  },
  addItem = (depends, type, id) => {
    const src = getItemHistory(depends);
    src?.addItem(type, id);
  },
  getAllChanges = () => {
    return [...historyItems.values()].map((e) => e.getOwnChanges());
  };

export {
  removeItem,
  addItem,
  getItemHistory,
  clearHistory,
  getAllChanges,
};
export default function formHistory(type, id, relationship = {}) {
  const { prop, type: relType } = relationship;
  let hist = getItemHistory(id);
  if (!hist) {
    hist =
      // parentId && parentProp  , parentProp, parentId
      //   ? getItemHistory(parentId)?.addDependent(parentProp, id, type) :
      new History(type, id, prop, relType);
    historyItems.set(id, hist);
  }
  return hist;
}
