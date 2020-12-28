import { set } from 'lodash';
import { get, getFromSession, put, putInSession } from './storage';

//Caches data per 'prefix_type_key', id refs inside cached object
//uses local/session storage API - sync
let prefix = 'app';
const getKey = (id) => {
    const ids = Array.isArray(id) ? [prefix, ...id] : [prefix, id];
    return ids.filter((e) => !!e).join('_');
  },
  cache = {
    init: (id) => {
      prefix = id;
    },
    get: ({ type, path = [] }, inSession) => {
      const getOper = inSession ? getFromSession : get,
        store = getKey(type),
        res = getOper(store),
        keys = path.filter((e) => !!e);
      return keys.length > 0 ? get(res, keys) : res;
    },
    set: ({ type, path }, value, inSession) => {
      let val = value;
      const store = getKey(type),
        oper = inSession ? putInSession : put,
        getOper = inSession ? getFromSession : get,
        keys = path.filter((e) => !!e);

      if (keys.length > 0) {
        val = getOper(store) || Object.create(null);
        set(val, keys, value);
      }
      return oper(store, val);
    },
  };

export default cache;
