const { nanoid } = require('nanoid');

const getPath = (path) =>
    path ? (Array.isArray(path) ? path : path.split('.')) : [],
  drillIn = (obj, e) =>
    Array.isArray(obj)
      ? obj[e] || obj.find((t) => t.id === e || t === e)
      : obj?.[e];

function throttle(func, delay) {
  let lastFunc;
  let lastTime;

  return function () {
    const _this = this;
    const args = arguments;

    if (!lastTime) {
      func.apply(_this, args);
      lastTime = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        func.apply(_this, args);
        lastTime = Date.now();
      }, delay - (Date.now() - lastTime));
    }
  };
}

function parseProps(str) {
  const toks = str
    ?.split(';')
    ?.map((e) => e.split(':').map((p) => p.trim()));
  return Object.fromEntries(toks);
}
const typeNames = [
    'Object',
    'Boolean',
    'Arguments',
    'String',
    'Number',
    'Date',
    'RegExp',
    'Undefined',
    'Null',
  ],
  compose2 = (f, g) => (...args) => f(g(...args)),
  compose = (...fns) => fns.reduce(compose2),
  pipe = (...fns) => fns.reduceRight(compose2),
  identity = (t) => t,
  curry = (fn) => (...args1) =>
    args1.length === fn.length
      ? fn(...args1)
      : (...args2) => {
          const args = [...args1, ...args2];
          return args.length >= fn.length
            ? fn(...args)
            : curry(fn)(...args);
        },
  isFunction = (f) =>
    f &&
    typeof f === 'function' &&
    funcNames.includes(Object.prototype.toString.call(f)),
  equal = curry(Object.is),
  prop = curry((name, a) =>
    a[name] && isFunction(a[name]) ? a[name].call(a) : a[name]
  ),
  props = curry((names, a) => names.map((n) => obj.prop(n, a))),
  propEqual = (name, v) => compose(equal(v), prop(name)),
  funcNames = ['[object Function]', '[object AsyncFunction]'],
  typeStrings = typeNames.reduce(
    (acc, e) => ({ ...acc, [e]: `[object ${e}]` }),
    {}
  ),
  fold = curry(Array.prototype.reduce),
  obj = {
    isEmpty(src = {}) {
      return !Object.keys(src).length;
    },
    isEquivalent(src = {}, val = {}) {
      //shallow!!!
      const srcKeys = Object.keys(src),
        valKeys = Object.keys(val);
      return (
        srcKeys.length === valKeys.length &&
        srcKeys.every((s) => src[s] === val[s])
      );
    },
    isSame(src = {}, val = {}) {
      //deep!!!
      return JSON.stringify(src) === JSON.stringify(val);
    },
    propsEquaL(src, tgt, props) {
      if (!src || !tgt) return false;
      return props.every((k) => src[k] === tgt[k]);
    },
    get(src, path = [], def) {
      const pth = Array.isArray(path) ? path : path.split('.'),
        res = src ? pth.reduce((acc, e) => acc?.[e], src) : undefined;
      return res ?? def;
    },
    //mutating!!!
    set(src, path = [], val) {
      const pth = Array.isArray(path) ? path : path.split('.');
      if (!pth.length) {
        Object.assign(src, val);
        return src;
      }
      const key = list.last(pth),
        parent = list.initial(pth).reduce((acc, e) => {
          if (!src[e]) src[e] = {};
          return src[e];
        }, src);

      if (_.isObject(val)) {
        if (!parent[key]) parent[key] = {};
        Object.assign(parent[key], val);
      } else {
        parent[key] = val;
      }
      return src;
    },
    getIn(obj, path, exact) {
      if (!obj || (!path && exact)) return undefined;
      if (!path && !exact) return obj;
      return getPath(path).reduce((acc = {}, e) => {
        return acc ? drillIn(acc, e) : undefined;
      }, obj);
    },
    getInWith(obj = {}, path, prop) {
      return path
        ? getPath(path).reduce((acc = {}, e) => {
            return drillIn(acc, e, prop);
          }, obj)
        : obj;
    },
    setIn(obj = {}, path, value) {
      const ids = getPath(path),
        source = _.initial(ids).reduce((acc, id) => {
          let val = drillIn(acc, id);
          if (!val) {
            if (_.isArray(acc)) {
              acc.push({ id });
            } else {
              acc[id] = Object.create(null);
            }
          }
          return drillIn(acc, id);
        }, obj);
      source[_.last(ids)] = value;
    },
    pick(src = {}, props) {
      return Object.fromEntries(props.map((p) => [p, src[p]]));
    },
    omit(src = {}, props) {
      return Object.fromEntries(
        Object.entries(src).filter(([k]) => !props.includes(k))
      );
    },
    findById(src = [], id) {
      return src.find((e) => e.id === id);
    },
    mapValues(src = {}, fn) {
      return Object.entries(src).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: fn(v) }),
        {}
      );
    },
    clear(src = {}) {
      Object.keys(src).forEach((k) => {
        src[k] = undefined;
      });
      return src;
    },
    clearKeep(src = {}, keep = []) {
      Object.keys(src)
        .filter((k) => !keep.includes(k))
        .forEach((k) => {
          src[k] = undefined;
        });
      return src;
    },
    clearDrop(src = {}, drop = []) {
      Object.keys(src)
        .filter((k) => drop.includes(k))
        .forEach((k) => {
          src[k] = undefined;
        });
      return src;
    },
  },
  list = {
    last(v = []) {
      return v[v.length - 1];
    },
    first(v = []) {
      return v[0];
    },
    tail(v = []) {
      return v.slice(1);
    },
    initial(v = []) {
      return v.slice(0, -1);
    },
    isListEqual(v1, v2) {
      if (!v1 || !v2) return false;
      return (
        v1.length === v2.length &&
        list.union(v1, v2).length === v1.length
      );
    },
    findIndexes(items, fn) {
      return items
        .map((e, i) => (fn(e) ? i : -1))
        .filter((e) => e > -1);
    },
    findIndexRight(arr, fn) {
      let i = arr.length;
      while (i--) {
        if (fn(arr[i])) break;
      }
      return i;
    },
    remove(items, item) {
      const fn = _.isFunction(item) ? item : (e) => e === item,
        inds = list.findIndexes(items, fn);
      inds.forEach((ind, i) => items.splice(ind - i, 1));
      return items;
    },
    replace(items, ind, item) {
      return [...items.slice(0, ind), item, ...items.slice(ind + 1)];
    },
    replaceLast(items, item) {
      return list.replace(items, items.length - 1, item);
    },
    safeAdd(items = [], item) {
      const set = new Set(items);
      set.add(item);
      return [...set];
    },
    safeRemove(items = [], item) {
      const set = new Set(items);
      set.delete(item);
      return [...set];
    },
    toggle(items, item) {
      const set = new Set(items);
      if (set.has(item)) {
        set.delete(item);
      } else set.add(item);
      return [...set];
    },
    clear() {
      return [];
    },
    without(arr = [], ...args) {
      return arr.filter((e) => !args.includes(e));
    },
    union(...arrays) {
      return [...new Set(arrays.flat())];
    },
    difference(arr = [], vals = []) {
      return arr.filter((e) => !vals.includes(e));
    },
    partition(arr = [], predicate) {
      return arr.reduce(
        (acc, e) => {
          const ind = predicate(e) ? 0 : 1;
          acc[ind].push(e);
          return acc;
        },
        [[], []]
      );
    },
    partitionByIndex(arr, indexes) {
      const res = indexes.map((i) => arr[i]),
        rest = arr.filter((e, i) => !indexes.includes(i));
      return [res, rest];
    },
    pullAt(arr, indexes = []) {
      const res = indexes.map((i) => arr[i]),
        rest = arr.filter((e, i) => !indexes.includes(i));
      arr.length = 0;
      arr.push(...rest);
      return res;
    },
    insert(arr, items = [], ind = 0) {
      return arr.slice(0, ind).concat(items, arr.slice(ind));
    },
    intersection(arr, vals) {
      return arr.filter((e) => vals.includes(e));
    },
    intersect(arr, vals) {
      return list.intersection(arr, vals).length > 0;
    },
    reverse(arr) {
      return arr.reduceRight((acc, e) => {
        acc.push(e);
        return acc;
      }, []);
    },
    unique(arr, prop = 'id') {
      const result = [],
        map = new Map();
      for (const item of arr) {
        if (!map.has(item[prop])) {
          map.set(item[prop], true);
          result.push(item);
        }
      }
      return result;
    },
    removeAt(arr, ind) {
      return [...arr.slice(0, ind), ...arr.slice(ind + 1)];
    },
    addAt(arr, ind, item) {
      return [...arr.slice(0, ind), item, ...arr.slice(ind)];
    },
    replaceAt(arr, ind, item) {
      return [...arr.slice(0, ind), item, ...arr.slice(ind + 1)];
    },
    swap(arr, i1, i2) {
      if (i1 === i2) return arr;

      return arr;
    },
    moveIn(ar, i1, i2) {
      if (i1 === i2) return ar;
      return i1 < i2
        ? [
            ...ar.slice(0, i1),
            ...ar.slice(i1 + 1, i2),
            ar[i1],
            ...ar.slice(i2),
          ]
        : [
            ...ar.slice(0, i2),
            ar[i1],
            ...ar.slice(i2, i1),
            ...ar.slice(i1 + 1),
          ];
    },
    moveBetween(ar1, from = [], ar2, to) {
      if (ar1 === ar2) {
        const arr1 = _.moveIn(ar1, from, to);
        return [arr1, arr1];
      } else {
        const out = from.map((i) => ar1[i]),
          arr1 = ar1.filter((e, i) => !from.includes(i)),
          arr2 = [...ar2.slice(0, to), ...out, ...ar2.slice(to)];
        return [arr1, arr2];
      }
    },
    sum(arr, init = 0) {
      return arr.reduce((acc, e) => acc + e, init);
    },
    sumBy(arr, accessor = identity, init = 0) {
      return arr.reduce((acc, e) => acc + accessor(e), init);
    },
    groupBy(arr, fn) {
      return arr.reduce((acc, e) => {
        const res = fn(e);
        if (!acc[res]) {
          acc[res] = [e];
        } else {
          acc[res].push(e);
        }
        return acc;
      }, {});
    },
    arrayOfInt(min = 0, max) {
      return max > min
        ? Array(max - min + 1)
            .fill()
            .map((_, i) => i + min)
        : [min];
    },
    toObject(arr, prop = 'id', fn = identity) {
      return arr.reduce((acc, e) => {
        acc[e[prop]] = fn(e);
        return acc;
      }, Object.create(null));
    },
    insertInside(tks = [], name, sep) {
      const toks = Array.isArray(tks) ? tks : tks.split(sep);
      return _.tail(toks).reduce(
        (acc, e) => {
          acc.push(name, e);
          return acc;
        },
        [toks[0]]
      );
    },
    insertBetween(tks = [], name, options) {
      const sep = options?.sep || '.',
        toks = Array.isArray(tks) ? tks : tks.split(sep);
      if (!toks?.length) return tks;
      const res = list.insertInside(toks, name, sep);
      return options?.asArray ? res : res.join(sep);
    },
    insertRight(tks = [], name, options) {
      if (!tks?.length) return tks;
      const sep = options?.sep || '.',
        res = list.insertInside(tks, name, sep);
      res.push(name);
      return options?.asArray ? res : res.join(sep);
    },
    insertLeft(tks = [], name, options) {
      if (!tks?.length) return tks;
      const sep = options?.sep || '.',
        res = list.insertInside(tks, name, sep);
      res.unshift(name);
      return options?.asArray ? res : res.join(sep);
    },
    insertOver(tks = [], name, options) {
      if (!tks?.length) {
        tks.push(name);
        return tks;
      }
      const sep = options?.sep || '.',
        res = list.insertInside(tks, name, sep);
      res.unshift(name);
      res.push(name);
      return options?.asArray ? res : res.join(sep);
    },
    dropInId(tks = '', prop, options) {
      const sep = options?.sep || '.',
        toks = Array.isArray(tks) ? tks : tks.split(sep),
        res = toks.filter((t) => t !== prop);
      return options?.asArray ? res : res.join(sep);
    },
    capitalize(str) {
      return str.replace(str[0], str[0].toUpperCase());
    },
    toCamelCase(str, sep = '-') {
      const toks = str.split(sep);
      return _.tail(toks).reduce(
        (acc, t) => acc + _.capitalize(t),
        toks[0]
      );
    },
  },
  getAllTreeLeaves = (list, acc = []) => {
    list.forEach((e) => {
      if (e.items) {
        getAllTreeLeaves(e.items, acc);
      } else acc.push(e);
    });
    return acc;
  },
  _ = typeNames.reduce(
    (obj, name) => {
      obj['is' + name] = (x) =>
        Object.prototype.toString.call(x) === typeStrings[name];
      return obj;
    },
    {
      ...list,
      ...obj,
      isNil: (x) => _.isUndefined(x) || _.isNull(x),
      isArray: Array.isArray,
      isFunction,
      noop: () => {},
      prop,
      props,
      identity,
      fold,
      equal,
      propEqual,
      idEqual: (v, u) => v?.id === u?.id,
      constant: (v) => () => v,
      toString: (v) => (_.isString(v) ? v : ''),
      merge: (src, tgt = {}) =>
        Object.keys(tgt).some((k) => src[k] !== tgt[k])
          ? { ...src, ...tgt }
          : src,
      dotMerge: (...arg) => arg.filter(Boolean).join('.'),
      testCondition: (cond, obj = {}) =>
        cond[0] === '!' ? !obj[cond.substring(1)] : obj[cond],
      setOrUndefined: (v, cond) => (cond ? v : undefined),
      undefinedOrSet: (v, cond) => (cond ? undefined : v),
      defaultTo: (t, cond, def) => (cond ? t : def),
      safeApply: (func, v) => (_.isNil(v) ? undefined : func(v)),
      parseDate: (d) => {
        const ms = Date.parse(d);
        return isNaN(ms) ? undefined : new Date(ms);
      },
      sameDate: (d1, d2) => d1?.valueOf() === d2?.valueOf(),
      compose,
      pipe,
      curry,
      throttle,
      parseProps,
      getAllTreeLeaves,
      generateId: (name, length = 6) =>
        name ? [name, nanoid(length)].join(':') : nanoid(),
    }
  );

module.exports = _;
