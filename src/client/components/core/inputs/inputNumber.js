import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { createTypedValue } from '@app/utils/numberUnits';
//import { numberFormatter } from '@app/utils/number';
import { Decorator } from '..';
import InputGeneric from './input_generic';
import './styles.css';

InputNumber.propTypes = {
  dataid: PropTypes.string,
  name: PropTypes.string,
  info: PropTypes.string,
  icon: PropTypes.string,
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
  def: PropTypes.object,
  tabIndex: PropTypes.number,
  blend: PropTypes.bool,
};

export default function InputNumber(props) {
  const {
      dataid,
      value,
      onChange,
      icon,
      info,
      clear,
      className,
      style,
      // locale = 'en-CA',
      uom,
      def,
      blend,
    } = props,
    { type } = def.directives?.unit || {},
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
    };

  useEffect(() => {
    setVal(unitVal.current.toUnitSystem(uom));
  }, [uom]);
  useEffect(() => {
    if (unitVal.current.valueOf !== value)
      setVal(unitVal.current.toUnitSystem(uom));
  }, [value]);

  return (
    <Decorator
      id={dataid}
      clear={clear}
      icon={icon}
      info={info || unitVal.current.getLabel(uom)}
      blend={blend}
      onChange={onBlur}
      className="input-wrapper"
      hasValue={!_.isNil(value)}
      style={style}>
      <InputGeneric
        kind="input"
        type="number"
        value={val}
        dataid={dataid}
        onChange={onBlur}
        // placeholder={toString(val, formatter.format)        }
        className={className}
      />
    </Decorator>
  );
}
