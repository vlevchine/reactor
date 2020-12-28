import { Fragment, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { isValid, parseISO } from 'date-fns';
import { _ } from '@app/helpers';
import { ClearButton, padToMax, calendar } from './helpers';
import classes from './styles.css';

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
      if (!d) return Array(3).fill('');
      const date = parseISO(d);
      return isValid(date)
        ? date.toLocaleDateString(name).split(sep)
        : d.split(iso.sep);
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
        return dateTest(d, 1, calendar.m);
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
    onFocus = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const { id } = ev.target,
        n_vals = vals.map((v, i) =>
          i == id ? v : calendar[slots[i].name].pad(v)
        );
      if (vals.some((v, i) => v !== n_vals[i])) {
        setVals(n_vals);
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
    },
    onClear = () => onChange(undefined, dataid);

  useEffect(() => {
    setVals(spec.toSlotValues(value, name, sep));
  }, [value]);

  return (
    <div className={classes.maskWrapper}>
      {slots.map((s, i) => (
        <Fragment key={i}>
          <input
            ref={(el) => (refs.current[i] = el)}
            value={vals[i]}
            id={i}
            tabIndex="-1"
            placeholder={s.placeholder}
            disabled={disabled}
            className={classes.input}
            onChange={changed}
            onFocus={onFocus}
            onBlur={onBlur}
            style={{ width: `${1.25 + s.placeholder.length / 2}rem` }}
          />
          {i + 1 < slots.length && <span>{seps[sep]}</span>}
        </Fragment>
      ))}
      {clear && (
        <ClearButton
          onClick={onClear}
          className={classes.darkTheme}
        />
      )}
    </div>
  );
};

MaskedInput.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.string,
  type: PropTypes.string,
  locale: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  clear: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};
export default MaskedInput;
