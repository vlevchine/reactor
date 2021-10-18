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
  };

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

const utils = {
  CustomError,
  parseJwt,
  nullableObj,
  nullableProp,
  isInside,
  propsSame,
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
  Timer,
  json,
};
module.exports = utils;
