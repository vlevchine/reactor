const stores = ['keyval', 'lookups', 'types', 'entities'];
const handler = {
  get(target, prop) {
    if (target.storeNames().includes(prop)) target.store = prop;
    return target;
  },
};
async function openDB(name, version = 1) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onsuccess = function (ev) {
      // Equal to: db = req.result;
      const dbRef = DB(ev.target.result),
        db = new Proxy(dbRef, handler);
      resolve(db);
    };
    req.onerror = function (ev) {
      reject(ev.target.errorCode);
    };
    req.onupgradeneeded = function (ev) {
      const _db = ev.currentTarget.result,
        names = _db.objectStoreNames;
      stores
        .filter((e) => !names.contains(e))
        .forEach((e) => {
          _db.createObjectStore(e, {
            keyPath: 'id', //autoIncrement: true,
          });
          // store.createIndex('value', 'value', { unique: false });
        });
    };
  });
}

function promisify(oper, db) {
  const mode = oper === 'get' ? 'readonly' : 'readwrite';
  return (v) => {
    if (!db.store) throw new Error('No store requested.');
    const tx = db.transaction(db.store, mode),
      store = tx.objectStore(db.store);
    delete db.store;
    return new Promise((resolve, reject) => {
      const req = store[oper](v);
      req.onsuccess = (ev) => {
        const res = ev.target.result;
        resolve(res?.value || res);
      };
      req.onerror = (ev) => reject(ev.target.errorCode);
    });
  };
}
function promisifyMany(oper, db) {
  const mode = oper === 'get' ? 'readonly' : 'readwrite';
  return (values) => {
    if (!db.store) throw new Error('No store requested.');
    const tx = db.transaction(db.store, mode),
      store = tx.objectStore(db.store);
    delete db.store;
    return new Promise((resolve, reject) => {
      const result = {},
        process = (ev) => {
          const res = ev.target.result;
          res?.id && (result[res.id] = res.value);
        },
        onError = (ev) => {
          reject(ev.target.errorCode);
        };
      tx.oncomplete = () => {
        resolve(result);
      };
      tx.onerror = onError;
      values.forEach((v) => {
        const req = store[oper](v);
        req.onsuccess = process;
        req.onerror = onError;
      });
      tx.commit();
    });
  };
}

const DB = (db) =>
  Object.assign(db, {
    clear: promisify('clear', db),
    get: promisify('get', db),
    add: promisify('add', db),
    put: promisify('put', db),
    delete: promisify('delete', db),
    addMany: promisifyMany('add', db),
    putMany: promisifyMany('put', db),
    getMany: promisifyMany('get', db),
    deleteMany: promisifyMany('delete', db),
    storeNames: () => Object.values(db.objectStoreNames),
  });

//   const readMethods = [
//     'get',
//     'getKey',
//     'getAll',
//     'getAllKeys',
//     'count',
//   ];
//   const writeMethods = ['put', 'add', 'delete', 'clear'];

export default openDB;
