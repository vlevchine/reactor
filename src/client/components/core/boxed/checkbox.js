import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import './styles.css';

//Use toggle prop for toggle view, always set intent for toggle,
//otherwise both states hava same background color
Checkbox.propTypes = {
  id: PropTypes.string,
  dataid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  text: PropTypes.string,
  toggle: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  intent: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.object,
  disabled: PropTypes.bool,
  selectedColor: PropTypes.string,
  height: PropTypes.string,
  onChange: PropTypes.func,
};
export default function Checkbox({
  value = false,
  id,
  dataid,
  toggle,
  text,
  height,
  disabled,
  onChange,
  selectedColor,
  // style,
  // intent = 'none',
}) {
  const handleChange = () => {
    onChange?.(!value, dataid || id);
  };
  return (
    <label
      className={classNames(['checkbox-wrapper'], { disabled })}
      style={{ ['--selected']: selectedColor }}>
      <input
        type="checkbox"
        autoComplete="off"
        hidden
        disabled={disabled}
        checked={value}
        onChange={handleChange}
      />
      {toggle ? (
        <i style={height ? { ['--height']: height } : undefined} />
      ) : (
        <span />
      )}
      <span>{text}</span>
    </label>
  );
}
