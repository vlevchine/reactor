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
    validateInput(v) {
      const toks = v.split(this.sep);
      console.log(toks);
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
  collapseAll(elem);
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
function collapseAll(elem) {
  [...elem.querySelectorAll('.collapse')].forEach((e) =>
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
function requestAnimation(props, options = {}) {
  let { el, from, to, start, onExit } = props,
    {
      prop = 'height',
      duration = 400,
      delay = 0,
      fn = 'easeIn',
    } = options;
  el.style[prop] = from + 'px';
  const dist = to - from;
  if (delay) start += delay;
  function animate() {
    var runs = Date.now() - start,
      progress =
        Math.round(100 * easing[fn](Math.min(runs / duration, 1))) /
        100;
    el.style[prop] = Math.floor(from + dist * progress) + 'px';
    // el.style.opacity = dist > 0 ? progress : 1 - progress;
    if (runs < duration) {
      requestAnimationFrame(animate);
    } else {
      el.style.removeProperty(prop);
      onExit?.();
    }
  }
  const func = () => requestAnimationFrame(animate);
  return delay ? setTimeout(func, delay) : func();
}
const // _hidden = 'hidden',
  _collapsed = 'collapsed',
  _shown = 'shown';
async function animateShow(el, options) {
  el.classList.remove(_collapsed); //_hidden
  const to = el.offsetHeight;

  return new Promise((resolve) => {
    requestAnimation(
      {
        el,
        from: 1,
        to,
        start: Date.now(),
        onExit: () => {
          el.focus();
          el.classList.add(_shown);
          resolve();
        },
      },
      options
    );
  });
}
function animateHide(el, options) {
  el.classList.remove(_shown);
  return new Promise((resolve) => {
    requestAnimation(
      {
        el,
        from: el.offsetHeight,
        to: 1,
        start: Date.now(),
        onExit: () => {
          el.classList.add(_collapsed); //_hidden
          resolve();
        },
      },
      options
    );
  });
}
const _animate = { prop: 'height', duration: 200 },
  getSource = (ref) =>
    ref.querySelector('[data-collapse-trigger]') || ref;
//!!!Usage:
//  const [isOpen, toggle] = useToggle(open),
//     ref = useCollapsible(
//       {
//         animate: { duration: 400, onExit: toggle },
//         ignoreOutClick: true, //will close on click on source only
//       },
//       open //initial state
//     );
// 	//Souce element will trigger collapsing
//   return (
//     <section ref={ref}> //will serve as source unless inner element has an attribute data-collapse-trigger
//       <div className="justaposed full-width">
//         <h6>{title}</h6>
//         <i data-collapse-trigger //now this is source
//           className={classNames(['clip-icon caret-down lg cursor-pointer'], { ['rotate-90']: isOpen }
//           )}></i>
//       </div>
//       <div data-collapse className="card-content">
//         ///dropdown content
//       </div>
//     </section>
//   );
export function useCollapsible(
  {
    animate = _animate,
    onDropdownClose,
    ignoreOutClick,
    closeOnClickIn,
  },
  initial
) {
  //, initial, ignoreInClick
  const ref = useRef(),
    animating = useRef(),
    runAnimation = async (fn, hide) => {
      const el = ref.current.querySelector('[data-collapse]'),
        rotatable = ref.current.querySelector('.rotate');
      if (animating.current || !el) return;
      animating.current = true;
      rotatable?.classList.toggle('rotate90');
      await fn(el, animate);
      animating.current = false;
      animate.onExit?.(hide);
    },
    show = async (ev) => {
      ev.stopPropagation();
      const { target } = ev,
        parent = target.parentNode,
        tgt = parent.localName === 'button' ? parent : target;
      if (tgt.dataset.clear) return;
      await runAnimation(animateShow, true);
      const src = getSource(ref.current);
      src.removeEventListener('click', show);
      // if (ignoreOutClick)
      src.addEventListener('click', hide);
    },
    hide = async (ev) => {
      await runAnimation(animateHide);
      const src = getSource(ref.current);
      //if (ignoreOutClick)
      src.removeEventListener('click', hide);
      getSource(ref.current).addEventListener('click', show);
      onDropdownClose?.(ev.target);
    };

  useLayoutEffect(() => {
    const src =
        ref.current.querySelector('[data-collapse-trigger]') ||
        ref.current,
      el = ref.current.querySelector('[data-collapse]');

    ref.current.setAttribute('tabIndex', '0');
    src.addEventListener('click', show);
    if (!ignoreOutClick)
      ref.current.addEventListener('focusout', hide); //transitionend
    if (el) {
      if (!initial) el.classList.add(_collapsed); //_hidden
      //
      if (closeOnClickIn) el.addEventListener('click', hide);
      //onDropdownClose?.(el);
    }

    return () => {
      src?.removeEventListener('click', show);
      if (!ignoreOutClick)
        ref.current.removeEventListener('focusout', hide);
      if (closeOnClickIn) el?.removeEventListener('click', hide);
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
function useChangeReporter(value = '', props, handleClick) {
  const { id, onChange, uncontrolled } = props,
    changed = useCallback(onChange),
    [_value, setValue] = useState(value),
    // valueHolder = withCache && useRef(_value),
    reset = (v) => {
      if (uncontrolled) {
        setValue(v);
      }
      if (v !== _value) changed?.(v, id);
    },
    res = [_value, reset],
    clicked = useBetterCallback((target, [, set_v]) => {
      const res = handleClick(target);
      if (res) set_v(res);
    }, res);
  res.push(clicked);
  useEffect(() => {
    setValue(value);
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
