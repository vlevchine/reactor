import { Fragment, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { Decorator } from '..';
import { maskSpecs, seps } from '../helpers';
import './styles.css';

const MaskedInput = ({
  dataid,
  value = '',
  type,
  locale = 'en-CA',
  clear,
  icon,
  info,
  blend,
  style,
  disabled,
  className,
  onChange,
  intent,
}) => {
  const spec = maskSpecs[type],
    { name, slots, sep } = spec.init(locale),
    refs = useRef([]),
    //!!!TBD: remove date2ISOString, as value expected to be string
    [vals, setVals] = useState(() =>
      spec.toSlotValues(value, name, sep)
    ),
    changed = (ev) => {
      const { id, value } = ev.target,
        slot = slots[id],
        [v, res] = slot.change(value),
        next = refs.current[Number(id) + 1];
      vals[id] = v;
      setVals([...vals]);
      if (res && next) {
        next.focus();
        next.setSelectionRange(0, 0);
      }
    },
    onBlur = ({ target, relatedTarget }) => {
      const { id } = target,
        inside = refs.current.some((e) => e.contains(relatedTarget));
      if (!inside) {
        vals[id] = slots[id].out(target.value);
        const v = spec.fromSlots(vals, name);
        if (v !== value) {
          onChange(v, dataid);
        }
      }
    };
  // onClear = () => onChange(undefined, dataid);

  useEffect(() => {
    setVals(spec.toSlotValues(value, name, sep));
  }, [value]);

  return (
    <Decorator
      id={dataid}
      clear={clear}
      icon={icon}
      info={info}
      blend={blend}
      onChange={onChange}
      className={className}
      hasValue={!_.isNil(value)}
      intent={intent}
      style={style}>
      <div className="mask-wrapper">
        {slots.map((s, i) => (
          <Fragment key={i}>
            <input
              ref={(el) => (refs.current[i] = el)}
              value={vals[i]}
              id={i}
              tabIndex="-1"
              disabled={disabled}
              className="input"
              onChange={changed}
              onBlur={onBlur}
              style={{ width: `${s.placeholder.length + 2}ch` }}
            />
            {value && i + 1 < slots.length && (
              <span>{seps[sep]}</span>
            )}
          </Fragment>
        ))}
      </div>
    </Decorator>
  );
};

MaskedInput.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.string,
  type: PropTypes.string,
  locale: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  icon: PropTypes.string,
  info: PropTypes.string,
  style: PropTypes.object,
  clear: PropTypes.bool,
  tabIndex: PropTypes.number,
  blend: PropTypes.bool,
  className: PropTypes.string,
  intent: PropTypes.string,
};
export default MaskedInput;
