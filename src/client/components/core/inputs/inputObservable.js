import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Decorator } from '../helpers';

InputObservable.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  dataid: PropTypes.string,
  throttle: PropTypes.number,
  name: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.bool,
  clear: PropTypes.bool,
  tabIndex: PropTypes.number,
  icon: PropTypes.string,
  info: PropTypes.string,
  fill: PropTypes.bool,
  placeholder: PropTypes.string,
};

export default function InputObservable(props) {
  const {
      dataid,
      value = '',
      onChange,
      onBlur,
      throttle,
      className,
      style,
      placeholder,
      ...rest
    } = props,
    [val, setVal] = useState(value),
    waiting = useRef(),
    klass = classNames([className, 'input']),
    changed = ({ target }) => {
      setVal(target.value);
      if (throttle) {
        if (!waiting.current) {
          waiting.current = setTimeout(() => {
            waiting.current = undefined;
            onChange(target.value, dataid);
          }, throttle);
        }
      } else onChange(target.value, dataid);
    };

  useEffect(() => {
    if (value !== val) setVal(value);
  }, [value]);

  return (
    <Decorator
      id={dataid}
      onChange={onChange}
      onBlur={onBlur}
      {...rest}
      style={style}
      styled="l">
      <input
        value={val}
        className={klass}
        onChange={changed}
        placeholder={placeholder}
      />
    </Decorator>
  );
}
