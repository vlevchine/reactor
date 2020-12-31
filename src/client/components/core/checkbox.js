import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import './styles.css';
//Use toggle prop for toggle view, always set intent for toggle,
//otherwise both states hava same background color

const Checkbox = ({
  value = false,
  dataid,
  toggle,
  text,
  disabled,
  onChange,
  style,
  intent = 'none',
}) => {
  const handleChange = () => {
    onChange(!value, dataid);
  };
  return (
    <label className="checkbox-wrapper">
      <input
        type="checkbox"
        autoComplete="off"
        hidden
        disabled={disabled}
        checked={value}
        onChange={handleChange}
      />
      <span
        style={style}
        className={classNames([toggle ? 'slider' : 'checkmark'], {
          [`bg-${intent}`]: intent,
        })}
      />
      <span>{text}</span>
    </label>
  );
};

Checkbox.propTypes = {
  dataid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  text: PropTypes.string,
  toggle: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  intent: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.object,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

export default Checkbox;
