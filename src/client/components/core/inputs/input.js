import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { Decorator, ClearButton } from '..';
import InputGeneric from './input_generic';
import './styles.css';

Input.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
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
};

export default function Input(props) {
  const {
    dataid,
    value,
    onChange,
    append,
    appendType,
    prepend,
    clear,
    disabled,
    style,
    blend,
    intent,
    className,
    ...rest
  } = props;

  return (
    <Decorator
      id={dataid}
      prepend={prepend}
      append={append}
      appendType={appendType}
      blend={blend}
      intent={intent}
      onChange={onChange}
      hasValue={!_.isNil(value)}
      className={className}
      style={style}>
      <InputGeneric
        kind="input"
        dataid={dataid}
        onChange={onChange}
        value={value}
        disabled={disabled}
        throttle={700}
        {...rest}
      />
      <ClearButton
        clear={clear && !disabled}
        id={dataid}
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
  const { dataid, value, onChange, style, placeholder } = props;
  return (
    <Decorator
      id={dataid}
      clear={2}
      prepend="search"
      blend
      onChange={onChange}
      hasValue={!_.isNil(value)}
      style={style}>
      <InputGeneric
        kind="input"
        dataid={dataid}
        throttle={200}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
      />
    </Decorator>
  );
}
