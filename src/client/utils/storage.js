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
      const store = getStorage(inSession),
        key = getKey(type),
        item = store.getItem(key);
      return JSON.parse(item);
    },
    set: (inSession, type, value) => {
      const key = getKey(type),
        store = getStorage(inSession);
      return value
        ? store.setItem(key, JSON.stringify(value))
        : store.removeItem(key);
    },
    clear: () => {
      getStorage(true).clear();
      getStorage().clear();
    },
  };
export default cache;
