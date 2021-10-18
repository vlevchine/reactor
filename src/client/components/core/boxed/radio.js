import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import './styles.css';

const Radio = ({
  dataid,
  id,
  value,
  options,
  onChange,
  display = 'label',
  idProp = 'id',
  disabled,
  minimal,
  className,
  style,
  horizontal,
  groupOf,
}) => {
  const name = id || dataid,
    changed = (ev) => {
      const tid = ev.target.id.split(':')[1];
      onChange && tid !== value && onChange(tid, name);
    },
    render = _.isFunction(display) ? display : (v) => v?.[display],
    buttons = groupOf === 'buttons',
    tabs = groupOf === 'tabs',
    klass = classNames(['radio', className], {
      ['radio-btn']: buttons,
      ['radio-tab']: tabs,
      ['minimal']: minimal || !buttons,
    });

  return (
    <div
      className={classNames([
        'radio-wrapper',
        horizontal ? 'flex-row' : 'flex-column',
      ])}
      style={style}>
      {options?.map((o) => {
        const id = o[idProp],
          _id = `${name}:${id}`,
          checked = id === value;
        return (
          <Fragment key={id}>
            <input
              type="radio"
              id={_id}
              name={name}
              checked={checked}
              onChange={changed}
              disabled={disabled}
            />
            <label
              htmlFor={_id}
              order="1"
              className={classNames([klass], {
                checked,
                disabled,
              })}>
              {!groupOf && <div className="radio-marker" />}
              <span className="no-select">{render(o)}</span>
            </label>
          </Fragment>
        );
      })}
    </div>
  );
};

Radio.propTypes = {
  value: PropTypes.string,
  dataid: PropTypes.string,
  id: PropTypes.string,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  horizontal: PropTypes.bool,
  style: PropTypes.object,
  idProp: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  buttonGroup: PropTypes.bool,
  minimal: PropTypes.bool,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  intent: PropTypes.string,
  onChange: PropTypes.func,
  groupOf: PropTypes.string,
};

export default Radio;
