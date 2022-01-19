import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from 'react';
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';
//import { createSvgIcon } from './icon';
import './styles.css';

const mergeIds = (...arg) => arg.filter(Boolean).join('.'),
  findInItems = (id, items) =>
    _.getIn(items, _.insertBetween(id, 'items')),
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
      min: 1,
      max: 31,
      pad: (v) => padToMax(v, 31, 2),
    },
    m: {
      placeholder: 'mm',
      len: 2,
      min: 1,
      max: 12,
      pad: (v) => padToMax(v, 12, 2),
    },
    y: {
      placeholder: 'yyyy',
      len: 4,
      min: 1,
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
        ord: { y: 0, m: 1, d: 2 },
        size: [4, 2, 2],
        mask: 'YYYY-MM-DD',
        weekStart: 0,
        off: [0, 6],
      },
      'en-US': {
        name: 'en-US',
        sep: '/',
        seq: ['m', 'd', 'y'],
        ord: { y: 2, m: 0, d: 1 },
        size: [2, 2, 4],
        mask: 'MM/DD/YYYY',
        weekStart: 0,
        off: [0, 6],
      },
      'de-DE': { weekStart: 1, off: [6, 7] },
    },
    defaultLocale: 'en-CA',
    getSepSymbol(locale = 'en-CA') {
      const lo =
        this.locales[locale] || this.locales[this.defaultLocale];
      return seps[lo.sep];
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
      const ms = Date.parse(v);
      return isNaN(ms)
        ? calendar.locales[locale].mask
        : new Date(ms).toLocaleDateString(locale);
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
const dateTest = (s, limit, typ) => {
    const { len, max } = calendar[typ],
      m = keepDigitsOnly(s, len),
      num = Number(m);
    if (!m.length) return ['', false];
    return m.length < len && num <= limit
      ? [m, false]
      : [padToMax(m, max, len), true, typ === 'm' ? num - 1 : num];
  },
  seps = { '-': '\u2012', '/': '\u2044' };
//Spec must define slots, separator either on top or per locale
//slots array - listing other props
const maskSpecs = {
  date: {
    sanitize(ev) {
      if (!/\d/.test(ev.key)) ev.preventDefault();
    },
    toValue(v = []) {
      if (v === this.mask) return undefined;
      const toks = _.isString(v) ? v.split(this.sep) : v,
        ms = Date.UTC(
          toks[this.ord.y],
          Number(toks[this.ord.m]) - 1,
          toks[this.ord.d],
          12
        );
      return Number.isNaN(ms) ? undefined : new Date(ms);
    },
    validateInput(v, lcl) {
      if (!v) return { valid: true, value: _.getDate() };
      let toks = v.split(this.sep).map(Number);
      const args = Object.keys(lcl.ord).map((k) => {
        const val = toks[lcl.ord[k]],
          { min, max } = calendar[k];
        return Number.isNaN(val) || val < min || val > max ? -1 : val;
      });

      return args.some((e) => e < 0)
        ? { valid: false }
        : { value: _.getDate(...args), valid: true };
      //  seq: ['m', 'd', 'y'],
      //  ord: { y: 2, m: 0, d: 1 },
    },
    toString(v) {
      return v ? v.toLocaleDateString(this.name) : ''; // this.mask;
    },
    validate(v) {
      const value = this.toValue(v);
      return {
        status: !!value,
        value,
        formatted: this.toString(value),
      };
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
    fix(d) {
      return d;
    },
    d: {
      fix(d) {
        return d;
      },
      change(d) {
        return dateTest(d, 3, 'd');
      },
      out: calendar.daysPadded,
    },
    m: {
      fix(d) {
        return d;
      },
      change(d) {
        return dateTest(d, 2, 'm');
      },
      out: calendar.monthsPadded,
    },
    y: {
      fix(d) {
        return d;
      },
      change(d) {
        return dateTest(d, 1000, 'y');
      },
      out: calendar.yearsPadded,
    },
  },
};

export const getDateSpec = (
  type,
  locale = calendar.defaultLocale
) => {
  const loc = _.isObject(locale) ? locale : calendar.locales[locale],
    spec = maskSpecs.date,
    masks = loc?.mask.split(loc.sep);
  return Object.assign({}, loc, spec, {
    slots: loc?.seq.map((s, i) => ({
      name: s,
      mask: masks[i],
    })),
  });
};
export const getSpec = (type, locale) => {
  return getDateSpec(type, locale);
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
  collapseAll(elem);
}
function expand(elem) {
  const classes = elem.classList;
  if (classes.contains(_collapse)) classes.add(_show);
}
function expandAll(elem) {
  [...elem?.querySelectorAll('.collapse')].forEach((e) =>
    e.classList.add(_show)
  );
}
function collapseAll(elem) {
  [...elem?.querySelectorAll('.collapse')].forEach((e) =>
    e.classList.remove(_show)
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
      const tgt = wrapper.current.querySelector(
          '[data-collapse-target]'
        ),
        open = tgt.classList.contains(_show),
        src = wrapper.current.querySelector('[data-collapse-source]');
      src?.style.setProperty(
        '--icon-rotate',
        open ? '-90deg' : '0deg'
      );
      tgt.classList.toggle(_show);
      onToggle?.({ open: tgt.classList.contains(_show) });
    },
    open = () => {
      if (!wrapper.current) return;
      const tgt = wrapper.current.querySelector(
          '[data-collapse-target]'
        ),
        src = wrapper.current.querySelector('[data-collapse-source]');
      tgt.classList.add(_show);
      src?.style.setProperty('--icon-rotate', '0deg');
    },
    close = () => {
      if (!wrapper.current) return;
      const tgt = wrapper.current.querySelector(
          '[data-collapse-target]'
        ),
        src = wrapper.current.querySelector('[data-collapse-source]');
      tgt.classList.remove(_show);
      src?.style.setProperty('--icon-rotate', '-90deg');
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
      src.style.setProperty('--icon-rotate', '-90deg');
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

function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}
function easeInSine(x) {
  return 1 - Math.cos((x * Math.PI) / 2);
}
function easeOutSine(x) {
  return Math.sin((x * Math.PI) / 2);
}
const easing = {
  easeIn: easeInSine,
  easeOut: easeOutSine,
  easeInOut: easeInOutSine,
};
function setAnimatedValue(from, dist, duration, runs, fn = 'easeIn') {
  var progress =
    Math.round(100 * easing[fn](Math.min(runs / duration, 1))) / 100;
  return Math.floor(from + dist * progress) + 'px';
}
async function requestAnimation(props, options = {}) {
  return new Promise((resolve) => {
    let { el, from = 1, to = 1, onExit } = props,
      { prop = 'height', duration = 400, delay = 0, fn } = options,
      start = Date.now(),
      dist = to - from,
      exiting = () => {
        el.style.removeProperty(prop);
        onExit?.();
        resolve();
      },
      runs = 0;
    el.style[prop] = setAnimatedValue(from, dist, duration, runs, fn);
    if (delay) start += delay;
    function animate() {
      runs = Date.now() - start;
      el.style[prop] = setAnimatedValue(
        from,
        dist,
        duration,
        runs,
        fn
      );
      // el.style.opacity = dist > 0 ? progress : 1 - progress;
      if (runs < duration) {
        requestAnimationFrame(animate);
      } else exiting();
    }
    requestAnimationFrame(animate);
    // return delay ? setTimeout(func, delay) : func();
  });
}
const // _hidden = 'hidden',
  _collapsed = 'collapsed',
  _shown = 'shown';
async function animateShow(el, options) {
  el.classList.remove(_collapsed);
  return requestAnimation(
    {
      el,
      to: el.offsetHeight,
      onExit: () => {
        el.classList.add(_shown);
      },
    },
    options
  );
}
function animateHide(el, options) {
  el.classList.remove(_shown);
  return requestAnimation(
    {
      el,
      from: el.offsetHeight,
      onExit: () => {
        el.classList.add(_collapsed);
      },
    },
    options
  );
}
const _animate = { prop: 'height', duration: 200 };
//!!!Usage:
//  const [isOpen, toggle] = useToggle(open),
//     ref = useCollapsible(
//       {
//         animate: { duration: 400, onExit: toggle },
//         onClick: func called when clicked outside source, i.e. open/close trigger
//        onDropdownClose - func called when dropdown is closed by clicking on source
//       },
//      id, open //initial state
//     );
// 	//Souce element will trigger collapsing
//     <section ref={ref}> //will serve as source unless inner element has an attribute data-collapse-trigger
//       somewhere inside may be
//         <i data-collapse-trigger /> //which will now serve as source
//       also must have dropdown content
//      <div data-collapse />
//     </section>
function getDropdown(ref) {
  return ref.querySelector('[data-collapse]');
}
function getTrigger(ref) {
  return ref.querySelector('[data-collapse-trigger]');
}
function getSource(ref) {
  return getTrigger(ref) || ref;
}
export function dropdownCloseRequest(id) {
  triggerEvent('dropdownClose', document, { id });
}
export function useCollapsible(
  {
    animate = _animate,
    onDropdownClose,
    onClick,
    ignoreClickOnSource,
  },
  id,
  initial
) {
  const ref = useRef(),
    state = useRef(initial ? 1 : -1), //closed: -1, open:1, animating: 0;
    runAnimation = async (el, fn) => {
      if (!state.current) return;
      state.current = 0;
      ref.current
        .querySelector('.rotate')
        ?.classList.toggle('rotate90');
      await fn(el, animate);
      animate.onExit?.(open);
    },
    setEventsShown = (src, op = 'removeEventListener') => {
      src[op]('click', hideonSource);
      document[op]('click', clicked);
      document[op]('dropdownClose', onCloseRequest);
    },
    hide = async (ev, _el) => {
      ev.preventDefault?.();
      ev.stopPropagation?.();
      const el = _el || getDropdown(ref.current),
        src = getSource(ref.current);
      await runAnimation(el, animateHide);
      state.current = -1;
      setEventsShown(src, 'removeEventListener');
      src.addEventListener('click', show);
    },
    hideonSource = async (ev, _el, evOriginal) => {
      const el = _el || getDropdown(ref.current);
      if (ignoreClickOnSource || el.contains(ev.target)) return;
      await hide(ev, el);
      onDropdownClose?.(ev, evOriginal);
    },
    onCloseRequest = async (ev) => {
      if (ev.detail.id === id) {
        await hide(ev);
      }
    },
    show = async () => {
      const el = getDropdown(ref.current),
        src = getSource(ref.current);
      await runAnimation(el, animateShow);
      state.current = 1;
      setEventsShown(src, 'addEventListener');
      src.removeEventListener('click', show);
    },
    clicked = async (ev) => {
      const { target } = ev,
        onDropdown = getDropdown(ref.current).contains(target),
        onWrapper = !onDropdown && ref.current.contains(target);

      onClick?.(ev, {
        onDropdown,
        onWrapper,
        el: getDropdown(ref.current),
      });
    },
    onKey = async (ev) => {
      if (state.current <= 0) return;
      const enter = ev.code === 'Enter',
        escape = ev.code === 'Escape';
      if (enter || escape) {
        hideonSource({ target: ref.current }, undefined, ev);
        //if (enter) onDropdownClose?.(el.firstElementChild);
      }
    };

  useLayoutEffect(() => {
    const trigger = getTrigger(ref.current),
      src = trigger || ref.current,
      el = getDropdown(ref.current);

    ref.current.setAttribute('tabIndex', '0');
    el.setAttribute('tabIndex', '0');
    if (!initial) el.classList.add(_collapsed);
    // trigger?.classList.add('cursor-pointer');
    src.addEventListener('click', show);
    ref.current.addEventListener('keyup', onKey);

    return () => {
      if (state.current > 0) {
        setEventsShown(src, 'removeEventListener');
      } else src.removeEventListener('click', show);

      ref.current.removeEventListener('keyup', onKey);
    };
  }, []);

  return ref;
}

export function useBetterCallback(callback, values) {
  const self = useRef({
    values: values,
    handler: (...args) => {
      return callback(...args, self.current.values);
    },
  });
  self.current.values = values;
  return self.current.handler;
}
function useChangeReporter(
  value = '',
  props,
  toState = _.identity,
  fromState = _.identity
) {
  const { id, onChange, uncontrolled } = props,
    changed = useCallback(onChange),
    [_value, setValue] = useState(toState(value)),
    // valueHolder = withCache && useRef(_value),
    reset = (v) => {
      if (uncontrolled) {
        setValue(toState(v));
      }
      const _v = fromState(v);
      if (_v !== value) changed?.(_v, id);
    },
    res = [_value, reset],
    clicked = useBetterCallback((res, [_val, set_v]) => {
      if (res) set_v(res);
      return _val;
    }, res);
  res.push(clicked, setValue);
  useEffect(() => {
    setValue(toState(value));
  }, [value]);
  return res;
}

function useNativeEvent(type, handler) {
  const ref = useRef();
  useLayoutEffect(() => {
    if (ref.current) ref.current.addEventListener(type, handler);
    return () => {
      if (ref.current) ref.current.removeEventListener(type, handler);
    };
  }, []);
  return ref;
}

export function setCaret(el, caretPos = 0) {
  //el.value = el.value;
  // ^ this is used to not only get "focus", but
  // to make sure we don't have it everything -selected-
  // (it causes an issue in chrome, and having it doesn't hurt any other browser)

  if (el !== null) {
    if (el.createTextRange) {
      var range = el.createTextRange();
      range.move('character', caretPos);
      range.select();
      return true;
    } else {
      // (el.selectionStart === 0 added for Firefox bug)
      if (el.selectionStart || el.selectionStart === 0) {
        el.focus();
        el.setSelectionRange(caretPos, caretPos);
        return true;
      } else {
        // fail city, fortunately this never happens (as far as I've tested) :)
        el.focus();
        return false;
      }
    }
  }
}
export {
  mergeIds,
  splitIds,
  findInItems,
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
  useChangeReporter,
  useNativeEvent,
  expand,
  expandAll,
  collapse,
  isCollapsed,
  triggerEvent,
  defOptions,
};
