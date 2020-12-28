import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { withClearButton } from './helpers';

//https://www.youtube.com/watch?v=IxRJ8vplzAo
//2 modes: debounce - use debounce effect by with debounce prop set in ms,
//otherwise, notify onBlur only
const InputObservable = (props) => {
  const {
      type = 'text',
      dataid,
      value = '',
      onChange,
      throttle,
      clear,
      disabled,
      placeholder,
      className,
      style,
      tabIndex,
      autoComplete,
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
    },
    clearUp = () => {
      setVal('');
      waiting.current && clearTimeout(waiting.current);
      onChange(undefined, dataid);
    },
    comp = (
      <input
        type={type}
        value={val}
        style={style}
        className={klass}
        onChange={changed}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete ? undefined : 'off'}
        tabIndex={tabIndex}
      />
    ),
    clearFunc = (clear || val === '') && clearUp;

  useEffect(() => {
    if (value !== val) setVal(value);
  }, [value]);

  return withClearButton(comp, clearFunc, props);
};

InputObservable.propTypes = {
  type: PropTypes.string,
  dataid: PropTypes.string,
  throttle: PropTypes.number,
  name: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.bool,
  clear: PropTypes.bool,
  tabIndex: PropTypes.number,
};

export default InputObservable;
