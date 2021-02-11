import { useState, useMemo } from 'react';

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
    isEqual(src, val) {
      //shallow!!!
      const srcKeys = Object.keys(src),
        valKeys = Object.keys(val);
      return (
        srcKeys.length === valKeys.length &&
        srcKeys.every((s) => src[s] === val[s])
      );
    },
    get(src, path = [], def) {
      if (!src) return;
      const pth = Array.isArray(path) ? path : path.split('.');
      return pth.reduce((acc, e) => acc?.[e], src) ?? def;
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
    intersection(arr, vals) {
      return arr.filter((e) => vals.includes(e));
    },
    intersect(arr, vals) {
      return list.intersection(arr, vals).length > 0;
    },
    sum(arr, init = 0) {
      return arr.reduce((acc, e) => acc + e, init);
    },
    sumBy(arr, accessor = identity, init = 0) {
      return arr.reduce((acc, e) => acc + accessor(e), init);
    },
    toObject(prop, fn = identity) {
      return (arr) =>
        arr.reduce(
          (acc, e) => ({ ...acc, [e[prop]]: fn(e) }),
          Object.create(null)
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
      compose,
      pipe,
      curry,
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

const classNames = (stat = [], dyn = {}) => {
  const extra = _.isString(dyn)
      ? dyn.split(' ')
      : Object.keys(dyn).filter((k) => dyn[k]),
    st = stat.filter((e) => !!e);
  return [...st, ...extra].join(' ');
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

const json = {
  reviver(types, key, value) {
    if (types.date.includes(key)) {
      return value.slice(0, 10);
    }
    return value;
  },
  replacer(types, key, value) {
    if (types.date.includes(key)) {
      return new Date(value);
    }
    return value;
  },
};

class CustomError extends Error {
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
  CustomError,
};
