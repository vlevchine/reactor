import { _ } from '@app/helpers';
import cache from '@app/utils/storage';

const storagePath = 'formit',
  cacheName = (name) => [storagePath, name];
//Tracks changes for the Form between resets,
//i.e.changes are cleared at reset (on save)
//TBD: cache in/retrieve from local storage? indexedDB?
export class History {
  constructor(type, id) {
    this.type = type;
    this.id = id;
    this.changes = [];
    this.deps = new Map();
  } //'T_Template', id, 'tasks'
  addDependent(type, id, prop) {
    const hist = new History(type, id);
    if (!this.deps.has(prop)) this.deps.set(prop, new Map());
    this.deps.get(prop).set(id, hist);
    return hist;
  }
  removeDependent(id, prop) {
    const dep = this.deps.get(prop),
      item = dep?.get(id);
    if (item) {
      this.changes.length = 0;
      dep.delete(id);
      if (!dep.size) this.deps.delete(prop);
    }
    return item.type;
  }
  hasChildren(prop) {
    return prop ? this.deps.has(prop) : this.deps.size > 0;
  }
  addChange(msg, item) {
    const { op, path } = msg;
    if (op === 'add' && !msg.id) {
      const wrapper = _.getIn(item, path);
      msg.id = _.last(wrapper)?.id;
    }
    this.changes.push(msg);
    const id = msg.id;
    if (op === 'remove') {
      const type = this.removeDependent(id, path);
      if (!this.changes.find((c) => c.id === id && c.op === 'add')) {
        this.addDependent(type, id, path).addChange({
          op: 'remove',
          id,
        });
      }
    }
  }
  getAll() {
    return [
      this,
      ...this.deps
        .values()
        .map((e) => e.values())
        .flat(),
    ];
  }
  getChanges() {
    return this.getAll()
      .filter((e) => e.changes.length)
      .map((e) => e.getOwnChanges());
  }
  getOwnChanges() {
    return _.pick(this, ['id', 'type', 'changes']);
  }
  hasChanges() {
    return this.getAll().some((e) => e.hasOwnChanges());
  }
  hasOwnChanges() {
    return this.changes.length > 0;
  }
  reset() {
    this.changes.length = 0;
    this.deps.clear();
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
}

let active;
const forms = new Map(),
  addForm = (type, id) => {
    const hist = new History(type, id);
    forms.set(id, hist);
    return hist;
  };
const formHistory = {
  create(type, id, prop) {
    const hist =
      active && prop
        ? forms.get(active)?.addDependent(type, id, prop)
        : addForm(type, id);
    return hist;
  },
  activate(id) {
    active = id;
  },
  deactivate(id) {
    if (id === active) active = undefined;
  },
  resetStatus(id, activ, parent) {
    if (parent) return;
    if (activ) {
      active = id;
    } else if (activ === false && active === id) active = undefined;
  },
};
export default formHistory;
