import { useMemo } from 'react';
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';
import cache from '@app/utils/storage';
import types from '@app/appData/types.json';
import {
  entityCache,
  lookupsCache,
  typesCache,
} from '@app/services/indexedCache';
import {
  getItemHistory,
  clearHistory,
} from '@app/services/changeHistory'; // addItem,
import { provider, entity } from './dataProvider';
import DataResourceCollection from './dataResource';

let _db;
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
  // cacheData = (arr, path) => {
  //   arr.forEach((e) => {
  //     const to = [...path, e.id || e.name],
  //       vals =
  //         e.items || (e.fields && _.toObject(e.fields, 'name')) || e;
  //     cache.set(to, vals || [], true);
  //   });
  // },
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
      cache.set(path, vals || [], true);
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
async function loadCommonData() {
  loaded = false;
  const { lookups, types } = await entity.request({
    lookups: {
      //    filter: { required: true },
      common: 1,
    },
    types: {
      //     filter: { required: true },
      common: 1,
    },
  });
  await Promise.all([
    lookupsCache.setMany(lookups),
    typesCache.setMany(types),
  ]);
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
      //  filter: { required: true },
      common: 0,
    },
    types: {
      //    filter: { required: true },
      common: 0,
    },
  };
  const {
    lookups,
    types,
    users,
    company,
    usr,
  } = await entity.request(params);
  await Promise.all([
    lookupsCache.setMany(lookups),
    typesCache.setMany(types),
  ]);

  const [lk, tp] = await Promise.all([
    lookupsCache.getAll(),
    typesCache.getAll(),
  ]);
  const { initials, name, username, roles, settings } = usr[0];
  loaded = true;
  return {
    users,
    company: company,
    lookups: lk,
    types: tp,
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
function getKey(type, id) {
  return `${type}:${id}`;
}
export async function cacheEntity2Storage(item, params) {
  const { type, id } = params,
    key = getKey(type, id);
  return cache.set(key, item, true);
}
async function getEntity(id) {
  return _db.entities.get(id);
}
async function loadEntity(params, domain) {
  const { id, type } = params;
  let item = await entityCache.getById(id);
  if (!item) {
    const [data] = await entity.request([params]);
    await entityCache.addOne(data, type, domain, data.id);
    return data;
  }
  return item; //{ depends, type, id } = params;
}
async function saveEntity(msg, domain) {
  const { type, item } = msg,
    history = getItemHistory(item.id),
    req = item.createdAt
      ? Object.assign(history?.getChanges(), { op: 'edit' })
      : Object.assign(item, { op: 'add' }),
    domainItems = await entityCache.getDomainItems(item.id, true),
    bulk = domainItems
      .map((e) =>
        e.removed
          ? !e.item || e.item.createdAt
            ? e.id
            : undefined
          : e.item
      )
      .filter(Boolean),
    reqs = bulk.length
      ? [req, { type: domainItems[0].type, op: 'bulk', item: bulk }]
      : [req];

  const [{ value }] = await entity.request(reqs);
  await Promise.all([
    entityCache.addOne(value, type, domain),
    clearHistory(value.id),
  ]);
  return value;
}
async function addEntity(type, entity) {
  const id = entity?.id || nanoid(),
    key = getKey(type, id),
    obj = Object.assign({ id }, entity);
  await cache.set(key, obj, true);
  // addItem(type, id);
  // await entity.request([params]);
  return id;
}
async function removeEntity(msg, params = {}) {
  const op = 'remove';
  const reqs = [
    { op, ...msg },
    { op, ...params },
  ];
  console.log(reqs);
  //await entity.request(reqs);
  return clearEntity(msg.id);
}
async function clearEntity(id) {
  clearHistory(id);
  return entityCache.clearDomain(id);
}
async function addToDomain(item, type, domain) {
  // const history = getItemHistory(domain);, change
  //form.current.changed({ form: activeTask.form }, taskPath, 'update');
  // history.addChange(change);
  return entityCache.addOne(item, type, domain);
}

export function useData() {
  return {
    loadData,
    loadEntity,
    getEntity,
    saveEntity,
    addEntity,
    removeEntity,
    clearEntity,
    addToDomain,
  };
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
