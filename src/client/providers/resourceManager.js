import { useMemo, useCallback } from 'react';
import { _ } from '@app/helpers';
import cache from '@app/utils/storage';
import DataResourceCollection from './dataResource';

const getCached = (path, ids = []) => {
    return ids.reduce((acc, id) => {
      const stored = cache.get(true, [...path, id]);
      if (stored) acc[id] = stored.value || stored;
      return acc;
    }, Object.create(null));
  },
  getMissing = (ids = [], cached) => {
    return _.without(ids, ...Object.keys(cached)).join(',');
  };

const lookupsResource = {
  name: 'lookups',
  async load(version, vals = []) {
    const ver = cache.get(true, [this.name, 'version']),
      update = !ver || parseInt(ver) < parseInt(version);
    const //ids = ['wellOperator', 'lahee', 'wellZone', 'wellField'],
      meta = update ? await this.provider.fetch(this.name, {}) : [];
    //cache common lookups:
    meta.forEach((e) => cache.set(true, [this.name, e.id], e));
    //cache company-spcific lookups - override:
    vals.forEach(({ id, value }) =>
      cache.set(true, [this.name, id], { id, _id: id, value })
    );
  },
  async loadMore(vals = []) {
    //could get and merge, or just overwrite as below:
    vals.forEach((v) => cache.set(true, [this.name, v.id], v));
  },
  async retrieve(ids = []) {
    const cached = getCached([this.name], ids),
      absent = getMissing(ids, cached),
      meta = await this.provider.fetch(this.name, {
        ids: absent,
      });
    meta?.forEach((e) => {
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
    const cached = getCached([this.name, 'types'], ids),
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

let loaded, Logger;

const funcs = new Set(),
  fetch = (looks, keys, dataResource) =>
    Promise.all([
      lookupsResource.retrieve(looks),
      typeResource.retrieve(keys),
    ]).then(([lookups, schema]) => {
      dataResource?.init(schema);
      return { lookups, schema };
    });

export async function load(versions, vals) {
  loaded = false;
  await Promise.all([
    lookupsResource.load(versions?.lookups, vals),
    typeResource.load(),
  ]);
  loaded = true;
  funcs.forEach((f) => f(loaded));
  funcs.clear();
}

export function createResources(provider) {
  lookupsResource.provider = provider;
  typeResource.provider = provider;
  return { load };
}

export function useResources(query, params) {
  const dataResource = useMemo(
    () =>
      query &&
      new DataResourceCollection(
        query,
        lookupsResource.provider,
        Logger
      ),
    []
  );
  //merge params as per page with default ones - from query def
  dataResource?.setParams(params);

  const retrieve = useCallback((lookups, keys) => {
    return fetch(lookups, keys, dataResource);
  }, []);
  //getLookups may be used to access sync any cached looup by name
  return {
    loaded,
    load,
    retrieve,
    dataResource,
    getLookups: getCached.bind(null, ['lookups']),
  };
}
