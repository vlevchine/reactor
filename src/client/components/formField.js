import { useState } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { mergeIds } from './core/helpers';
import { InputGroup } from './core';
import { directControls, controls } from '.'; //InputGroup
import { styleItem } from './helpers';

const toObject = (str) => {
  if (!str) return str;
  const toks = str
    .split(';')
    .filter(Boolean)
    .map((e) => {
      const [n, v] = e.trim().split(':');
      return [_.toCamelCase(n), v.trim()];
    });
  return Object.fromEntries(toks);
};

//Field is a wrapper over InputWrapper to be used inFormit
//to show HTML components those will be placed as children,
//core components will be accessed via type
FormControl.propTypes = {
  type: PropTypes.string,
  parent: PropTypes.string,
  id: PropTypes.string,
  dataid: PropTypes.string,
  calcid: PropTypes.string,
  ctx: PropTypes.object,
  hidden: PropTypes.oneOf([PropTypes.string, PropTypes.func]),
  schema: PropTypes.object,
  model: PropTypes.object,
  label: PropTypes.string,
  message: PropTypes.string,
  hint: PropTypes.string,
  prepend: PropTypes.string,
  children: PropTypes.any,
  style: PropTypes.string,
  loc: PropTypes.object,
  row: PropTypes.object,
  column: PropTypes.object,
  intent: PropTypes.string,
};
export default function FormControl({
  type,
  parent,
  id,
  dataid,
  calcid,
  ctx = {},
  schema,
  model,
  label,
  prepend,
  message,
  hint,
  intent,
  style,
  row,
  column,
  loc,
  ...rest
}) {
  const Direct = directControls[type],
    Decoratable = controls.decoratable[type],
    Ctrl = Direct || Decoratable || controls[type];

  const { nav = {}, context, lookups } = ctx, //!!!!resources,roles, schema
    { uom, locale } = nav,
    meta = dataid ? schema?.[dataid] : schema,
    [invalid, setInvalid] = useState(),
    value = calcid
      ? _.get(context, calcid)
      : _.get(model || ctx?.model, dataid),
    options = meta
      ? _.isString(meta.options)
        ? model[meta.options]
        : lookups[meta.ref]
      : rest.options,
    did = mergeIds(parent, dataid),
    hasValue = value !== undefined || rest.defaultValue;

  return (
    <InputGroup
      id={id}
      role="gridcell"
      style={styleItem(row || loc, column || loc)}
      className={classNames(['form-grid-item', rest.className], {
        ['has-value']: hasValue || invalid,
      })}
      intent={invalid ? 'danger' : intent}
      transient={!Direct}
      label={label}
      hint={hint}
      message={invalid ? 'Incorrect value' : message}>
      <Ctrl
        {...rest}
        id={did || id}
        dataid={did}
        meta={meta}
        value={value}
        invalidate={setInvalid}
        className={classNames(['form-control'], {
          left: prepend,
        })}
        prepend={prepend}
        style={toObject(style)}
        uom={uom}
        locale={locale}
        options={options}
      />
    </InputGroup>
  );
}
