import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { createTypedValue } from '@app/utils/numberUnits';
import { formatter } from '@app/utils/formatter';
import {
  IconSymbol,
  Tag,
  TextInput,
  NumberInput,
  Select,
  DateInput,
  Checkbox,
} from '.';

const editors = {
  String: TextInput,
  Float: NumberInput,
  Int: NumberInput,
  Date: DateInput,
  Boolean: Checkbox,
  ID: Select,
  // Tag:
};

const viewers = {
  String: ({ value }) => {
    return (
      <span className="text-dots">{value?.toString() || 'N/A'}</span>
    );
  },
  Float: ({ value, unit }) => {
    return _.isNil(value)
      ? 'N/A'
      : formatter.uom.format(createTypedValue(unit, value)) ??
          formatter.decimal.format(value);
  },
  Int: ({ value }) => {
    return _.isNil(value) ? 'N/A' : formatter.decimal.format(value);
  },
  Date: ({ value }) => {
    const frm = formatter.date;
    return value ? frm.format(value) : 'N/A';
  },
  Boolean: ({ value }) => (
    <IconSymbol
      name={value ? 'checked' : 'unchecked'}
      size="lg"
      styled="l"
    />
  ),
  Link: ({ value, _id, href }) => {
    return (
      <a className="text-dots" href={href ? `${href}/${_id}` : '#'}>
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
  Checkbox: Checkbox,
};

viewers.String.propTypes = {
  value: PropTypes.string,
};
viewers.Boolean.propTypes = {
  value: PropTypes.bool,
};
viewers.Link.propTypes = {
  value: PropTypes.any,
  _id: PropTypes.string,
  href: PropTypes.string,
  source: PropTypes.object,
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
const render = (Comp, props) => ({ value, onChange, _id }) => {
  return (
    <Comp {...props} value={value} onChange={onChange} _id={_id} />
  );
};
export const renderer = (def, schema, lookups, edit) => {
  const { ref, type, directives } = schema,
    Comp = getRenderer(type, def.display),
    props = {
      lookups: lookups[ref]?.value,
      unit: directives?.unit?.type,
      href: edit || '',
      dataid: def.id,
    };

  return render(Comp, props);
};

export const editor = (id, schema = {}, lookups, locale, uom) => {
  const { ref, type } = schema,
    Comp = editors[type] || editors['String'],
    props = {
      dataid: id,
      def: schema,
      options: lookups[ref]?.value,
      display: 'name',
      locale,
      uom,
    };

  return render(Comp, props);
};
