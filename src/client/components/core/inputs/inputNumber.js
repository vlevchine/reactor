import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { createTypedValue } from '@app/utils/numberUnits';
//import { numberFormatter } from '@app/utils/number';
import { Decorator, ClearButton } from '..';
import InputGeneric from './input_generic';
import './styles.css';

InputNumber.propTypes = {
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

export default function InputNumber(props) {
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
      // locale = 'en-CA',
      uom,
      meta,
      blend,
      intent,
    } = props,
    { type } = meta?.directives?.unit || {},
    unitVal = useRef(createTypedValue(type, value)),
    [val, setVal] = useState(() => unitVal.current.toUnitSystem(uom)),
    onBlur = (v) => {
      const _v = Number(v),
        n_v = Number.isNaN(_v)
          ? undefined
          : type
          ? unitVal.current.fromUnitSystem(_v, uom).valueOf()
          : _v;
      n_v !== value && onChange?.(n_v, dataid);
      // console.log(toString(n_v, formatter.format));
    },
    text = unitVal.current.getLabel(uom);

  useEffect(() => {
    setVal(unitVal.current.toUnitSystem(uom));
  }, [uom]);
  useEffect(() => {
    if (unitVal.current.valueOf !== value)
      setVal(unitVal.current.toUnitSystem(uom));
  }, [value]);

  return (
    <Decorator
      prepend={prepend}
      append={append || text}
      appendType={text ? 'text' : 'icon'}
      blend={blend}
      onChange={onBlur}
      className={className}
      hasValue={!_.isNil(value)}
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
        clear={clear && !disabled}
        id={dataid}
        onChange={onChange}
      />
    </Decorator>
  );
}
