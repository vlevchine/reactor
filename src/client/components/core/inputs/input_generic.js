import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';

export function useThrottle(throttle, onModify) {
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
}

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
  withKeyDown: PropTypes.bool,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onModify: PropTypes.func,
  rows: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default function InputGeneric(props) {
  const {
      type = 'text',
      kind = 'input',
      id,
      dataid,
      value,
      name,
      onChange,
      throttle,
      className,
      style,
      placeholder,
      disabled,
      rows,
      withKeyDown,
      onFocus,
      onBlur,
      onModify,
    } = props,
    Ctrl = kind,
    [val, setVal] = useState(_.isNil(value) ? '' : value),
    klass = classNames([className, 'input']),
    blurred = (ev) => {
      ev.preventDefault();
      const v = val === '' ? undefined : val;
      onBlur?.();
      reportChange(v);
    },
    reportChange = (v) => {
      v !== value && onChange?.(v, dataid || id);
    },
    onKeyDown = (ev) => {
      if (!withKeyDown && ev.code === 'Enter') blurred(ev);
    },
    modified = _.isNil(throttle)
      ? onModify
      : useThrottle(throttle, reportChange),
    changed = ({ target }) => {
      const v = target.value;
      setVal(v);
      modified?.(v);
    };

  useEffect(() => {
    if (val !== value) setVal(_.isNil(value) ? '' : value);
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
      onBlur={blurred}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      rows={rows}
      placeholder={placeholder}
    />
  );
}

export function useInput(
  {
    id,
    dataid,
    value,
    onBlur,
    onChange,
    onModify,
    withKeyDown,
    className,
  },
  { throttle } = {}
) {
  const [val, setVal] = useState(_.isNil(value) ? '' : value),
    klass = classNames([className, 'input']),
    blurred = (ev) => {
      ev.preventDefault();
      const v = val === '' ? undefined : val;
      onBlur?.();
      reportChange(v);
    },
    reportChange = (v) => {
      v !== value && onChange?.(v, dataid || id);
    },
    onKeyDown = (ev) => {
      if (!withKeyDown && ev.code === 'Enter') blurred(ev);
    },
    modified = _.isNil(throttle)
      ? onModify
      : _.throttle(reportChange, throttle),
    changed = ({ target }) => {
      const v = target.value;
      setVal(v);
      onModify?.(v);
    };

  useEffect(() => {
    if (val !== value) setVal(_.isNil(value) ? '' : value);
  }, [value]);

  return { val, changed, onKeyDown, blurred, modified, klass };
}
