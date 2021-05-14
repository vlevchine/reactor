import { useState } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
//import { numberFormatter } from '@app/utils/number';
import { Decorator, ClearButton, Select } from '..';
import InputGeneric from './input_generic';
import './styles.css';

const units = [
    { id: 'h', label: 'Hours' },
    { id: 'd', label: 'Days' },
  ],
  def_unit = units[1].id,
  s_hour = 3600,
  s_day = 24 * s_hour,
  toDuration = (v, unit) => {
    const _v = Number(v);
    return Number.isNaN(_v)
      ? undefined
      : _v / (unit === 'h' ? s_hour : s_day);
  },
  fromDuration = (v, unit) => {
    const _v = Number(v);
    return Number.isNaN(_v)
      ? undefined
      : _v * (unit === 'h' ? s_hour : s_day);
  };

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
  blend: PropTypes.bool,
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
      blend,
      intent,
    } = props,
    [unit, setUnit] = useState(def_unit),
    val = toDuration(value, unit),
    report = (v, uid) => {
      const n_v = fromDuration(v, uid);
      n_v !== value && onChange?.(n_v, dataid);
    },
    onBlur = (v) => {
      report(v, unit);
    },
    onUnit = (id) => {
      setUnit(id);
      report(val, id);
    },
    hasValue = !_.isNil(value);

  return (
    <Decorator
      prepend={prepend}
      append={append}
      blend={blend}
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
      <Select blend options={units} value={unit} onChange={onUnit} />
    </Decorator>
  );
}
