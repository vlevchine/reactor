import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import { unitTransformer } from '@app/utils/units';
import { Decorator } from './helpers';

const use = ['disabled', 'name', 'tabIndex', 'autoComplete'],
  toString = (v, format) => {
    const val = parseFloat(v);
    return Number.isNaN(val) ? v : format(val);
  },
  numStyles = { currency: 'currency', percent: 'perceent' },
  numStyle = (type) => numStyles[type] || 'decimal',
  fractional = (num = 2, type) =>
    type === 'currency' ? Math.min(2, num) : num;
InputNumber.propTypes = {
  type: PropTypes.string,
  dataid: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.string,
  info: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onModify: PropTypes.func,
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
};

export default function InputNumber(props) {
  const {
      dataid,
      value,
      onChange,
      info,
      icon,
      clear,
      fill,
      className,
      style,
      locale = 'en-CA',
      uom,
      def,
      ...rest
    } = props,
    other = _.pick(rest, use),
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
    [edit, setEdit] = useState(false),
    klass = classNames([className, 'input'], { fill }),
    changed = ({ target }) => {
      setVal(target.value);
    },
    onFocus = () => {
      setEdit(true);
    },
    onBlur = () => {
      const v = parser(val),
        n_v = Number.isNaN(v)
          ? undefined
          : type
          ? unitTransformer.from(v, type, uom)
          : v;
      n_v !== value && onChange?.(n_v, dataid);
      setEdit(false);
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
      // onChange={onChange}
      clear={clear}
      icon={icon}
      info={info || lbl.current}
      fill={fill}
      style={style}
      styled="l">
      <input
        {...other}
        type="number"
        value={edit ? val : ''}
        placeholder={toString(val, formatter.format)}
        className={klass}
        onChange={changed}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    </Decorator>
  );
}
