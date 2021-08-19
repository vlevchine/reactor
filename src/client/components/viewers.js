import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { createTypedValue } from '@app/utils/numberUnits';
import { formatter } from '@app/utils/formatter';
import { IconSymbol, Tag, Checkbox } from './core';

export const viewers = {
  TextInput: ({ value }) => {
    return <span className="text-dots">{_.toString(value)}</span>;
  },
  TextArea: ({ value }) => {
    return <span className="text-dots">{_.toString(value)}</span>;
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

viewers.TextInput.propTypes = {
  value: PropTypes.string,
};
viewers.TextArea.propTypes = viewers.TextInput.propTypes;
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

export const getViewer = (type) => {
  return viewers[type];
};
