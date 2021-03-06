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

const map = {
    Checkbox: 'Boolean',
    Select: 'ID',
  },
  editors = {
    String: TextInput,
    Float: NumberInput,
    Int: NumberInput,
    Date: DateInput,
    Boolean: Checkbox,
    ID: Select, // Tag:
  };

const viewers = {
  String: ({ value }) => {
    return (
      <span className="text-dots">{value?.toString() || ''}</span>
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
  Link: ({ value, id, href }) => {
    return (
      <a className="text-dots" href={href ? `${href}/${id}` : '#'}>
        {value}
      </a>
    );
  },
  ID: ({ value, lookups, wrapped, display }) => {
    const val = wrapped
      ? lookups.find((e) => e.id === value)?.[display]
      : lookups.find((e) => e === value);
    return <span className="text-dots">{val ?? ''}</span>;
  },
  Tag: ({ value, lookups }) => {
    const val =
      lookups.find((e) => e.id === value)?.name || 'Not found';
    return value ? (
      <Tag text={val} intent="success" style={{ width: '7rem' }} />
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
  id: PropTypes.string,
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
  wrapped: PropTypes.bool,
  display: PropTypes.string,
};

// eslint-disable-next-line react/prop-types
const render = (Comp, props) => ({ value, onChange, id }) => {
  return (
    <Comp {...props} value={value} onChange={onChange} id={id} />
  );
};
export const renderer = (def, schema, lookups) => {
  const { id, route, use, options, display } = def,
    { ref, type, unit } = schema?.[id] || {},
    v_type = map[use] || type,
    Comp = viewers[v_type] || viewers.String,
    opts = options || lookups?.[ref],
    props = {
      lookups: opts,
      wrapped: !!opts?.[0].id,
      display: display || 'name',
      unit: unit?.type,
      href: route || '',
      id,
    };

  return render(Comp, props);
};

export const editor = (def, schema, lookups, locale, uom) => {
  const { id, options, use, display } = def,
    sch = schema?.[id] || {},
    { ref, type } = sch,
    opts = options || lookups?.[ref],
    Comp = editors[map[use] || type] || editors['String'],
    props = {
      dataid: id,
      def: sch,
      options: opts,
      wrapped: !!opts?.[0].id,
      //unless otherwise specified, Selects will display 'name'prop
      // as lookups are expected to have 'name' prop
      display: display || 'name',
      locale,
      uom,
    };

  return render(Comp, props);
};
