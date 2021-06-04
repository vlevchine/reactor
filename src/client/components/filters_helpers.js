import { _ } from '@app/helpers'; //, classNames, useMemo, useRef, useEffect

const map = {
    String: 'TextInput',
    ID: 'Select',
    '[ID]': 'MultiSelect',
    Boolean: 'TriState',
    Float: 'NumberInput',
  },
  textOptions = [
    { id: 'startsWith', name: 'Starts with' },
    { id: 'endsWith', name: 'Ends with' },
    { id: 'includes', name: 'Includes' },
  ];

export const mapper = (type) => {
  return map[type] || 'Input';
};

export const parse = (filters, data, lookups) =>
  _.isEmpty(data)
    ? [['None applied...']]
    : filters
        .filter((f) => data[f.id] !== undefined)
        .map(({ id, ref, type, label, text }) => {
          let dt = data[id],
            lkps = lookups[ref] || [],
            multi = _.isArray(dt),
            sep = multi ? ' one of ' : ' ';
          if (type === 'Boolean') dt = dt ? '\u2714' : '\u2716';
          if (type === 'String' && dt.value) {
            sep = textOptions.find((o) => o.id === dt.type)?.name;
            dt = dt.value;
          }
          if (type === 'ID') dt = lkps.find((e) => e.id === dt)?.name;
          if (multi)
            dt = dt
              .map((d) => lkps?.find((e) => e.id === d)?.name)
              .filter(Boolean)
              .map((e) =>
                e.length > 10 ? `${e.slice(0, 12)}...` : e
              )
              .join(', ');
          return [`${label || text}: `, sep, `${dt};`];
        });

export const toFilters = ({ items = [], columns, schema, lookups }) =>
  items.map(({ id, multi }) => {
    const title = columns.find((c) => c.id === id)?.title,
      { type, ref } = schema[id] || {},
      res = {
        id,
        type,
        ref,
        options:
          type === 'String' ? textOptions : lookups[ref]?.value,
      };
    res[type === 'Boolean' ? 'text' : 'label'] = title;
    if (multi) res.type = `[${type}]`;
    return res;
  });
