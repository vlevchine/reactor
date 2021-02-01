import { useState, useMemo, useCallback } from 'react';
import { _ } from '@app/helpers';
import cache from '@app/utils/storage';
import DataResourceCollection from './dataResource';

const getCached = (ids = [], path) => {
    return ids.reduce((acc, id) => {
      const stored = cache.get(true, [...path, id]);
      if (stored) acc[id] = stored;
      return acc;
    }, Object.create(null));
  },
  getMissing = (ids = [], cached) => {
    return _.without(ids, ...Object.keys(cached)).join(',');
  };

const lookupsResource = {
  name: 'lookups',
  async load() {
    const ids = ['wellOperator', 'lahee', 'wellZone', 'wellField'],
      meta = await this.provider.fetch(this.name, { ids });

    ids.forEach((e) => cache.set(true, [this.name, e], meta[e]));
  },
  async loadMore(vals = []) {
    //could get and merge, or just overwrite as below:
    vals.forEach((v) => cache.set(true, [this.name, v.id], v));
  },
  async retrieve(ids = []) {
    const cached = getCached(ids, [this.name]),
      absent = getMissing(ids, cached),
      meta = await this.provider.fetch(this.name, {
        ids: absent,
      });
    (meta || []).forEach((e) => {
      cache.set(true, [this.name, e.id], e);
      cached[e.id] = e;
    });
    return cached;
  },
};

const typeResource = {
  name: 'schema',
  async load() {
    const meta = await this.provider.fetch(this.name, {
      queries: true,
      mutations: true,
    });
    this.provider.setMeta(meta);
    ['queries', 'mutations'].forEach((e) =>
      cache.set(true, [this.name, e], meta[e])
    );
  },
  async retrieve(ids = []) {
    const cached = getCached(ids, [this.name, 'types']),
      absent = getMissing(ids, cached),
      meta = await this.provider.fetch(this.name, {
        types: absent,
      }),
      res = meta?.types || {};
    Object.entries(res).forEach(([k, v]) => {
      cache.set(true, [this.name, 'types', k], v);
    });
    return Object.assign(cached, res);
  },
};

let _loaded, Logger;

const funcs = new Set(),
  fetch = (looks, keys, dataResource) =>
    Promise.all([
      lookupsResource.retrieve(looks),
      typeResource.retrieve(keys),
    ]).then(([lookups, schema]) => {
      dataResource?.init(schema);
      return { lookups, schema };
    });

export async function load() {
  _loaded = true;
  await Promise.all([lookupsResource.load(), typeResource.load()]);
  _loaded = true;
  funcs.forEach((f) => f(_loaded));
  funcs.clear();
}

async function loadMore(vals) {
  lookupsResource.loadMore(vals);
}

export function createResources(provider) {
  lookupsResource.provider = provider;
  typeResource.provider = provider;
  return { load, loadMore };
}

export function useResources(query) {
  const [loaded, setLoaded] = useState(_loaded),
    dataResource = useMemo(
      () =>
        query &&
        new DataResourceCollection(
          query,
          lookupsResource.provider,
          Logger
        ),
      []
    );
  const retrieve = useCallback((lookups, keys) => {
    return fetch(lookups, keys, dataResource);
  }, []);
  if (!loaded) funcs.add(setLoaded);
  return { loaded, load, loadMore, retrieve, dataResource };
}
