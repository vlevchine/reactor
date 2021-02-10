import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { createTypedValue } from '@app/utils/numberUnits';
import {
  IconSymbol,
  Tag,
  Input,
  InputNumber,
  Select,
  DateInput,
  Checkbox,
} from '.';

const numStyles = { currency: 'currency', percent: 'percent' },
  numStyle = (type) => numStyles[type] || 'decimal',
  fractional = (num = 2, type) =>
    type === 'currency' ? Math.min(2, num) : num,
  dateOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

const setNumberFormatter = (locale, type) =>
  new Intl.NumberFormat(locale, {
    style: numStyle(type), //currrency, percent, or decimal
    maximumFractionDigits: fractional(3),
    currency: 'USD', //???
    currencyDisplay: 'symbol',
  });

const viewers = {
  String: ({ value }) => {
    return (
      <span className="text-dots">{value?.toString() || 'N/A'}</span>
    );
  },
  Float: ({ value, uom, unit, formatter }) => {
    return _.isNil(value)
      ? 'N/A'
      : createTypedValue(unit, value)?.toFormattedString(
          formatter,
          uom
        ) ?? formatter.format(value);
  },
  Int: ({ value, locale }) => {
    return _.isNil(value) ? 'N/A' : value.toLocaleString(locale);
  },
  Date: ({ value, locale }) => {
    return value
      ? value.toLocaleDateString(locale, dateOptions)
      : 'N/A';
  },
  Boolean: ({ value }) => (
    <IconSymbol
      name={value ? 'checked' : 'unchecked'}
      size="lg"
      styled="l"
    />
  ),
  Link: ({ value, def }) => {
    return (
      <a className="text-dots" href={`/${def.path}/${def.id}`}>
        {value}
      </a>
    );
  },
  ID: ({ value, lookups }) => {
    return (
      <span className="text-dots">
        {value
          ? lookups.find((e) => e.id === value)?.name || 'Not found'
          : 'N/A'}
      </span>
    );
  },
  Tag: ({ value, lookups }) => {
    const val =
      lookups.find((e) => e.id === value)?.name || 'Not found';
    return value ? (
      <Tag text={val} intent="info" style={{ width: '7rem' }} />
    ) : (
      'N/A'
    );
  },
};

viewers.String.propTypes = {
  value: PropTypes.string,
};
viewers.Boolean.propTypes = {
  value: PropTypes.bool,
};
viewers.Link.propTypes = {
  value: PropTypes.any,
  path: PropTypes.string,
  def: PropTypes.object,
};
viewers.Tag.propTypes = {
  value: PropTypes.string,
  lookups: PropTypes.array,
};
viewers.ID.propTypes = {
  value: PropTypes.string,
  lookups: PropTypes.array,
};
export const getRenderer = (type, display) =>
  viewers[display] || viewers[type] || viewers['String'];

// eslint-disable-next-line react/prop-types
const render = (Comp, props) => ({ value, onChange }) => {
  return <Comp {...props} value={value} onChange={onChange} />;
};
export const renderer = (def, schema, lookups, locale, uom) => {
  const { ref, type, directives } = schema,
    Comp = getRenderer(type, def.display),
    props = {
      schema,
      def,
      lookups: lookups[ref]?.value,
      locale,
      uom,
      unit: directives?.unit?.type,
      formatter:
        type === 'Float' && setNumberFormatter(locale, schema.type),
    };

  return render(Comp, props);
};

const editors = {
  String: Input,
  Float: InputNumber,
  Int: InputNumber,
  Date: DateInput,
  Boolean: Checkbox,
  ID: Select,
  // Tag:
};

export const editor = (id, schema, lookups, locale) => {
  const { ref, type } = schema,
    Comp = editors[type] || editors['String'],
    props = {
      dataid: id,
      def: schema,
      options: lookups[ref]?.value,
      display: 'name',
      locale,
    };

  return render(Comp, props);
};
