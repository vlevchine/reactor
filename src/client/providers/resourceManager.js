import { useMemo } from 'react';
import { _ } from '@app/helpers';
import cache from '@app/utils/storage';
import types from '@app/appData/types.json';
import { provider, entity } from './dataProvider'; //, {fetchit}
import DataResourceCollection from './dataResource';

const lookupsOper = 'lookups',
  typesOper = 'types',
  getCached = (path, ids) => {
    return ids
      ? ids.reduce((acc, id) => {
          const stored = cache.get(true, [...path, id]);
          if (stored) acc[id] = stored.value || stored;
          return acc;
        }, Object.create(null))
      : undefined;
  },
  cacheData = (arr, path) => {
    arr.forEach((e) => {
      const to = [...path, e.id || e.name],
        vals =
          e.items || (e.fields && _.toObject(e.fields, 'name')) || e;
      cache.set(true, to, vals || []);
    });
  },
  composeParams = (cache, ids, params, key) => {
    const missing = _.without(ids, ...Object.keys(cache[key]));
    if (missing.length)
      params[key] = { common: 2, filter: { id: { $in: missing } } };
  },
  enhanceCache = (items = [], cached, name) => {
    items.forEach((e) => {
      const _id = e.id || e.name,
        vals = e.items || _.toObject(e.fields, 'name'),
        path = [name, _id];
      cached[name][_id] = vals;
      cache.set(true, path, vals || []);
    });
  },
  getTypeMeta = async (names) => {
    const { lookups = [], depends = [] } = names
        .map((e) => types[e])
        .filter(Boolean)
        .reduce(
          (acc, e) => {
            const { lookups = [], depends = [] } = e;
            lookups.forEach((l) => {
              if (!acc.lookups.includes(l)) acc.lookups.push(l);
            });
            depends.forEach((d) => {
              if (!acc.depends.includes(d)) acc.depends.push(d);
            });
            return acc;
          },
          { depends: [...names], lookups: [] }
        ),
      cached = {
        lookups: getCached([lookupsOper], lookups),
        types: getCached([typesOper], depends),
      },
      params = {};
    composeParams(cached, lookups, params, lookupsOper);
    composeParams(cached, depends, params, typesOper);
    if (!_.isEmpty(params)) {
      const data = await entity.request(params);
      enhanceCache(data?.lookups, cached, lookupsOper);
      enhanceCache(data?.types, cached, typesOper);
    }
    return cached;
  };

let loaded, Logger;
const loadAllUsers = () => {
  return provider.getAllUsers();
};

//type is not set as these are well-known opNames
//op is not set as it's default
const required = { required: true },
  lookups_project = 'id name items',
  types_project = 'id name fields depends';

async function loadCommonData() {
  loaded = false;
  const { lookups, types } = await entity.request({
    lookups: {
      filter: required,
      project: lookups_project,
      common: 1,
    },
    types: {
      filter: required,
      project: types_project,
      common: 1,
    },
  });
  lookups.forEach((e) =>
    cache.set(true, [lookupsOper, e.id], e.items)
  );
  types.forEach((e) => cache.set(true, [typesOper, e.name], e));
  loaded = true;
}
async function impersonate(info) {
  return provider.impersonate(info);
}
async function loadCompanyData(coId, userId) {
  loaded = false;
  const params = {
    company: {
      type: 'Company',
      id: coId,
      common: 1,
      project: 'name username roles',
    },
    users: { type: 'User', project: 'name username roles' },
    usr: {
      type: 'User',
      filter: { username: userId },
      project: 'name username roles initials settings',
    },
    lookups: {
      filter: required,
      project: lookups_project,
      common: 1,
    },
    types: {
      filter: required,
      project: types_project,
      common: 1,
    },
  };
  const {
    lookups,
    types,
    users,
    company,
    usr,
  } = await entity.request(params);
  if (lookups) cacheData(lookups, [lookupsOper]);
  if (types) cacheData(types, [typesOper]);
  const { initials, name, username, roles, settings } = usr[0];
  loaded = true;
  return {
    users,
    company: company,
    user: { initials, name, id: username, roles, settings },
  };
}

async function loadData(params) {
  loaded = false;
  const pld =
      _.isArray(params) || !params?.type
        ? params
        : { _wrapper: params },
    data = await entity.request(pld);
  loaded = true;

  return data._wrapper || data;
}

export function useData() {
  return { loadData };
}
export function createResources(props) {
  provider.init(props);
  return { loadCompanyData, loadCommonData };
}

export function useResources(query, params) {
  const dataResource = useMemo(
    () =>
      query && new DataResourceCollection(query, provider, Logger),
    []
  );
  //merge params as per page with default ones - from query def
  dataResource?.setParams(params);

  //getLookups may be used to access sync any cached looup by name
  return {
    loaded,
    dataResource,
    impersonate,
    loadAllUsers,
    getTypeMeta,
    loadData,
    loadCompanyData,
  };
}
