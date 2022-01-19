import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import './styles.css';

//Use toggle prop for toggle view, always set intent for toggle,
//otherwise both states hava same background color
Checkbox.propTypes = {
  id: PropTypes.string,
  dataid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  toggle: PropTypes.bool,
  toggleFace: PropTypes.array,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  intent: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.object,
  disabled: PropTypes.bool,
  height: PropTypes.string,
  onChange: PropTypes.func,
  uncontrolled: PropTypes.bool,
};
export default function Checkbox({
  value = false,
  id,
  toggle,
  toggleFace,
  text,
  height,
  disabled,
  onChange,
  style,
  uncontrolled,
  className,
  intent,
}) {
  const [_value, setValue] = useState(() => value || false),
    handleChange = (ev) => {
      const v = ev.target.checked;
      if (uncontrolled) setValue(v);
      onChange?.(v, id);
    },
    klass = classNames([className, intent]),
    txt = _.isFunction(text) ? text(_value) : text;

  useEffect(() => {
    setValue(value || false);
  }, [value]);

  return (
    <span>
      <input
        id={id}
        type="checkbox"
        autoComplete="off"
        hidden
        disabled={disabled}
        checked={_value}
        onChange={handleChange}
      />
      <label
        htmlFor={id}
        className={classNames(['checkbox-wrapper'], { disabled })}
        style={style}>
        {toggle ? (
          <i
            className={klass}
            style={height ? { ['--height']: height } : undefined}
          />
        ) : toggleFace ? (
          <em className={klass}>{toggleFace[_value ? 1 : 0]}</em>
        ) : (
          <span className={klass} />
        )}
        <span>{txt}</span>
      </label>
    </span>
  );
}
