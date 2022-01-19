import { useRef, useState, useEffect } from 'react'; //,, useEffectuseState,  classNames
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { useInput } from './input_generic';
import { Decorate, Decorator, ClearButton, Readonly } from '..';

TextArea0.propTypes = {
  id: PropTypes.string,
  dataid: PropTypes.string,
  value: PropTypes.any,
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cols: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  style: PropTypes.object,
  clear: PropTypes.bool,
  disabled: PropTypes.bool,
  tabIndex: PropTypes.number,
  readonly: PropTypes.bool,
  intent: PropTypes.string,
  className: PropTypes.string,
  expandable: PropTypes.bool,
  throttle: PropTypes.number,
};
export function TextArea0(props) {
  const {
      id,
      dataid,
      value,
      onChange,
      onFocus,
      placeholder,
      clear,
      disabled,
      style,
      readonly,
      intent,
      className,
      rows,
      cols,
      expandable,
      // throttle,
    } = props,
    did = dataid || id,
    ref = useRef(),
    hasValue = !_.isNil(value),
    { val, setVal, changed, blurred, klass } = useInput(props, {
      //throttle,, onKeyDown,
      className: expandable && 'area-expand',
    }),
    onKey = () => {
      ref.current.style.height = `${ref.current.scrollHeight}px`;
      // onKeyDown(ev);
    },
    onPaste = (ev) => {
      let data = ev.clipboardData || window.clipboardData,
        txt = data.getData('text'),
        tgt = ev.target,
        loc = tgt.selectionStart,
        n_loc = loc + txt.length;
      ev.preventDefault();
      Promise.resolve()
        .then(() => {
          setVal(
            tgt.value.substring(0, loc) +
              txt +
              tgt.value.substring(loc)
          );
        })
        .then(() => {
          ref.current?.setSelectionRange(n_loc, n_loc);
          ref.current.style.height = `${ref.current.scrollHeight}px`;
        });
    };

  return readonly ? (
    <Readonly txt={val || undefined} />
  ) : (
    <Decorator
      intent={intent}
      disabled={disabled}
      className={className}
      style={style}>
      <textarea
        ref={ref}
        name={name}
        value={val}
        cols={cols || 40}
        rows={rows || 2}
        className={klass}
        onChange={changed}
        onBlur={blurred}
        onFocus={onFocus}
        onKeyDown={onKey}
        onPaste={onPaste}
        placeholder={placeholder}
      />
      <ClearButton
        clear={clear}
        id={did}
        disabled={disabled || !hasValue}
        onChange={onChange}
      />
    </Decorator>
  );
}

TextArea.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  clear: PropTypes.bool,
  onChange: PropTypes.func,
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cols: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
function asState(v) {
  return v || '';
}
function adjustHeight(ref) {
  ref.style.height = `${ref.scrollHeight}px`;
}
export default function TextArea(props) {
  const { id, value, clear, cols, rows, onChange } = props,
    ref = useRef(),
    [_value, setValue] = useState(asState(value)),
    onKey = (ev) => {
      adjustHeight(ref.current);
      if (ev.code === 'Enter') report();
    },
    report = () => {
      if (value !== _value) onChange?.(_value || undefined, id);
    },
    changed = (ev) => {
      setValue(ev.target.value);
    },
    onPaste = async (ev) => {
      let data = ev.clipboardData || window.clipboardData,
        txt = data.getData('text'),
        tgt = ev.target,
        loc = tgt.selectionStart,
        n_loc = loc + txt.length;
      ev.preventDefault();
      Promise.resolve()
        .then(() => {
          setValue(
            tgt.value.substring(0, loc) +
              txt +
              tgt.value.substring(loc)
          );
        })
        .then(() => {
          ref.current?.setSelectionRange(n_loc, n_loc);
          adjustHeight(ref.current);
        });
    };

  useEffect(() => {
    setValue(asState(value));
  }, [value]);

  return (
    <Decorate {...props} clear={clear && !!_value}>
      <textarea
        ref={ref}
        cols={cols || 40}
        rows={rows || 2}
        value={_value}
        onChange={changed}
        onKeyDown={onKey}
        onPaste={onPaste}
        onBlur={report}
      />
    </Decorate>
  );
}
