import { openDB, deleteDB } from 'idb/with-async-ittr.js';
// The 'id' property of the object will be the key.
const config = {
  version: 1,
  stores: {
    keyval: { key: 'keyval' },
    entities: { key: 'entities', index: 'domain' },
    lookups: { key: 'lookups' },
    types: { key: 'types' },
  },
};
let DB,
  dbName,
  stores = {};
const cached = new Map();

export async function open(name, version = config.version) {
  dbName = name;
  Object.entries(config.stores).forEach(([name, { key }]) => {
    cached.set(key, new Map());
    stores[name] = key;
  });

  DB = await openDB(name, version, {
    upgrade(db) {
      // Create a storets
      Object.values(config.stores).forEach(({ key, index }) => {
        const store = db.createObjectStore(key, {
          keyPath: 'id',
          // If it isn't explicitly set, create a value by auto incrementing.
          autoIncrement: true,
        });
        // Create an index on the 'date' property of the objects.
        if (index) store.createIndex(index, index);
      });
    },
  });
  await Promise.all([
    entityCache.clear(),
    typesCache.clear(),
    lookupsCache.clear(),
  ]);
  return DB;
}

export async function clear() {
  return deleteDB(dbName);
}

class KeyVal {
  constructor(name) {
    this.name = name;
  }
  async get(key) {
    return DB.get(this.name, key);
  }
  async getAll() {
    return DB.getAll(this.name);
  }
  async getSome(list) {
    return Promise.all(list.map((e) => DB.get(this.name, e)));
  }
  async set(key, val) {
    return DB.put(this.name, val); //, key
  }
  async setMany(items = []) {
    const tx = DB.transaction(this.name, 'readwrite'),
      reqs = items.map((item) => tx.store.put(item));
    reqs.push(tx.done);
    return Promise.all(reqs);
  }
  async del(key) {
    return DB.delete(this.name, key);
  }
  async clear() {
    return DB.clear(this.name);
  }
  async keys() {
    return DB.getAllKeys(this.name);
  }
}
export const keyval = new KeyVal(config.stores.keyval.key);
export const typesCache = new KeyVal(config.stores.types.key);
export const lookupsCache = new KeyVal(config.stores.lookups.key);

export const entityCache = {
  async getById(id, wrapped) {
    const res = await DB.get(stores.entities, id);
    return wrapped ? res : res?.item;
  },
  async getDomainItems(domain, wrapped) {
    const index = DB.transaction(
        stores.entities,
        'readonly'
      ).store.index(config.stores.entities.index),
      res = await index.getAll(domain);
    return wrapped ? res : res.map((e) => e?.item);
  },
  async clearDomain(domain) {
    const tx = DB.transaction(stores.entities, 'readwrite');
    const index = tx.store.index(config.stores.entities.index);

    for await (const cursor of index.iterate(domain)) {
      cursor.delete();
    }
    await tx.done;
    return true;
  },
  async addOne(item, type, domain, id) {
    // const dmn = cached.get(domain);
    // if (!(dmn || item.id)) return;
    // dmn.set(item.id, item);
    const val = { item, domain, id: id || item.id, type };
    return val.id
      ? DB.put(stores.entities, val)
      : Promise.resolve(false);
  },
  async addMany(items = [], domain) {
    const dmn = cached.get(domain);
    if (!dmn) return;
    const tx = DB.transaction(stores.entities, 'readwrite');
    return Promise.all([
      ...items.map((item) => {
        dmn.set(item.id, item);
        tx.store.put({ domain, item, id: item.id });
      }),
      tx.done,
    ]);
  },
  async deleteOne(id) {
    return DB.delete(stores.entities, id);
  },
  async markAsRemoved(id, domain, type) {
    if (!id) return;
    const wrapped = (await this.getById(id, true)) || {
      id,
      domain,
      type,
    };
    wrapped.removed = true;
    return DB.put(stores.entities, wrapped);
  },
  async clear() {
    DB.clear(stores.entities);
  },
};
