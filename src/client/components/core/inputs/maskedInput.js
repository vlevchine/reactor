import { Fragment, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { Decorator } from '..';
import { padToMax, calendar } from '../helpers';
import './styles.css';

const { iso } = calendar;
const keepDigitsOnly = (s, len = 1) =>
  s.replace(/\D/g, '').slice(0, len);
const dateTest = (s, limit, { len, max }) => {
    const m = keepDigitsOnly(s, len);
    if (!m.length) return ['', false];
    if (m.length < len)
      return Number(m) > limit
        ? [padToMax(m, max, len), true]
        : [m, false];
    return [padToMax(m, max, len), true];
  },
  seps = { '-': '\u2012', '/': '\u2044' };
//Spec must define slots, separator either on top or per locale
//slots array - listing other props
const maskSpecs = {
  date: {
    toSlotValues(d, name, sep) {
      //param d expected to be ISO string
      const ms = Date.parse(d);
      return Number.isNaN(ms)
        ? Array(3).fill('')
        : new Date(ms).toLocaleDateString(name).split(sep);
    },
    fromSlots(values, name) {
      if (values.every((v) => !v)) return undefined;
      if (values.some((v) => !v)) return values.join(iso.sep);
      let seq = calendar.getLocale(name).seq,
        [y, m, d] = iso.seq
          .map((x) => seq.findIndex((s) => s === x))
          .map((s) => Number(values[s]));
      d = Math.min(d, calendar.daysInMonth(m, y));
      return new Date(Date.UTC(y, m - 1, d, 12)).toISOString();
    },
    init(locale) {
      const loc = _.isObject(locale)
        ? locale
        : calendar.getLocale(locale);
      return {
        sep: loc.sep,
        name: loc.name,
        slots: loc.seq.map((s) => ({
          ...this[s],
          name: s,
          placeholder: calendar[s].placeholder,
        })),
      };
    },
    d: {
      change(d) {
        return dateTest(d, 3, calendar.d);
      },
      out: calendar.daysPadded,
    },
    m: {
      change(d) {
        return dateTest(d, 2, calendar.m);
      },
      out: calendar.monthsPadded,
    },
    y: {
      change(d) {
        return dateTest(d, 1000, calendar.y);
      },
      out: calendar.yearsPadded,
    },
  },
};

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
  onChange,
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
      className="input-wrapper"
      hasValue={!_.isNil(value)}
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
};
export default MaskedInput;
