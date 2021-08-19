import { useState } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { mergeIds } from './core/helpers';
import { InputGroup } from './core';
import { directControls, controls } from '.'; //InputGroup
import { styleItem } from './helpers';

const toObject = (str) => {
  if (!str || _.isObject(str)) return str;
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
  scope: PropTypes.string,
  ctx: PropTypes.object,
  hidden: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  meta: PropTypes.object,
  model: PropTypes.object,
  label: PropTypes.string,
  message: PropTypes.string,
  hint: PropTypes.string,
  prepend: PropTypes.string,
  children: PropTypes.any,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  loc: PropTypes.object,
  intent: PropTypes.string,
  required: PropTypes.bool,
  validator: PropTypes.object,
};
export default function FormControl({
  type,
  parent,
  id,
  dataid,
  calcid,
  scope,
  ctx,
  meta,
  model,
  label,
  prepend,
  message,
  hint,
  intent,
  style,
  loc,
  required,
  ...rest
}) {
  const Direct = directControls[type],
    Decoratable = controls.decoratable[type],
    Ctrl = Direct || Decoratable || controls[type];

  const { uom, locale, context, lookups } = ctx || {},
    ///TBD: Should shema obj or none to be pro=vided if dataid doesn't match?
    met = meta?.[dataid] || meta,
    [invalid, setInvalid] = useState(),
    value =
      rest.value ||
      model[scope] ||
      (calcid
        ? _.get(context, calcid)
        : _.get(model || ctx?.model, dataid)),
    options =
      rest.options ||
      (_.isString(met?.options)
        ? model?.[met.options]
        : lookups?.[met?.lookups]),
    did = mergeIds(parent, dataid),
    hasValue = value !== undefined || value === rest.defaultValue,
    validate = (v) => {
      if (required) rest.validator.checkRequired(v, dataid);
    },
    disabled = _.isString(rest.disabled)
      ? ctx.state?.[rest.disabled]
      : rest.disabled ?? false;

  return (
    <InputGroup
      id={id}
      role="gridcell"
      style={styleItem(loc)}
      className={classNames(['form-grid-item', rest.className], {
        direct: Direct,
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
        meta={met}
        value={value}
        invalidate={setInvalid}
        className={classNames(['form-control'], {
          left: prepend,
        })}
        prepend={prepend}
        style={toObject(style)}
        disabled={disabled}
        uom={uom}
        locale={locale}
        options={options}
        lookups={lookups}
        onModify={rest.validator ? validate : undefined}
      />
    </InputGroup>
  );
}
