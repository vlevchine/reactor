import { useRef } from 'react'; //,, useEffectuseState,  classNames
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { useInput } from './input_generic';
import { Decorator, ClearButton, Readonly } from '..';

TextArea.propTypes = {
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
export default function TextArea(props) {
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
