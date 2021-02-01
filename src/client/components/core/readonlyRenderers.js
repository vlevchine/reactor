import { _ } from '@app/helpers';
import { createTypedValue } from '@app/utils/numberUnits';
import { IconSymbol, Tag } from '.';

const numStyles = { currency: 'currency', percent: 'percent' },
  numStyle = (type) => numStyles[type] || 'decimal',
  fractional = (num = 2, type) =>
    type === 'currency' ? Math.min(2, num) : num;

export const numberFormatter = (locale, type) =>
  new Intl.NumberFormat(locale, {
    style: numStyle(type), //currrency, percent, or decimal
    maximumFractionDigits: fractional(3),
    currency: 'USD', //???
    currencyDisplay: 'symbol',
  });

const renderers = {
  String: () => (v) => v || 'N/A',
  Float: (locale, def, $, uom) => {
    const formatter = numberFormatter(locale, def.type),
      unit = def.directives?.unit?.type;
    return (v) => {
      return _.isNil(v)
        ? 'N/A'
        : createTypedValue(unit, v)?.toFormattedString(
            formatter,
            uom
          ) ?? formatter.format(v);
    };
  },
  Int: (locale) => (v) => {
    return _.isNil(v) ? 'N/A' : v.toLocaleString(locale);
  },
  Date: (locale) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return (v) => v.toLocaleDateString(locale, options);
  },
  ID: (locale, def, lookups) => {
    const ref = _.toObject(
      'id',
      (e) => e.name
    )(lookups[def.ref]?.value);
    return (v) => (v ? ref[v] || 'Not found' : 'N/A');
  },
  Tag: (locale, def, lookups) => {
    const ref = _.toObject(
      'id',
      (e) => e.name
    )(lookups[def.ref]?.value);
    return (v) => {
      const val = ref[v] || 'Not found';
      return v ? (
        <Tag text={val} intent="info" style={{ width: '7rem' }} />
      ) : (
        'N/A'
      );
    };
  },
  Boolean: () => (v) => (
    <IconSymbol
      name={v ? 'checked' : 'unchecked'}
      size="lg"
      styled="l"
    />
  ),
  Link: ($, $1, $2, $3, col) => (v, val) => {
    return <a href={`/${col.path}/${val.id}`}>{v}</a>;
  },
};

export const renderer = (def = {}, locale, uom, lookups, col) => {
  const renderer =
    renderers[col.display] || renderers[def.type] || _.identity;
  return renderer(locale, def, lookups, uom, col);
};
