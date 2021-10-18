import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import './styles.css';

const values = [false, undefined, true],
  icons = ['\u2716', '\u003F', '\u2713'];
//Use toggle prop for toggle view, always set intent for toggle,
//otherwise both states hava same background color
TriState.propTypes = {
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
  size: PropTypes.string,
  onChange: PropTypes.func,
  labelLeft: PropTypes.bool,
};
export default function TriState({
  value,
  id,
  dataid,
  // toggle,
  text,
  size,
  disabled,
  onChange,
  style,
  labelLeft,
}) {
  const handleChange = (ev) => {
    const v = values[ev.target.id.split('_')[0]];
    onChange?.(v, dataid || id);
  };

  return (
    <span
      className={classNames(['tri-wrapper'], { disabled })}
      style={style}>
      {labelLeft && <strong>{text}</strong>}
      <div className={classNames(['tri', size])}>
        {values.map((v, i) => {
          const _id = `${i}_${dataid}`;
          return (
            <Fragment key={i}>
              <input
                hidden
                type="radio"
                id={_id}
                name={dataid}
                value={v}
                checked={v === value}
                onChange={handleChange}
              />
              <label htmlFor={_id} order="1" className="tri-option">
                {icons[i]}
              </label>
            </Fragment>
          );
        })}
      </div>
      {!labelLeft && <span>{text}</span>}
    </span>
  );
}
