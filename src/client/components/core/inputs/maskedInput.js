import {
  Fragment,
  useLayoutEffect,
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { Decorate, Decorator, ClearButton } from '..';
import './styles.css';

export const MaskSlots = ({ value, spec, disabled, onChange }) => {
  const { slots = [], sep } = spec,
    refs = useRef([]),
    cRef = useRef(),
    //!!!TBD: remove date2ISOString, as value expected to be string
    [vals, setVals] = useState(() => [...value]),
    changed = ({ target }) => {
      const id = target.dataset.id,
        slot = slots[id],
        next = refs.current[Number(id) + 1],
        [v, res] = spec[slot.name].change(target.value);
      vals[id] = v;
      setVals([...vals]);
      if (res && next) {
        next.focus();
        next.setSelectionRange(0, 0);
      }
      onChange(vals);
    },
    onFocus = () => {
      cRef.current.classList.remove('no-value');
      // refs.current.forEach((e) => e.classList.add('edit'));
    },
    onBlur = ({ relatedTarget }) => {
      const inside = refs.current.some((e) =>
        e.contains(relatedTarget)
      );
      if (!inside) {
        onChange(vals, true);
        if (!vals.filter(Boolean).length)
          cRef.current.classList.add('no-value');
        // refs.current.forEach((e) => e.classList.remove('edit'));
      }
    },
    onKey = (ev) => {
      if (ev.code === 'Enter') {
        onChange(vals, true);
      } else spec.sanitize(ev);
    },
    show = value.filter(Boolean).length > 0;

  useEffect(() => {
    setVals([...value]);
  }, [value]);

  return (
    <div
      ref={cRef}
      className={classNames(['mask-wrapper'], {
        disabled,
        ['no-value']: !show,
      })}>
      {slots.map((s, i) => (
        <Fragment key={i}>
          <input
            ref={(el) => (refs.current[i] = el)}
            value={vals[i] || ''}
            data-id={i}
            tabIndex="-1"
            disabled={disabled}
            className="input"
            onKeyPress={onKey}
            onChange={changed}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={s.mask}
            style={{ width: `${s.mask.length + 2}ch` }}
          />
          {show && i + 1 < slots.length && <span>{sep}</span>}
        </Fragment>
      ))}
    </div>
  );
};

MaskSlots.propTypes = {
  value: PropTypes.array,
  spec: PropTypes.object,
  locale: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  prepend: PropTypes.string,
  append: PropTypes.string,
  appendType: PropTypes.string,
  style: PropTypes.object,
  clear: PropTypes.bool,
  tabIndex: PropTypes.number,
  blend: PropTypes.bool,
  className: PropTypes.string,
  intent: PropTypes.string,
};

MaskedInput0.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.string,
  type: PropTypes.string,
  locale: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  prepend: PropTypes.string,
  append: PropTypes.string,
  appendType: PropTypes.string,
  style: PropTypes.object,
  clear: PropTypes.bool,
  tabIndex: PropTypes.number,
  blend: PropTypes.bool,
  className: PropTypes.string,
  intent: PropTypes.string,
};
export function MaskedInput0({
  dataid,
  value = '',
  type,
  locale,
  clear,
  prepend,
  append,
  appendType,
  blend,
  style,
  disabled,
  className,
  onChange,
  intent,
}) {
  const onInput = (v) => {
      onChange(v, dataid);
    },
    hasValue = !_.isNil(value);
  // onClear = () => onChange(undefined, dataid);

  return (
    <Decorator
      id={dataid}
      prepend={prepend}
      append={append}
      appendType={appendType}
      blend={blend}
      onChange={onChange}
      className={className}
      hasValue={hasValue}
      intent={intent}
      style={style}>
      <MaskSlots
        value={value}
        onChange={onInput}
        type={type}
        locale={locale}
        disabled={disabled}
      />
      {/* <div className={classNames(['mask-wrapper'], { disabled })}>
        {slots.map((s, i) => (
          <Fragment key={i}>
            <input
              ref={(el) => (refs.current[i] = el)}
              value={vals[i] || ''}
              id={[dataid, i].join('_')}
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
      </div> */}
      <ClearButton
        clear={clear}
        id={dataid}
        disabled={disabled || hasValue}
        onChange={onChange}
      />
    </Decorator>
  );
}

function setCaret(el, pos = 0) {
  el.setSelectionRange(pos, pos);
}
const delKeys = ['Backspace', 'Delete'];
MaskInput.propTypes = {
  spec: PropTypes.object,
  value: PropTypes.string,
  options: PropTypes.array,
  disabled: PropTypes.bool,
  clear: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  onChange: PropTypes.func,
  dropdown: PropTypes.any,
};
//This one is CONTROLLED - never use directly,
//Parent will pass a value as a string formatted accordingly
//so it'll be responsible for decoding result into proper value
export default function MaskInput(props) {
  const {
      spec,
      value,
      // disabled,
      onChange,
    } = props,
    [val, setVal] = useState(value || ''),
    inp = useRef(),
    pos = useRef(0),
    keyInfo = useRef({}),
    // clicked = (ev) => {
    //   const { clear, value } = ev.target.dataset;
    //   if (clear) return true;
    //   if (value) onChange(value);
    // },
    changing = () => {
      const { key, loc } = keyInfo.current;
      keyInfo.current = {};
      if (key) {
        const n_v = _.replaceCharAt(val, loc, key),
          toks = n_v
            .split(spec.sep)
            .map((e, i) => spec[spec.seq[i]].change(e))
            .flat();
        pos.current = loc + 1;
        if (n_v[pos.current] === spec.sep) pos.current++;
        console.log(toks);
        setVal(n_v);
      }
    },
    onKey = (ev) => {
      const { key, target, altKey, ctrlKey, shiftKey } = ev;
      if (key === 'Enter') return report();
      const { value, selectionStart: loc } = target,
        length = value.length,
        m_length = spec.mask.length,
        status = Number(key) > -1 ? 3 : delKeys.indexOf(key) + 1;

      let info =
        !status ||
        altKey ||
        ctrlKey ||
        shiftKey ||
        Math.abs(length - m_length) > 1
          ? {}
          : { key, loc };
      if (status > 0) {
        if (status === 1) info.loc--;
        const char = val[info.loc];
        if (char) {
          if (char === spec.sep) {
            if (status > 1) {
              info.loc++;
            } else info.loc--;
          }
          if (status < 3) {
            info.key = spec.mask[info.loc];
          }
        } else info = {};
      }

      keyInfo.current = info;
    },
    onMouseUp = () => {
      if (!val) {
        setVal(spec.mask);
        pos.current = 0;
      }
    },
    report = () => {
      onChange?.(val);
    };

  useLayoutEffect(() => {
    setCaret(inp.current, pos.current);
  }, [val]);
  useEffect(() => {
    setVal(value || '');
  }, [value]);

  return (
    <Decorate
      {...props}
      //clear={clear ? changed : undefined}
    >
      <input
        ref={inp}
        value={val}
        onChange={changing}
        onMouseUp={onMouseUp}
        onKeyDown={onKey}
        onBlur={report}
        className="no-border entry"
      />
    </Decorate>
  );
}
