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
    return nonNulls(ids).join('_');
  },
  cache = {
    init: (id) => {
      prefix = id;
    },
    get: (inSession, type) => {
      const storage = getStorage(inSession),
        key = getKey(type),
        item = storage.getItem(key);
      return JSON.parse(item);
    },
    set: (inSession, type, value) => {
      const key = getKey(type),
        storage = getStorage(inSession);
      return value
        ? storage.setItem(key, JSON.stringify(value))
        : storage.removeItem(key);
    },
    clear: () => {
      getStorage(true).clear();
      getStorage().clear();
    },
  };
export default cache;
