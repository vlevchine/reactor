import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { Decorator, ClearButton } from '..';
import { useInput } from './input_generic';
import './styles.css';

Input.propTypes = {
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
    hasValue = !_.isNil(value),
    { val, changed, onKeyDown, blurred, klass } = useInput(props, {
      throttle,
    });

  return (
    <Decorator
      id={dataid}
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
        id={dataid}
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
};
export function SearchInput(props) {
  const { dataid, value, onChange, style, placeholder } = props,
    { val, changed, onKeyDown, blurred, klass } = useInput(props, {
      throttle: 200,
    });
  return (
    <Decorator
      id={dataid}
      clear={2}
      prepend="search"
      blend
      onChange={onChange}
      hasValue={!_.isNil(value)}
      style={style}>
      <input
        type="text"
        name={name}
        value={val}
        className={klass}
        style={style}
        onChange={changed}
        onBlur={blurred}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
    </Decorator>
  );
}
