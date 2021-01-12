import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { classNames, _ } from '@app/helpers';
import { SearchInput } from './index';
import { icons } from './icon';
import './styles.css';

const mergeIds = (...arg) => arg.filter((e) => !!e).join('.'),
  tmp_id = '_',
  tempId = () => tmp_id,
  isTempId = (id) => id === tmp_id,
  localId = () => nanoid(10);

DelBtnWrapper.propTypes = {
  content: PropTypes.any,
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  fill: PropTypes.bool,
  onChange: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
};
function DelBtnWrapper({
  content,
  id,
  onChange,
  className,
  style,
  fill,
}) {
  const onDelBtn = (ev) => {
    if (ev.target.dataset.id !== 'title') {
      ev.preventDefault();
      onChange?.(undefined, id);
    }
  };

  return (
    <span
      role="button"
      tabIndex="0"
      className={classNames([className], {
        fill,
        ['del-btn-wrapper']: !!onChange,
      })}
      style={style}
      onKeyDown={_.noop}
      onClick={onDelBtn}>
      <span data-id="title" className="del-btn-title">
        {content}
      </span>
    </span>
  );
}
Decorator.propTypes = {
  id: PropTypes.string,
  clear: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.bool,
    PropTypes.number,
  ]),
  fill: PropTypes.bool,
  children: PropTypes.any,
  info: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.string,
  style: PropTypes.object,
  blend: PropTypes.bool,
  minimal: PropTypes.bool,
  onChange: PropTypes.func,
  hasValue: PropTypes.bool,
};
function Decorator({
  id,
  clear,
  fill,
  info,
  icon,
  className,
  style,
  blend,
  minimal,
  children,
  hasValue,
  onChange,
}) {
  const onDelBtn = (ev) => {
      if (ev.target.className.includes('del-btn')) {
        ev.preventDefault();
        onChange?.(undefined, id);
      }
    },
    infoIcon = getIcon(info),
    infoTxt = infoIcon === info;

  return (
    <span
      className={classNames([className], {
        ['with-icons i-fa i-l i-fa']: icon || info,
        ['with-btn']: clear,
        ['i-txt']: infoTxt,
        minimal,
        blend,
        fill,
      })}
      data-before={info ? getIcon(icon) : undefined}
      data-after={infoIcon || undefined}
      style={style}>
      {children}
      {clear && hasValue && (
        <span
          role="button"
          tabIndex="0"
          className={classNames(['with-icons i-fa i-r del-btn'], {
            on: clear > 1,
          })}
          data-before={getIcon('times')}
          onKeyDown={_.noop}
          onClick={onDelBtn}></span>
      )}
    </span>
  );
}

// const ClearButton = ({ id, alwayOn, disabled, onClick }) => {
//   const clicked = (ev) => {
//     ev.stopPropagation();
//     ev.preventDefault();
//     onClick(id);
//   };
//   return (
//     <Button
//       type="reset"
//       icon="times"
//       className={classNames(['del-btn'], {
//         visible: alwayOn,
//       })}
//       disabled={disabled}
//       onClick={clicked}
//     />
//   );
// };
// ClearButton.propTypes = {
//   id: PropTypes.string,
//   alwayOn: PropTypes.bool,
//   disabled: PropTypes.bool,
//   className: PropTypes.string,
//   onClick: PropTypes.func,
// };

// const withClearButton = (comp, onClick, options = {}, extra) => {
//     const {
//       disabled,
//       fill,
//       minimal,
//       intent,
//       style,
//       search,
//     } = options;
//     return (
//       <div
//         style={style}
//         data-intent={intent}
//         className={classNames(
//           ['input-wrappe', 'with-clear-btn', extra?.className],
//           {
//             fill,
//             minimal,
//             disabled,
//             filter: search,
//           }
//         )}>
//         {comp}
//         {onClick && (
//           <ClearButton onClick={onClick} disabled={disabled} />
//         )}
//       </div>
//     );
//   },
//   withDecorations = (comp, options = {}) => {
//     const { info, icon, intent, fill, minimal, disabled } = options,
//       decor = info || icon;

//     if (!decor) return comp;
//     const klass = classNames([''], {
//       fill,
//       ['icon-before']: icon,
//       minimal,
//       disabled,
//     });

//     return (
//       <div
//         data-before={getIcon(icon)}
//         data-intent={intent}
//         className={klass}>
//         {comp}
//         {info && (
//           <span className="icon-after" data-after={getIcon(info)} />
//         )}
//       </div>
//     );
//   },
//   withLabels = (comp, options = {}, fixed) => {
//     const {
//         value,
//         intent,
//         label,
//         hint,
//         message,
//         tight,
//         itemStyle,
//       } = options,
//       decor = label || message,
//       klass = classNames(['with-labels'], {
//         ['has-value']: value !== undefined,
//         ['bottom-tight']: tight,
//       });

//     return decor ? (
//       <div style={itemStyle} data-intent={intent} className={klass}>
//         {comp}
//         {label && (
//           <label
//             className={classNames(['input-labe'], {
//               ['label-fixed']: fixed,
//             })}>
//             {label}
//             {hint && <Info text={hint} />}
//           </label>
//         )}
//         {message && <div className="input-messag">{message}</div>}
//       </div>
//     ) : (
//       <div style={itemStyle}>{comp}</div>
//     );
//   },
//   decorate = (Comp, props, options = {}) => {
//     const {
//         intent,
//         label,
//         hint,
//         message,
//         itemStyle,
//         info,
//         icon,
//         fill,
//         tight,
//         minimal,
//         light,
//         clear,
//         ...rest
//       } = props,
//       { withIcons, labelFixed } = options;
//     let comp = (
//       <Comp
//         {...rest}
//         minimal={minimal}
//         light={light}
//         icon={icon}
//         clear={clear}
//       />
//     );

//     if (withIcons)
//       comp = withDecorations(comp, {
//         info,
//         icon,
//         intent,
//         fill,
//         minimal,
//         light,
//         disabled: rest.disabled,
//       });
//     return withLabels(
//       comp,
//       {
//         value: rest.value,
//         intent,
//         label,
//         hint,
//         message,
//         minimal,
//         light,
//         tight,
//         itemStyle,
//       },
//       labelFixed
//     );
//   };

const OptionsPanel = ({
  options,
  render,
  limitOptions,
  search,
  horizontal,
  onChange,
  optionClass,
}) => {
  //filter
  const [, setFilter, opts] = useOptions(
      options,
      render,
      limitOptions
    ),
    searching =
      search || (limitOptions && options.length > limitOptions),
    handleChange = (ev) => {
      ev.stopPropagation();
      const v =
        ev.target.dataset.value || ev.target.parentNode.dataset.value;
      onChange && onChange(v);
    };

  return (
    <>
      {searching && (
        <SearchInput
          name="filter"
          tabIndex={-1}
          style={{
            width: '100%',
            borderBottom: '1px solid var(--g-9)',
          }}
          placeholder="Filter options..."
          throttle={400}
          search
          onChange={setFilter}
        />
      )}
      <div
        role="button"
        tabIndex="0"
        className={classNames(['button-options'], {
          row: horizontal,
        })}
        onKeyUp={() => {}}
        onClick={handleChange}>
        {opts.length ? (
          opts.map((e) => (
            <span
              key={e.id}
              className={optionClass}
              data-value={e.id}>
              {render(e)}
            </span>
          ))
        ) : (
          <span className={optionClass}>No results...</span>
        )}
      </div>
    </>
  );
};
OptionsPanel.propTypes = {
  render: PropTypes.func,
  onChange: PropTypes.func,
  refPanel: PropTypes.object,
  className: PropTypes.string,
  search: PropTypes.bool,
  right: PropTypes.bool,
  horizontal: PropTypes.bool,
  minimal: PropTypes.bool,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  filterBy: PropTypes.string,
  limitOptions: PropTypes.number,
  style: PropTypes.object,
  optionClass: PropTypes.string,
};

const renderItem = (display, defVal = '') =>
    _.isString(display)
      ? (v) => v?.[display] || defVal
      : (v) => (v ? display(v) : defVal),
  filterOptions = (filter, options, render, limit) => {
    const _v = filter?.toLowerCase(),
      opts = _v
        ? options.filter((o) => render(o)?.toLowerCase().includes(_v))
        : options;
    return limit ? opts.slice(0, limit) : opts;
  };

const useOptions = (options, render, limit) => {
    const [filter, setFilter] = useState(''),
      opts = filterOptions(filter, options, render, limit);
    return [filter, setFilter, opts];
  },
  useInput = (value = '', id, onChange, type, onModify) => {
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
  getIcon = (v) => icons[v] || v,
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
  useOptions,
  useInput,
  getIcon,
  DelBtnWrapper,
  Decorator,
  OptionsPanel,
  arrayEqual,
  filterOptions,
  clickedOutside,
  padToMax,
  calendar,
  useCommand,
};
