import { useState, useMemo, useCallback } from 'react';
import DataResourceCollection from './dataResource';

const dbResource = {
  async updateRequired(db, s_ver) {
    const ver = await db[this.name].get('__v'),
      l_v = parseInt(ver);
    return !l_v || l_v < s_ver;
  },
  // async fetch(db,id) {
  //   if (!id) return Object.create(null);
  //   return db[this.name].fetch(id).then((e) => e?.values || []);
  // }
  async saveItems(db, items = [], ver) {
    items.unshift({ id: '__v', value: ver });
    return db[this.name].putMany(items);
  },
  async load(provider, db, s_ver) {
    const update = await this.updateRequired(db, s_ver);
    return update
      ? Promise.all([
          this.loadItems(provider),
          db[this.name].clear(),
        ]).then(([d]) => this.saveItems(db, d, s_ver))
      : true;
  },
};

const typeResource = Object.assign(Object.create(dbResource), {
    async loadItems() {
      const types = await import('@app/content/meta/types.json');
      return Object.entries(types)
        .filter(([k]) => k !== 'default')
        .map(([k, v]) => ({
          id: k,
          value: v,
        }));
    },
    async retrieve(db, id) {
      const ids = this.pageTypes[id];
      return db[this.name].getMany(ids);
    },
  }),
  lookupsResource = Object.assign(Object.create(dbResource), {
    async loadItems(provider) {
      return provider.fetch(this.name);
      // .then((data) => data?.[this.name]);
    },
    async saveItems(db, items = {}, ver) {
      const vals = items.lookups;
      vals.push({ id: '__v', value: ver });
      return db[this.name].addMany(vals);
    },
    async loadMore(db, vals) {
      return db[this.name].putMany(vals);
    },
    async retrieve(db, ids = []) {
      return db[this.name].getMany(ids);
    },
  });

let Types = Object.assign(Object.create(typeResource), {
    name: 'types',
  }),
  Lookups = Object.assign(Object.create(lookupsResource), {
    name: 'lookups',
  }),
  _loaded,
  _loading,
  Logger,
  DB,
  s_versions,
  Provider;

const funcs = new Set(),
  fetch = (looks, key, dataResource) =>
    Promise.all([
      Lookups.retrieve(DB, looks),
      Types.retrieve(DB, key),
    ]).then(([lookups, schema]) => {
      dataResource?.init(schema);
      return { lookups, schema };
    });

export async function load(versions = {}) {
  s_versions = Object.entries(versions).reduce(
    (acc, [k, v]) => ({ ...acc, [k]: parseInt(v) }),
    {}
  );
  if (!s_versions.lookups || _loading) return false;
  _loaded = false;
  _loading = true;
  const { lookups, types } = s_versions;
  await Promise.all([
    Lookups.load(Provider, DB, lookups),
    Types.load(Provider, DB, types),
  ]);
  _loaded = true;
  _loading = false;
  funcs.forEach((f) => f(_loaded));
  funcs.clear();
}
async function init(dbMng) {
  DB = dbMng;
}
async function loadMore(vals) {
  Lookups.loadMore(DB, vals);
}

export function createResources(types, provider) {
  Provider = provider;
  Lookups.provider = provider;
  Types.pageTypes = types;
  return { init, load, loadMore };
}

export function useResources(query) {
  const [loaded, setLoaded] = useState(_loaded),
    dataResource = useMemo(
      () =>
        query &&
        new DataResourceCollection(query, Lookups.provider, Logger),
      []
    );
  const retrieve = useCallback((lookups, key) => {
    return fetch(lookups, key, dataResource);
  }, []);
  if (!loaded) funcs.add(setLoaded);
  return { loaded, load, loadMore, retrieve, dataResource };
}
