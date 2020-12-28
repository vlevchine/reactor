const NodeCache = require('node-cache');
const p_storage = require('node-persist');

const d_ttl = 48 * 60 * 60 * 1000;
let storage;
const init = async (dir = './') => {
    storage = p_storage.create({
      dir,
      tringify: JSON.stringify,
      parse: JSON.parse,
      encoding: 'utf8',
      logging: false,
    });
    await storage.init();
  },
  set = async (key, val, { ns = 'na', ttl = d_ttl }) => {
    const id = `${ns}:${key}`;
    return storage.setItem(id, val, { ttl });
  },
  get = async (key, ns = 'na') => {
    const id = `${ns}:${key}`;
    return storage.getItem(id);
  },
  remove = async (key, ns = 'na') => {
    return storage.removeItem(`${ns}:${key}`);
  };

const cache = { init, set, get, remove };

class Cache {
  constructor(ttlSeconds) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
  }

  get(key, ns = 'na') {
    return this.cache.get(`${ns}:key`);
    // if (value) {
    //   return Promise.resolve(value);
    // }

    // return storeFunction().then((result) => {
    //   this.cache.set(key, result);
    //   return result;
    // });
  }
  set(value, key, ns = 'na') {
    return this.cache.set(`${ns}:key`, value);
  }

  del(keys) {
    this.cache.del(keys);
  }

  delStartWith(startStr = '') {
    if (!startStr) {
      return;
    }

    const keys = this.cache.keys();
    for (const key of keys) {
      if (key.indexOf(startStr) === 0) {
        this.del(key);
      }
    }
  }

  flush() {
    this.cache.flushAll();
  }
}

module.exports = { Cache, cache };
