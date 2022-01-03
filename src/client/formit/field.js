import { useState } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { InputGroup } from '@app/components/core';
import { renderer, isDirect } from './renderers'; //InputGroup
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
  },
  testSpec = (obj, spec = '') => {
    const toks = spec.split('!');
    return toks.length === 2 && !toks[0]
      ? !obj[toks[1]]
      : obj[toks[0]];
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
  hidden: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.bool,
    PropTypes.string,
  ]),
  meta: PropTypes.object,
  state: PropTypes.object,
  model: PropTypes.object,
  label: PropTypes.string,
  message: PropTypes.string,
  hint: PropTypes.string,
  prepend: PropTypes.string,
  horizontal: PropTypes.bool,
  children: PropTypes.any,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  compStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ]),
  loc: PropTypes.object,
  intent: PropTypes.string,
  required: PropTypes.bool,
  readonly: PropTypes.bool,
  validator: PropTypes.object,
};
export default function FormControl({
  type,
  parent,
  id,
  dataid,
  calcid,
  ctx,
  meta,
  model,
  state,
  label,
  prepend,
  message,
  hint,
  intent,
  style,
  compStyle,
  loc,
  readonly,
  hidden,
  horizontal,
  ...rest
}) {
  const Ctrl = renderer(type),
    direct = isDirect(type), // readonly ||
    { uom, locale, lookups } = ctx || {};
  ///TBD: Should shema obj or none to be pro=vided if dataid doesn't match?
  const [invalid, setInvalid] = useState(),
    value =
      rest.value ||
      _.getIn(model || ctx?.model, state?.[calcid] || dataid, true);
  const met = meta?.[dataid] || meta,
    _options = rest.options || met?.options,
    options = _.isString(_options)
      ? state?.[_options] || model?.[_options]
      : _options || lookups?.[met?.lookups],
    did = _.dotMerge(parent, dataid),
    hasValue = value !== undefined || value === rest.defaultValue,
    disabled = _.isString(rest.disabled)
      ? testSpec(state, rest.disabled)
      : rest.disabled ?? false,
    hideIt =
      hidden &&
      (_.isString(hidden)
        ? testSpec(state, hidden)
        : _.isFunction(hidden)
        ? hidden(state)
        : true);
  const styl = Object.assign(styleItem(loc), style);

  return hideIt ? null : (
    <InputGroup
      id={id}
      role="gridcell"
      style={styl}
      className={classNames(['form-grid-item'], {
        direct,
        ['no-pad']: readonly || direct,
        ['has-value']: hasValue || invalid,
        ['lbl-horizontal']: horizontal,
      })}
      intent={invalid ? 'danger' : intent}
      transient={!direct}
      readonly={readonly}
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
        className={classNames(['form-control', rest.className], {
          disabled,
          left: prepend,
        })}
        prepend={prepend}
        style={toObject(compStyle)}
        disabled={disabled}
        readonly={readonly}
        uom={uom}
        locale={locale}
        options={options}
        lookups={lookups}
      />
    </InputGroup>
  );
}
