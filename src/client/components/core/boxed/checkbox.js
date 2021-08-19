import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { Readonly } from '..';
import './styles.css';

//Use toggle prop for toggle view, always set intent for toggle,
//otherwise both states hava same background color
Checkbox.propTypes = {
  id: PropTypes.string,
  dataid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  toggle: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  intent: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.object,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
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
  readonly,
  style,
  // intent = 'none',
}) {
  const handleChange = () => {
      onChange?.(!value, dataid || id);
    },
    txt = _.isFunction(text) ? text(value) : text;

  return (
    <label
      className={classNames(['checkbox-wrapper'], { disabled })}
      style={style}>
      {readonly ? (
        <Readonly txt={value ? 'Yes' : 'No'} />
      ) : (
        <>
          <input
            type="checkbox"
            autoComplete="off"
            hidden
            disabled={disabled}
            checked={value}
            onChange={handleChange}
          />
          {toggle ? (
            <i
              style={height ? { ['--height']: height } : undefined}
            />
          ) : (
            <span />
          )}
          <span>{txt}</span>
        </>
      )}
    </label>
  );
}
