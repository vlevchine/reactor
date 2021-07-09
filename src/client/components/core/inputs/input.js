import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { Decorator, ClearButton } from '..';
import { useInput } from './input_generic';
import './styles.css';

Input.propTypes = {
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
  disabled: PropTypes.bool,
  tabIndex: PropTypes.number,
  blend: PropTypes.bool,
  intent: PropTypes.string,
  className: PropTypes.string,
  throttle: PropTypes.number,
};

export default function Input(props) {
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
      intent,
      className,
      throttle,
    } = props,
    did = dataid || id,
    hasValue = !_.isNil(value),
    { val, changed, onKeyDown, blurred, klass } = useInput(props, {
      throttle,
    });

  return (
    <Decorator
      id={did}
      prepend={prepend}
      append={append}
      appendType={appendType}
      intent={intent}
      hasValue={hasValue}
      className={className}
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
        onFocus={onFocus}
        onKeyDown={onKeyDown}
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
