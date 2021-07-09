import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';

const b64DecodeUnicode = (str) =>
    decodeURIComponent(
      Array.prototype.map
        .call(
          atob(str),
          (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join('')
    ),
  parseJwt = (token) =>
    JSON.parse(
      b64DecodeUnicode(
        token.split('.')[1].replace('-', '+').replace('_', '/')
      )
    );

const getPath = (path) =>
    path ? (_.isArray(path) ? path : path.split('.')) : [],
  drillIn = (obj, e) =>
    _.isArray(obj)
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
    isEquivalent(src, val) {
      //shallow!!!
      const srcKeys = Object.keys(src),
        valKeys = Object.keys(val);
      return (
        srcKeys.length === valKeys.length &&
        srcKeys.every((s) => src[s] === val[s])
      );
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
    getIn(obj = {}, path, exact) {
      return path || !exact
        ? getPath(path).reduce((acc = {}, e) => {
            return drillIn(acc, e);
          }, obj)
        : undefined;
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
      return items.map((e) => fn(e)).filter(Boolean);
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
        if (!acc[res]) acc[res] = [];
        acc[res.push(e)];
        return acc;
      }, {});
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
      if (!tks?.length) return tks;
      const sep = options?.sep || '.',
        res = list.insertInside(tks, name, sep);
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
      if (!tks?.length) return tks;
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
      constant: (v) => () => v,
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
    }
  );

const pallette = [
  'darkblue',
  'blue',
  'green',
  'red',
  'yellow',
  'brown',
  'darkgrey',
  'midgrey',
];
const isInside = (el, ev) => {
  const { top, bottom, left, right } = el.getBoundingClientRect(),
    { clientX, clientY } = ev;
  return (
    clientX >= left &&
    clientX <= right &&
    clientY >= top &&
    clientY <= bottom
  );
};

const nullableObj = (obj) => obj || Object.create(null),
  nullableProp = (obj, prop) =>
    (obj && obj[prop]) || Object.create(null),
  propsSame = (props, prev, next) => {
    const changed = props.filter((k) => prev[k] !== next[k]);
    return changed.length === 0;
  };
//custom hooks
const useDebounceValue = (
  id,
  value,
  notify,
  { delay = 600, direct }
) => {
  const [val, setVal] = useState(value),
    debounced = useMemo(() => new Timer(notify, delay)),
    update = (ev) => {
      const v = (direct ? ev : ev?.target?.value) || '';
      setVal(v);
      return v;
    },
    delayed = (ev) => {
      const v = update(ev);
      debounced.start(v, id);
    };

  return [val, delayed];
};

const linkTo = (toks = []) => '/' + toks.filter((e) => !!e).join('/'),
  defFindOpts = {
    sep: '.',
    prop: 'key',
    items: 'pages',
    fullPath: false,
  },
  findInTree = (tree = {}, path = '', options = {}) => {
    const { sep, prop, items, fullPath } = {
        ...defFindOpts,
        ...options,
      },
      res = path
        .split(sep)
        .filter((e) => !!e)
        .reduce(
          (acc, e) => {
            const item =
              (acc[0][items] || []).find((it) => it[prop] === e) ||
              {};
            acc[1].push(obj.omit(item, [items]));
            return [item, acc[1]];
          },
          [tree, []]
        ),
      loc = fullPath
        ? res[1].length > 0
          ? res[1]
          : [tree.pages.find((e) => e.home)]
        : res[0];

    return loc;
  },
  findInItems = (items = [], id = '', options = {}) => {
    const { sep = '.', itemsProp = 'items', exact } = options,
      ids = Array.isArray(id) ? id : id.split(sep),
      wrapped = Array.isArray(items) ? { [itemsProp]: items } : items;
    if (ids.length === 0) return exact ? undefined : wrapped.items[0];

    return ids.reduce((acc, e) => {
      let arr = acc?.[itemsProp] || [],
        itm = arr.find((t) => t.id === e);
      return itm || (exact ? undefined : acc);
    }, wrapped);
  };

const cl_sep = ' ';
const classNames = (stat, dyn = {}) => {
  const extra = _.isString(dyn)
    ? dyn.split(cl_sep)
    : Object.keys(dyn).filter((k) => dyn[k]);
  return stat
    ? [...stat.filter(Boolean), ...extra].join(cl_sep)
    : extra.join(cl_sep);
};

const getId = (parentId, id = '_') =>
    [parentId, id].filter((e) => !!e).join('.'),
  getValue = (id = '', model = {}, value) =>
    value || obj.get(model, id),
  getIdValuePair = (parentId, id, model, value) => {
    const selfId = getId(parentId, id),
      val = getValue(selfId, model, value);
    return [selfId, val];
  },
  applyModel = (model, id) => ({
    id,
    value: obj.get(model, id, model),
  }),
  hashString = (s) => {
    return s.split('').reduce(function (hash, c) {
      return ((hash << 5) - hash + c.charCodeAt(0)) | 0;
    }, 0);
  },
  getInitials = (text) =>
    text
      .split(' ')
      .map((e) => e.trim()[0].toUpperCase())
      .join('');

const dummyOpts = () => () => [],
  opts = {
    data: (ctx, ref) => () => ctx.refData[ref.data],
    lookup: (ctx, meta) => () => ctx.lookups[meta?.ref],
    via: (ctx, ref) => (mod) => {
      const via = ref.via.split('@'),
        id = obj.get(mod, via[0]),
        val = ctx.lookups[ref.lookups].find((e) => e.id === id);

      return val?.[via[1]];
    },
    fromModel: (key) => (mod = {}) => mod[key],
  },
  getOptions = (type) => opts[type] || dummyOpts,
  getQueryType = (schema, name) => {
    const field = schema.Query.fields.find((e) => e.name === name);
    return field ? field.type : field;
  },
  updateRefs = (itemKey, schema, refs) => {
    var item = schema[itemKey];
    item.refs &&
      item.refs.forEach((e) => !refs.includes(e) && refs.push(e));
    item.depends &&
      item.depends.forEach((e) => {
        updateRefs(e, schema, refs);
      });
  },
  getVal = (path, obj, fb = `$\{%{path}}`) => {
    return path.split('.').reduce((res, key) => res[key] || fb, obj);
  },
  //use: parseTemplate('${name} - ${age}',  {name: 'hi', age: 22}) -> 'hi - 22'
  parseTemplate = (template, map, fallback) => {
    return template.replace(/%\{.+?}/g, (match) => {
      const path = match.substr(2, match.length - 3).trim();
      return getVal(path, map, fallback);
    });
  },
  strToObj = (str) => {
    var obj = {};
    if (str && typeof str === 'string') {
      var objStr = str.match(/\{(.)+\}/g);
      eval('obj =' + objStr);
    }
    return obj;
  },
  functionReplacer = (key, value) => {
    return typeof value === 'function' ? value.toString() : value;
  },
  rfunc = /function[^(]*\(([^)]*)\)[^{]*{([^}]*)\}/,
  //arfunc = /[^(]*\(([^)]*)\)\s*=>\s*[^{]*{([^}]*)\}/,
  functionReviver = (key, value) => {
    if (key === '') return value;

    if (typeof value === 'string') {
      var match = value.match(rfunc) || value.includes('=>');
      if (match) {
        // var args = match[1].replace(/\s+/g, '').split(','),
        //   body = match[2].trim();
        return new Function('return '.concat(value))();
      }
    }
    return value;
  },
  object2String = (obj) => JSON.stringify(obj, functionReplacer),
  string2Object = (str) => str && JSON.parse(str, functionReviver);

const //returns standard day string, e.g. '2/21/2020'
  dateToString = (d) => d.toLocaleDateString('en-US'),
  //convert string to UTC dat midday
  stringToDate = (s) => {
    const toks = s.split('/').map(Number);
    return new Date(Date.UTC(toks[2], toks[0] - 1, toks[1], 12));
  },
  //return smae date set as midday UTC
  normalizeDate = (d) => {
    return stringToDate(dateToString(d));
  },
  indentity = (e) => e,
  sortWith = (days = [], options = {}) => {
    const { desc, prop, func = indentity } = options,
      convert = prop ? (e) => func(e[prop]) : (e) => func(e);
    const sorter = desc
      ? (a, b) => convert(b) - convert(a)
      : (a, b) => convert(a) - convert(b);
    return days.slice().sort(sorter);
  },
  clamp = (val, min = 0, max = 0) => {
    return val < min ? min : val > max ? max : val;
  },
  moveItem = (arr = [], from = 0, to = 0, keep) => {
    const array = keep ? arr : arr.slice();
    array.splice(
      to < 0 ? array.length + to : to,
      0,
      array.splice(from, 1)[0]
    );
    return array;
  },
  moveBetween = (src, from, tgt, to) => {
    if (src === tgt && from === to) return [src, tgt];
    let _src, _tgt;
    if (src === tgt) {
      _src = [...src];
      _tgt = _src;
      _src[from] = src[to];
      _src[to] = src[from];
    } else {
      _src = [
        ...src.slice(0, from),
        ...src.slice(from + 1, src.length),
      ];
      _tgt = [
        ...tgt.slice(0, to),
        src[from],
        ...tgt.slice(to, tgt.length),
      ];
    }

    return [_src, _tgt];
  },
  uniqueId = (items = [], prefix) => {
    const mx =
      items.length === 0
        ? 1
        : Math.max(
            ...items.map((e) => Number(list.last(e.id).split('.')))
          ) + 1;
    return prefix ? `${prefix}.${mx}` : mx.toString();
  },
  valueEqual = (o1 = {}, o2 = {}) => {
    const args1 = Object.keys(o1),
      args2 = Object.keys(o2);
    return (
      args1.length === args2.length &&
      !args1.some((k) => o1[k] !== o2[k])
    );
  },
  valueSubset = (o1 = {}, o2 = {}) => {
    return !Object.keys(o1).some((k) => o1[k] !== o2[k]);
  },
  //This function takes a base 64 url encoded string, and converts it to a JSON object... using a few steps.
  decodeBase64 = (base64url) => {
    var tok;
    try {
      var base64 = base64url
        .split('.')[1]
        .replace('-', '+')
        .replace('_', '/');
      tok = JSON.parse(atob(base64));
    } catch (err) {
      tok = 'Bad Section.\nError: ' + err.message;
    }
    return tok;
  },
  emptyObj = Object.create(null);

const defaultPromise = () => Promise.resolve(Object.create(null));
//used to wrap Promise into resource for suspended Component
function wrapPromise(promise = defaultPromise) {
  let status = 'pending',
    result = '',
    suspender = promise.then(
      (r) => {
        status = 'success';
        result = r;
      },
      (e) => {
        status = 'error';
        result = { error: e };
      }
    );

  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      }
      //  else if (status === 'error') {
      //   throw result;
      // }
      return result;
    },
  };
}

class Timer {
  constructor(func, timeout) {
    this.timeout = timeout;
    this.on = false;
    this.run = '';
    this.func = (...args) => {
      func(...args);
      this.clear();
    };
  }
  start(...prm) {
    if (this.on) this.cancel();
    this.on = true;
    this.run = setTimeout(this.func, this.timeout, ...prm);
  }
  clear() {
    this.on = false;
    this.run = '';
  }
  cancel() {
    clearTimeout(this.run);
    this.clear();
  }
}

// const json = {
//   reviver(types, key, value) {
//     if (types.date.includes(key)) {
//       return value.slice(0, 10);
//     }
//     return value;
//   },
//   replacer(types, key, value) {
//     if (types.date.includes(key)) {
//       return new Date(value);
//     }
//     return value;
//   },
// };
const replacer = (key, value) => {
    // if we get a function, give us the code for that function
    if (typeof value === 'function') {
      return value.toString();
    }
    return value;
  },
  reviver = (key, value) => {
    if (typeof value === 'string') {
      if (value.indexOf('function ') === 0) return eval(`(${value})`);
      if (value.includes('=>')) {
        return eval(`${value}`);
      }
    }
    return value;
  },
  json = {
    stringify(src) {
      return JSON.stringify(src, replacer, 2);
    },
    parse(src) {
      return JSON.parse(src, reviver);
    },
  };

export class CustomError extends Error {
  constructor(err, name, code) {
    super(err.message);
    this.name = name || err.name;
    this.code = err.code || code;
  }
  toObject() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
    };
  }
}

export const wrapPage = (Comp, config) =>
  forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
      getConfig: () => {
        return config;
      },
    }));
    return <Comp {...props} />;
  });

export {
  parseJwt,
  nullableObj,
  nullableProp,
  isInside,
  propsSame,
  pallette,
  findInTree,
  findInItems,
  useDebounceValue,
  linkTo,
  classNames,
  applyModel,
  getId,
  getValue,
  hashString,
  getInitials,
  getIdValuePair,
  parseTemplate,
  getOptions,
  updateRefs,
  getQueryType,
  strToObj,
  object2String,
  string2Object,
  dateToString,
  stringToDate,
  normalizeDate,
  sortWith,
  clamp,
  moveItem,
  moveBetween,
  uniqueId,
  valueEqual,
  valueSubset,
  decodeBase64,
  wrapPromise,
  pipe,
  Timer,
  emptyObj,
  json,
  _,
};
