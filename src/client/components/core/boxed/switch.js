import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Readonly } from '..';
import './styles.css';

//Use toggle prop for toggle view, always set intent for toggle,
//otherwise both states hava same background color
Switch.propTypes = {
  id: PropTypes.string,
  dataid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  checkedText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]),
  uncheckedText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]),
  options: PropTypes.array,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  intent: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.object,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  size: PropTypes.string,
  onChange: PropTypes.func,
};
export default function Switch({
  value = false,
  id,
  dataid,
  checkedText,
  uncheckedText,
  options,
  disabled,
  onChange,
  readonly,
  style,
  intent,
  size,
}) {
  const lid = dataid || id,
    opts = options || [uncheckedText || '', checkedText || ''],
    length = Math.max(...opts.map((e) => e.length)),
    styl = Object.assign({ ['--length']: `${length}ch` }, style),
    handleChange = () => {
      onChange?.(!value, dataid || id);
    };

  return readonly ? (
    <Readonly txt={value ? opts[1] || 'Yes' : opts[0] || 'No'} />
  ) : (
    <div className={classNames(['switch', size])} style={styl}>
      <input
        type="checkbox"
        id={lid}
        //checked={value}
        disabled={disabled}
        onChange={handleChange}
      />
      <label
        htmlFor={lid}
        className={classNames([intent && `sw-${intent}`])}
        data-checked={opts[1]}
        data-unchecked={opts[0]}>
        {''}
      </label>
    </div>
  );
}
