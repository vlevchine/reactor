import { _ } from '@app/helpers';
const nonNulls = (id = []) => {
  const ids = Array.isArray(id) ? id : [id];
  return ids.filter(Boolean);
};

let prefix = 'app';
//Sync operating on local storage
//saves per type, path - used to drill into saved object
const getStorage = (inSession) =>
    inSession ? window.sessionStorage : window.localStorage,
  getKey = (id) => {
    const ids = Array.isArray(id) ? [prefix, ...id] : [prefix, id];
    return nonNulls(ids).join(':');
  },
  cache = {
    init(id) {
      prefix = id;
    },
    get(type, inSession) {
      const storage = getStorage(inSession),
        key = getKey(type),
        item = storage.getItem(key);
      return JSON.parse(item);
    },
    has(type, inSession) {
      const storage = getStorage(inSession),
        key = getKey(type);
      return !!storage.getItem(key);
    },
    set(type, value, inSession) {
      const key = getKey(type),
        storage = getStorage(inSession);
      return _.isNil(value)
        ? storage.removeItem(key)
        : storage.setItem(key, JSON.stringify(value));
    },
    remove(type, inSession) {
      const storage = getStorage(inSession),
        key = getKey(type);
      storage.removeItem(key);
    },
    update(type, fn, inSession) {
      const storage = getStorage(inSession),
        key = getKey(type),
        item = storage.getItem(key);
      fn(item);
      storage.setItem(key, JSON.stringify(item));
    },
    clear: () => {
      getStorage(true).clear();
      getStorage().clear();
    },
  };

export default cache;
