import { _ } from '@app/helpers';
import numeral from 'numeral';

const { isString, isArray, intersection, last } = _;
const joinClasses = (stat = [], dyn = {}) => {
    const vals = isString(stat) ? [stat] : stat,
      applied = Object.keys(dyn).filter((e) => !!dyn[e]),
      res = [...vals, ...applied].filter((e) => !!e);

    return res.length > 0 ? res.join(' ') : null;
  },
  normalizeUrl = (url, key = '', query) => {
    const pathname = [
      '',
      ...url.split('/').filter((e) => !!e),
      key,
    ].join('/');
    return query
      ? {
          pathname,
          search: `?${Object.keys(query)
            .map((k) => `${k}=${query[k]}`)
            .join('&')}`,
        }
      : pathname;
  },
  queryString2Object = (query, defaultVal) =>
    query && query.startsWith('?')
      ? query
          .substring(1)
          .split('&')
          .reduce((acc, e) => {
            var ks = e.split('=');
            acc[ks[0]] = ks[1];
            return acc;
          }, {})
      : defaultVal,
  cellInGrid = (e, i = 0) => {
    const { row = 1, col = 1, rowSpan = 1, colSpan = 1 } = e;
    return {
      gridArea: `${row + i}/${col}/${row + i + rowSpan}/${
        col + colSpan
      }`,
    };
  },
  cellFullSize = (rows = 1, cols = 1, shift = 0) => ({
    gridArea: `${1 + shift}/1/${rows + shift + 1}/${cols + 1}`,
  }),
  funcs = {
    gt: (x, y) => x > y,
    gte: (x, y) => x >= y,
    lt: (x, y) => x < y,
    lte: (x, y) => x <= y,
    eq: (x, y) => x === y,
    in: (x, set) => set.includes(x),
    off: (x, set) => !set.includes(x),
  },
  selectOptions = (options, predicate) => {
    if (!predicate) return [...options];
    const { op, val } = predicate,
      func = funcs[op];
    return predicate
      ? options.filter((o) => func(o.value, val))
      : options;
  },
  cloneOneLevel = (obj = {}, props) => {
    const ownProps = Object.keys(obj),
      cloning = isArray(props)
        ? intersection(ownProps, props)
        : ownProps;
    return cloning.reduce(
      (acc, e) => ({
        ...acc,
        [e]: isArray(obj[e]) ? [...obj[e]] : obj[e],
      }),
      {}
    );
  },
  locationKeys = (path, key) => {
    const keys = path.split('/').filter((k) => !!k),
      ind = keys.indexOf(key);
    return ind > -1 ? keys.slice(ind + 1) : [];
  },
  dLbl = ['d', 'hr', 'min', 'sec'];

numeral.register('format', 'thousands', {
  regexps: {
    format: /(d)/,
    unformat: /(d)/,
  },
  format: function (value) {
    //, format, roundingFunction
    if (value === 0) return 0 + last(dLbl);
    const m = Math.floor(value / 60),
      sec = value - m * 60,
      h = Math.floor(m / 60),
      min = m - h * 60,
      d = Math.floor(h / 24),
      hr = h - d * 24,
      span = [d, hr, min, sec.toFixed(0)],
      ind = span.findIndex((e) => e > 0);
    return span
      .slice(ind)
      .map((e, i) => e + dLbl[i + ind])
      .join(' ');
  },
});

const formats = {
    integer: (val) => numeral(val).format('0,0'),
    number: (val) => numeral(val).format('0,0.00'),
    percent: (val) => numeral(val).format('0.00%'),
    duration: (val) => numeral(val).format('00:00:00'),
  },
  formatValue = (val, type, fmt) =>
    fmt
      ? numeral(val).format(fmt)
      : formats[type]
      ? formats[type](val)
      : val;

export {
  joinClasses,
  normalizeUrl,
  queryString2Object,
  cellInGrid,
  cellFullSize,
  funcs,
  selectOptions,
  cloneOneLevel,
  locationKeys,
  formatValue,
};
