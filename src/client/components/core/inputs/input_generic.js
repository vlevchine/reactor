import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';

const useThrottle = (throttle, onModify) => {
  return useMemo(() => {
    let to;
    const res = { value: '' };
    const changed = (value) => {
      res.value = value;
      if (!to) {
        to = setTimeout(() => {
          to = undefined;
          onModify(res.value);
        }, throttle);
      }
    };
    return throttle > 0 ? changed : onModify;
  }, []);
};

InputGeneric.propTypes = {
  type: PropTypes.string,
  kind: PropTypes.string,
  id: PropTypes.string,
  dataid: PropTypes.string,
  throttle: PropTypes.number,
  name: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.bool,
  placeholder: PropTypes.string,
};

export default function InputGeneric(props) {
  const {
      type = 'text',
      kind = 'input',
      dataid,
      value = '',
      name,
      onChange,
      throttle,
      className,
      style,
      placeholder,
      disabled,
    } = props,
    Ctrl = kind,
    [val, setVal] = useState(value),
    klass = classNames([className, 'input']),
    onBlur = () => {
      const v = val === '' ? undefined : val;
      reportChange(v);
    },
    reportChange = (v) => {
      v !== value && onChange?.(v, dataid);
    },
    onKeyDown = (ev) => {
      if (ev.keyCode === 13) onBlur();
    },
    onModify = _.isNil(throttle)
      ? _.noop
      : useThrottle(throttle, reportChange),
    changed = ({ target }) => {
      const v = target.value;
      setVal(v);
      onModify(v);
    };

  useEffect(() => {
    if (val !== value) setVal(value);
  }, [value]);

  useEffect(() => {
    if (value !== val) setVal(value);
  }, [value]);

  return (
    <Ctrl
      type={type}
      name={name}
      value={val}
      className={klass}
      style={style}
      disabled={disabled}
      onChange={changed}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
    />
  );
}
