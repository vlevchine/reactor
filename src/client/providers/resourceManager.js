import { useState, useMemo, useCallback } from 'react';
import DataResource from './dataResource';

class DBResource {
  constructor(name) {
    this.name = name;
  }
  async updateRequired(db, s_ver) {
    const ver = await db[this.name].get('__v'),
      l_v = parseInt(ver);
    return !l_v || l_v < s_ver;
  }
  async retrieve(db, ids = []) {
    return db[this.name].getMany(ids);
  }
  // async fetch(db,id) {
  //   if (!id) return Object.create(null);
  //   return db[this.name].fetch(id).then((e) => e?.values || []);
  // }
  async load(provider, db, s_ver) {
    const update = await this.updateRequired(db, s_ver);
    return update
      ? Promise.all([
          this.loadItems(provider),
          db[this.name].clear(),
        ]).then(([d]) => this.saveItems(db, d, s_ver))
      : true;
  }
}

class LookupManager extends DBResource {
  async loadItems(provider) {
    return provider.query({ name: this.name });
    // .then((data) => data?.[this.name]);
  }
  toArray(items = {}, init = []) {
    return Object.keys(items).reduce((acc, k) => {
      let item = items[k];
      if (Array.isArray(item)) {
        item = { id: k, value: item };
      } else item = { id: item.id, value: item.values };
      item.name = k;
      acc.push(item);
      return acc;
    }, init);
  }
  async saveItems(db, items = {}, ver) {
    const vals = this.toArray(items, [{ id: '__v', value: ver }]);
    return db[this.name].addMany(vals);
  }
  async loadMore(provider, db, company) {
    const vals = await provider.query({
        name: this.name,
        vars: { company },
      }),
      arr = this.toArray(vals);
    return db[this.name].putMany(arr);
  }
}

class TypesManager extends DBResource {
  async loadItems() {
    const types = await import('@app/content/meta/types.json');
    return Object.entries(types)
      .filter(([k]) => k !== 'default')
      .map(([k, v]) => ({
        id: k,
        value: v,
      }));
  }
  async saveItems(db, items = [], ver) {
    items.unshift({ id: '__v', value: ver });
    return db[this.name].putMany(items);
  }
  async retrieve(db, id) {
    const ids = this.pageTypes[id];
    return super.retrieve(db, ids);
  }
}

let Lookups = new LookupManager('lookups'),
  Types = new TypesManager('types'),
  _loaded,
  Logger,
  DB,
  Provider;

const funcs = new Set(),
  fetch = (looks, key, dataResource) =>
    Promise.all([
      Lookups.retrieve(DB, looks),
      Types.retrieve(DB, key),
    ]).then(([lookups, schema]) => {
      dataResource?.init(schema);
      return { lookups, schema, dataResource };
    });

export async function load(versions) {
  _loaded = false;
  if (versions) {
    const { v_lookups, v_types } = versions;
    await Promise.all([
      Lookups.load(Provider, DB, v_lookups),
      Types.load(Provider, DB, v_types),
    ]);
  }

  _loaded = true;
  funcs.forEach((f) => f(_loaded));
  funcs.clear();
}
function init(dbMng) {
  DB = dbMng;
}

export function createResources(types, provider) {
  Provider = provider;
  Lookups.provider = provider;
  Types.pageTypes = types;
  return { init, load };
}

export function useResources(query) {
  const [loaded, setLoaded] = useState(_loaded),
    dataResource = useMemo(
      () =>
        query && new DataResource(query, Lookups.provider, Logger),
      []
    );
  const retrieve = useCallback((lookups, key) => {
      return fetch(lookups, key, dataResource);
    }, []),
    more = (company) => Lookups.loadMore(Provider, DB, company);
  if (!loaded) funcs.add(setLoaded);
  return { loaded, load, loadMore: more, retrieve };
}
// export function createResources(types, provider) {
//   Lookups = new LookupManager(provider);
//   Types = new TypesManager(types);
//   const res = {
//     Lookups,
//     Types,
//     dataProvider: provider,
//     init(dbMng) {
//       Lookups.init(dbMng);
//       Types.init(dbMng);
//     },
//     async load({ v_lookups, v_types }) {
//       return Promise.all([
//         Lookups.load(v_lookups),
//         Types.load(v_types),
//       ]);
//     },
//     dataResource(query, schema) {
//       return new DataResource(provider).init(query, schema);
//     },
//   };
//   return res;
// }
