import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { Decorate, Decorator, ClearButton, Readonly } from '..';
import { useInput } from './input_generic';
import './styles.css';

Input0.propTypes = {
  id: PropTypes.string,
  dataid: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  prepend: PropTypes.string,
  append: PropTypes.string,
  appendType: PropTypes.string,
  style: PropTypes.object,
  clear: PropTypes.bool,
  minimal: PropTypes.bool,
  underlined: PropTypes.bool,
  disabled: PropTypes.bool,
  tabIndex: PropTypes.number,
  readonly: PropTypes.bool,
  intent: PropTypes.string,
  className: PropTypes.string,
  throttle: PropTypes.number,
  focus: PropTypes.bool,
};

export function Input0(props) {
  const {
      id,
      dataid,
      value,
      onChange,
      onFocus,
      placeholder,
      append,
      appendType,
      prepend,
      clear,
      disabled,
      style,
      readonly,
      minimal,
      underlined,
      focus,
      intent,
      className,
      throttle,
    } = props,
    did = dataid || id,
    hasValue = !_.isNil(value),
    { val, changed, onKeyDown, blurred, klass } = useInput(props, {
      throttle,
    });

  return readonly ? (
    <Readonly txt={val || undefined} />
  ) : (
    <Decorator
      id={did}
      prepend={prepend}
      append={append}
      appendType={appendType}
      intent={intent}
      hasValue={hasValue}
      disabled={disabled}
      minimal={minimal}
      underlined={underlined}
      className={className}
      style={style}>
      <input
        type="text"
        name={name}
        value={val}
        className={klass}
        style={style}
        onChange={changed}
        onBlur={blurred}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        focus={focus}
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

SearchInput.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  style: PropTypes.object,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  includes: PropTypes.bool,
};
export function SearchInput(props) {
  const {
      dataid,
      value,
      onChange,
      style,
      placeholder,
      includes,
      disabled,
    } = props,
    report = (v) => {
      const val = includes || !v ? v : `^${v}`;
      onChange?.(val);
    },
    { val, changed, onKeyDown, blurred, klass } = useInput(props, {
      throttle: 200,
      onChange: report,
      force: true,
    });

  return (
    <Decorator
      id={dataid}
      clear={2}
      prepend="search"
      blend
      className={disabled ? 'disabled' : undefined}
      onChange={changed}
      hasValue={!_.isNil(value)}
      style={style}>
      <input
        type="text"
        name={name}
        value={val}
        className={klass}
        style={style}
        disabled={disabled}
        onChange={changed}
        onBlur={blurred}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
    </Decorator>
  );
}

Input.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  clear: PropTypes.bool,
  uncontrolled: PropTypes.bool,
  onChange: PropTypes.func,
};
function asState(v) {
  return v || '';
}
export default function Input(props) {
  const { id, value, clear, uncontrolled, onChange } = props,
    [_value, setValue] = useState(asState(value)),
    onKey = (ev) => {
      if (ev.code === 'Enter') report(_value);
    },
    report = (v) => {
      if (uncontrolled) setValue(asState(v));
      if (value !== v) onChange?.(v || undefined, id);
    },
    blur = () => {
      report(_value);
    },
    changed = (ev) => {
      setValue(ev.target.value);
    };

  useEffect(() => {
    setValue(asState(value));
  }, [value]);

  return (
    <Decorate
      {...props}
      clear={clear && !!_value ? report : undefined}>
      <input
        value={_value}
        onChange={changed}
        onKeyPress={onKey}
        onBlur={blur}
      />
    </Decorate>
  );
}
