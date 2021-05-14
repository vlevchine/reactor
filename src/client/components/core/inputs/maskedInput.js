import { Fragment, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { Decorator, ClearButton } from '..';
import './styles.css';

export const MaskSlots = ({ value, spec, disabled, onChange }) => {
  const { slots, sep } = spec,
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

const MaskedInput = ({
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
}) => {
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
};

MaskedInput.propTypes = {
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
export default MaskedInput;
