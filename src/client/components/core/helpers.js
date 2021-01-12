import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';
import './styles.css';

const mergeIds = (...arg) => arg.filter((e) => !!e).join('.'),
  tmp_id = '_',
  tempId = () => tmp_id,
  isTempId = (id) => id === tmp_id,
  localId = () => nanoid(10);

const renderItem = (display, defVal = '') =>
  _.isString(display)
    ? (v) => v?.[display] || defVal
    : (v) => (v ? display(v) : defVal);

const useInput = (value = '', id, onChange, type, onModify) => {
    const [val, setVal] = useState(value),
      onBlur = () => {
        const v =
          val === ''
            ? undefined
            : type === 'number'
            ? parseFloat(val, 10)
            : val;
        v !== value && onChange?.(v, id);
      },
      onKeyDown = (ev) => {
        if (ev.keyCode === 13) onBlur();
      },
      changed = ({ target }) => {
        setVal(target.value);
        onModify?.(target.value);
      };
    useEffect(() => {
      if (val !== value) setVal(value);
    }, [value]);
    return [val, { onChange: changed, onBlur, onKeyDown }];
  },
  arrayEqual = (ar1, ar2) => {
    const s1 = new Set(ar1);
    return s1.size === ar2.length && ar2.every((a) => s1.has(a));
  },
  clickedOutside = (ev, comp) => {
    const {
        top,
        bottom,
        left,
        right,
      } = comp?.getBoundingClientRect(),
      x = ev.clientX,
      y = ev.clientY;
    return x < left || x > right || y > top || y < bottom;
  };

const useCommand = () => {
  const [cmd, setCmd] = useState();
  return [cmd, () => setCmd(Symbol())];
};

const padToMax = (m, max, len) => {
    if (!m) return m;
    const n = Number(m),
      v = Math.max(Math.min(max, n), 1);
    return v.toString().padStart(len, '0');
  },
  calendar = {
    iso: { sep: '-', seq: ['y', 'm', 'd'] },
    d: {
      placeholder: 'dd',
      len: 2,
      max: 31,
      pad: (v) => padToMax(v, 31, 2),
    },
    m: {
      placeholder: 'mm',
      len: 2,
      max: 12,
      pad: (v) => padToMax(v, 12, 2),
    },
    y: {
      placeholder: 'yyyy',
      len: 4,
      max: 9999,
      pad: (v) => padToMax(v, 9999, 4),
    },
    weekDays: {
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    getWeekDays(locale = 'en-CA') {
      return this.weekDays[locale.slice(0, 2)] || this.weekDays.en;
    },
    days: [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    locales: [
      {
        name: 'en-CA',
        sep: '-',
        seq: ['y', 'm', 'd'],
        weekStart: 0,
      },
      {
        name: 'en-US',
        sep: '/',
        seq: ['m', 'd', 'y'],
        weekStart: 0,
      },
    ],
    getLocale(l) {
      return (
        this.locales.find((e) => e.name === l) || this.locales[0]
      );
    },
    daysInMonth(m, y) {
      const month = m - 1,
        days = this.days[month];
      return month === 1 && y && y % 4 ? days - 1 : days;
    },
    daysPadded(d) {
      return padToMax(d, 31, 2);
    },
    monthsPadded(d) {
      return padToMax(d, 12, 2);
    },
    yearsPadded(d) {
      return padToMax(d, 9999, 4);
    },
  };

export {
  mergeIds,
  tempId,
  isTempId,
  localId,
  renderItem,
  useInput,
  arrayEqual,
  clickedOutside,
  padToMax,
  calendar,
  useCommand,
};
