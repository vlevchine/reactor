import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { Decorator, ClearButton, Readonly } from '..';

TextArea.propTypes = {
  dataid: PropTypes.string,
  id: PropTypes.string,
  value: PropTypes.string,
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cols: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  prepend: PropTypes.string,
  append: PropTypes.string,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  clear: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
  expandable: PropTypes.bool,
  onChange: PropTypes.func,
  intent: PropTypes.string,
};
export default function TextArea(props) {
  const {
      dataid,
      id,
      value,
      onChange,
      clear,
      disabled,
      style,
      rows = 2,
      cols = 40,
      className,
      expandable,
      intent,
      readonly,
    } = props,
    hasValue = !_.isNil(value),
    [val, setVal] = useState(value),
    ref = useRef(),
    changing = ({ target }) => {
      setVal(target.value);
    },
    report = () => {
      if (val !== value) onChange?.(val, dataid || id);
    },
    onKey = () => {
      //if (ev.code !== 'Enter') {
      ref.current.style.height = `${ref.current.scrollHeight}px`;
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

  useEffect(() => {
    setVal(value);
  }, [value]);

  return readonly ? (
    <Readonly txt={val || undefined} />
  ) : (
    <Decorator
      onChange={onChange}
      hasValue={hasValue}
      className={className}
      intent={intent}
      style={style}>
      <textarea
        ref={ref}
        dataid={dataid}
        onChange={changing}
        value={val}
        className={classNames(['input'], {
          'area-expand': expandable,
        })}
        disabled={disabled}
        onBlur={report}
        onKeyPress={onKey}
        onPaste={onPaste}
        cols={cols}
        rows={rows}
      />
      <ClearButton
        clear={clear}
        id={dataid}
        disabled={disabled || !hasValue}
        onChange={onChange}
      />
    </Decorator>
  );
}
