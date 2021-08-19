import { useState } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
//import { numberFormatter } from '@app/utils/number';
import { Decorator, ClearButton, Select, Readonly } from '..';
import InputGeneric from './input_generic';
import './styles.css';

const units = [
    { id: 'h', label: 'Hours', a: 3600 },
    { id: 'd', label: 'Days', a: 86400 },
  ],
  toDuration = (v, u) => {
    const _v = Number(v);
    return Number.isNaN(_v) ? undefined : _v / u.a;
  },
  fromDuration = (v, u) => {
    const _v = Number(v);
    return Number.isNaN(_v) ? undefined : _v * u.a;
  },
  toString = (v, u) =>
    v ? [v.toFixed(1), u.label].join('.') : undefined;

Duration.propTypes = {
  dataid: PropTypes.string,
  name: PropTypes.string,
  append: PropTypes.string,
  prepend: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  onChange: PropTypes.func,
  fill: PropTypes.bool,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.bool,
  clear: PropTypes.bool,
  locale: PropTypes.string,
  uom: PropTypes.string,
  meta: PropTypes.object,
  tabIndex: PropTypes.number,
  intent: PropTypes.string,
  readonly: PropTypes.bool,
};

// function onDispatch(state, { value, unit }) {
//   return unit
//     ? { val: toDuration(state.val, unit), unit }
//     : { val: toDuration(value, state.unit), unit: state.unit };
// }
export default function Duration(props) {
  const {
      dataid,
      value,
      onChange,
      prepend,
      append,
      clear,
      disabled,
      className,
      style,
      readonly,
      intent,
    } = props,
    [unit, setUnit] = useState(units[1].id),
    itemUnit = units.find((e) => e.id === unit),
    val = toDuration(value, itemUnit),
    report = (v) => {
      const n_v = fromDuration(v, itemUnit);
      n_v !== value && onChange?.(n_v, dataid);
    },
    onBlur = (v) => {
      report(v, unit);
    },
    hasValue = !_.isNil(value);

  return readonly ? (
    <Readonly txt={toString(val, itemUnit)} />
  ) : (
    <Decorator
      prepend={prepend}
      append={append}
      onChange={onBlur}
      className={className}
      hasValue={hasValue}
      intent={intent}
      style={style}>
      <InputGeneric
        kind="input"
        type="number"
        value={val}
        disabled={disabled}
        dataid={dataid}
        onChange={onBlur}
        // placeholder={toString(val, formatter.format)        }
      />
      <ClearButton
        clear={clear}
        id={dataid}
        disabled={disabled || !hasValue}
        onChange={onChange}
        minimal
      />
      <Select options={units} value={unit} onChange={setUnit} />
    </Decorator>
  );
}
