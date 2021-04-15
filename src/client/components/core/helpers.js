import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';
//import { createSvgIcon } from './icon';
import './styles.css';

const mergeIds = (...arg) => arg.filter(Boolean).join('.'),
  splitIds = (id = '') => id.split('.'),
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
      //param d expected to be locale date string
      return d ? d.split(sep) : Array(3).fill('');
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
//Collapse
const _collapse = 'collapse',
  _show = 'show',
  btnClasses = [
    'btn',
    'minimal',
    'btn-collapse',
    'clip-icon',
    'caret-down',
  ];
function isCollapsed(elem) {
  const classes = elem.classList;
  return classes.contains(_collapse) && !classes.contains(_show);
}
function collapse(elem) {
  const classes = elem.classList;
  if (classes.contains(_collapse)) classes.remove(_show);
}
function expand(elem) {
  const classes = elem.classList;
  if (classes.contains(_collapse)) classes.add(_show);
}
function useFauxCollapse() {
  const source = useRef(),
    target = useRef();
  return [source, target];
}
function getParent(src, testClass) {
  let el = src;
  while (el && !el?.classList.contains(testClass)) {
    el = el.parentNode;
  }
  return el;
}
function useCollapse(collapsed, addBtn, onToggle) {
  const source = useRef(),
    target = useRef(),
    toggle = (ev) => {
      ev.stopPropagation();
      const trigger = ev.currentTarget;
      if (trigger.classList.contains('btn-collapse'))
        trigger.classList.toggle('rotate-90');
      target.current.classList.toggle(_show);
      onToggle?.({ open: target.current.classList.contains(_show) });
    },
    open = () => {
      if (!target.current.parentNode.classList.contains(_show))
        toggle();
    },
    close = () => {
      if (target.current.parentNode.classList.contains(_show))
        toggle();
    };

  useLayoutEffect(() => {
    let tgt = target.current,
      src = source.current,
      trigger = src;
    tgt.classList.add('collapse');

    if (addBtn) {
      trigger = document.createElement('button');
      trigger.classList.add(...btnClasses);
      if (addBtn === 'left') {
        src.prepend(trigger);
      } else src.append(trigger);
    } else trigger.style.cursor = 'pointer';
    trigger.addEventListener('click', toggle);
    if (collapsed) {
      addBtn && trigger.classList.add('rotate-90');
      tgt.classList.remove(_show);
    } else tgt.classList.add(_show);

    return () => {
      trigger.removeEventListener('click', toggle);
      if (addBtn) src.removeChild(trigger);
    };
  }, []);

  return [source, target, open, close];
}

function triggerEvent(name, tgt, detail) {
  const event = new CustomEvent(name, {
    bubbles: true,
    cancelable: true,
    detail,
  });
  tgt.dispatchEvent(event);
}

export {
  mergeIds,
  splitIds,
  tempId,
  isTempId,
  localId,
  renderItem,
  getParent,
  useInput,
  arrayEqual,
  clickedOutside,
  padToMax,
  calendar,
  useCommand,
  maskSpecs,
  seps,
  useCollapse,
  useFauxCollapse,
  expand,
  collapse,
  isCollapsed,
  triggerEvent,
};
