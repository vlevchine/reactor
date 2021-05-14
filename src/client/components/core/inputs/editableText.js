import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

EditableText.propTypes = {
  id: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.func,
  ]),
  display: PropTypes.func,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  resetOnDone: PropTypes.bool,
  intent: PropTypes.string,
  style: PropTypes.object,
};
const _placeholder = 'Type name...';
export default function EditableText({
  id,
  value,
  display,
  onChange,
  disabled,
  placeholder = _placeholder,
  resetOnDone,
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
    blurred = (ev) => {
      ev.stopPropagation();
      resetOnDone && setVal(value || '');
      if (val !== value) onChange?.(val, id, { accept: true });
    },
    onKey = (ev) => {
      if (ev.code === 'Enter') {
        document.activeElement.blur();
      } else if (ev.code === 'Escape') {
        setVal(value || '');
        //  document.activeElement.blur();
        onChange?.(value, id, { accept: false });
      }
    };

  useEffect(() => {
    if (val !== value)
      setVal((display ? display(value) : value) || '');
  }, [value]);

  return (
    <input
      className={intent ? `text-editable ${intent}` : 'text-editable'}
      style={style}
      value={val}
      onChange={changed}
      onKeyDown={onKey}
      //  onKeyPress={onKey}
      onBlur={blurred}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}
