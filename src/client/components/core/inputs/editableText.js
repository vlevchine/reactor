import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Readonly } from '..';

EditableText.propTypes = {
  id: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
    PropTypes.func,
  ]),
  display: PropTypes.func,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  resetOnDone: PropTypes.bool,
  blurOnEnter: PropTypes.bool,
  intent: PropTypes.string,
  style: PropTypes.object,
};
const _placeholder = 'Type name...';
export default function EditableText({
  id,
  value,
  display,
  onChange,
  onFocus,
  onBlur,
  disabled,
  placeholder = _placeholder,
  readonly,
  resetOnDone,
  blurOnEnter,
  intent,
  style,
}) {
  const [val, setVal] = useState(
      (display ? display(value) : value) || ''
    ),
    changed = (ev) => {
      const v = ev.target.value;
      setVal(v);
      if (v !== value) onChange?.(v, id, false);
    },
    report = () => {
      resetOnDone && setVal(value || '');
      const _v = value || '';
      if (val !== _v) {
        onChange?.(val, id, { accept: true });
      } else onBlur?.();
    },
    blurred = (ev) => {
      //TBD - button click has higher priority than blur
      //should add a prop for that????
      // if (ev.relatedTarget?.type !== 'button') {
      ev.stopPropagation();
      report();
      //  } else if (resetOnDone) setVal('');
    },
    onKey = (ev) => {
      if (ev.code === 'Enter') {
        if (blurOnEnter) {
          document.activeElement.blur();
        } else report();
      } else if (ev.code === 'Escape') {
        setVal(value || '');
        //  document.activeElement.blur();
        onChange?.(value, id, { accept: false });
      }
    },
    focused = () => {
      onFocus?.(id);
    };

  useEffect(() => {
    if (val !== value)
      setVal((display ? display(value) : value) || '');
  }, [value]);

  return readonly ? (
    <Readonly txt={val || undefined} />
  ) : (
    <input
      className={intent ? `text-editable ${intent}` : 'text-editable'}
      style={style}
      value={val}
      onFocus={focused}
      onChange={changed}
      onKeyDown={onKey}
      //  onKeyPress={onKey}
      onBlur={blurred}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}
