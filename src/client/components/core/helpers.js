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
        if (ev.code === 'Enter') onBlur();
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
    days: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    locales: {
      'en-CA': {
        name: 'en-CA',
        sep: '-',
        seq: ['y', 'm', 'd'],
        size: [4, 2, 2],
        mask: 'YYYY-MM-DD',
        weekStart: 0,
        off: [0, 6],
      },
      'en-US': {
        name: 'en-US',
        sep: '/',
        seq: ['m', 'd', 'y'],
        size: [2, 2, 4],
        mask: 'MM/DD/YYYY',
        weekStart: 0,
        off: [0, 6],
      },
      'de-DE': { weekStart: 1, off: [6, 7] },
    },
    getWeekDays(locale = 'en-CA') {
      return this.weekDays[locale.slice(0, 2)] || this.weekDays.en;
    },
    daysInMonth(m, y = 2021) {
      const month = m % 12, // - 1,
        days = calendar.days[month];
      return month === 1 && !(y % 4) ? days + 1 : days;
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
    dateToString(v, locale = 'en-CA') {
      return isNaN(Date.parse(v))
        ? calendar.locales[locale].mask
        : new Date(v).toLocaleDateString(locale);
    },
    toDate(value, spec) {
      const values = _.isArray(value) ? value : value.split(spec.sep),
        { iso, daysInMonth } = calendar;
      let [y, m, d] = iso.seq
        .map((x) => spec.seq.findIndex((s) => s === x))
        .map((s) => Number(values[s]));
      d = Math.min(d, daysInMonth(m, y));
      const date = new Date(Date.UTC(y, m - 1, d, 12));
      return isNaN(date.valueOf()) ? undefined : date; //?.toISOString();
    },
  };

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
    sanitize(ev) {
      if (!/\d/.test(ev.key)) ev.preventDefault();
    },
    validate(v = []) {
      let value;
      const toks = v.filter(Boolean);
      if (!toks.length) return { status: true, value };
      return toks.length < 3 || isNaN(Date.parse(v))
        ? { status: false, value }
        : { status: true, value: calendar.toDate(v, this) };
    },
    defaultSlotsString() {
      return Array(3).fill('').join(this.sep);
    },
    valueToSlots(d) {
      //const d = _.parseDate(v);
      return d
        ? d?.toLocaleDateString(this.name).split(this.sep)
        : Array(3).fill('');
    },
    valueToSlotsString(d) {
      //TBD: param d expected to be locale date string
      return d?.toLocaleDateString(this.name);
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
export const getSpec = (type, locale) => {
  const loc = _.isObject(locale) ? locale : calendar.locales[locale],
    spec = maskSpecs[type],
    masks = loc?.mask.split(loc.sep);
  return Object.assign({}, loc, spec, {
    slots: loc?.seq.map((s, i) => ({
      name: s,
      mask: masks[i],
    })),
  });
};
//Collapse
const _collapse = 'collapse',
  s_collapse = '.collapse',
  _show = 'show',
  btnClasses = [
    'btn',
    'minimal',
    'btn-collapse',
    'clip-icon',
    'caret-down',
  ];

function isCollapsed(elem) {
  const item = elem.classList.contains(_collapse)
    ? elem
    : elem.querySelector(s_collapse);
  return item && !item.classList.contains(_show);
}
function collapse(elem) {
  const classes = elem.classList;
  if (classes.contains(_collapse)) classes.remove(_show);
}
function expand(elem) {
  const classes = elem.classList;
  if (classes.contains(_collapse)) classes.add(_show);
}
function expandAll(elem) {
  [...elem.querySelectorAll('.collapse')].forEach((e) =>
    e.classList.add(_show)
  );
}
function useFauxCollapse() {
  const source = useRef();
  return [source];
}
function getParent(src, testClass) {
  let el = src;
  while (el && !el?.classList.contains(testClass)) {
    el = el.parentNode;
  }
  return el;
}
function useCollapse(wrapper, collapsed, addBtn, onToggle) {
  if (!wrapper) wrapper = useRef();
  const toggle = (ev) => {
      if (!wrapper.current) return;
      if (
        ev.target.localName === 'button' &&
        !ev.target.classList.contains('caret-down')
      )
        //bypass click on any button other than the one added here
        return;
      ev.stopPropagation();
      const trigger = ev.currentTarget,
        tgt = wrapper.current.querySelector('[data-collapse-target]');
      if (trigger.classList.contains('btn-collapse'))
        trigger.classList.toggle('rotate-90');
      tgt.classList.toggle(_show);
      onToggle?.({ open: tgt.classList.contains(_show) });
    },
    open = () => {
      if (!wrapper.current) return;
      const tgt = wrapper.current.querySelector(
        '[data-collapse-target]'
      );
      if (!tgt.parentNode.classList.contains(_show)) toggle();
    },
    close = () => {
      if (!wrapper.current) return;
      const tgt = wrapper.current.querySelector(
        '[data-collapse-target]'
      );
      if (tgt.parentNode.classList.contains(_show)) toggle();
    };

  useLayoutEffect(() => {
    if (!wrapper.current) return;
    let tgt = wrapper.current.querySelector('[data-collapse-target]'),
      src = wrapper.current.querySelector('[data-collapse-source]'),
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

  return [wrapper, open, close];
}

function triggerEvent(name, tgt, detail) {
  const event = new CustomEvent(name, {
    bubbles: true,
    cancelable: true,
    detail,
  });
  tgt.dispatchEvent(event);
}
const defOptions = [
  { id: '_1', label: 'First' },
  { id: '_2', label: 'Second' },
  { id: '_3', label: 'Third' },
];
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
  expandAll,
  collapse,
  isCollapsed,
  triggerEvent,
  defOptions,
};
