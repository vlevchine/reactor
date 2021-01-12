import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { unitTransformer } from '@app/utils/units';
import { Decorator } from '../helpers';
import InputGeneric from './input_generic';
import './styles.css';

const toString = (v, format) => {
    const val = parseFloat(v);
    return Number.isNaN(val) ? v : format(val);
  },
  numStyles = { currency: 'currency', percent: 'perceent' },
  numStyle = (type) => numStyles[type] || 'decimal',
  fractional = (num = 2, type) =>
    type === 'currency' ? Math.min(2, num) : num;
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
      locale = 'en-CA',
      uom,
      def,
      blend,
    } = props,
    numType = def.type || 'Float',
    parser = Number[`parse${numType}`],
    { type } = def.directives?.unit || {},
    formatter = new Intl.NumberFormat(locale, {
      style: numStyle(type), //currrency, percent, or decimal
      maximumFractionDigits: fractional(3),
      currency: 'USD', //???
      currencyDisplay: 'symbol',
    }),
    [val, setVal] = useState(() =>
      type ? unitTransformer.to(value, type, uom) : value
    ),
    lbl = useRef(type && unitTransformer.getLabel(type, uom)),
    onBlur = (v) => {
      const _v = parser(v),
        n_v = Number.isNaN(_v)
          ? undefined
          : type
          ? unitTransformer.from(_v, type, uom)
          : _v;
      n_v !== value && onChange?.(n_v, dataid);
      console.log(toString(n_v, formatter.format));
    };

  useEffect(() => {
    if (type) {
      lbl.current = unitTransformer.getLabel(type, uom);
      setVal(unitTransformer.to(value, type, uom));
    }
  }, [value, uom]);

  return (
    <Decorator
      id={dataid}
      clear={clear}
      icon={icon}
      info={info || lbl.current}
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
