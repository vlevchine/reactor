import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import InputGeneric from './input_generic';
import { Decorator, ClearButton } from '..';

TextArea.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.string,
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  prepend: PropTypes.string,
  append: PropTypes.string,
  disabled: PropTypes.bool,
  clear: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
  onChange: PropTypes.func,
  intent: PropTypes.string,
};
export default function TextArea(props) {
  const {
      dataid,
      value,
      onChange,
      append,
      prepend,
      clear,
      disabled,
      style,
      rows = 4,
      className,
      intent,
      ...rest
    } = props,
    hasValue = !_.isNil(value);

  return (
    <Decorator
      prepend={prepend}
      append={append}
      onChange={onChange}
      hasValue={hasValue}
      className={className}
      intent={intent}
      style={style}>
      <InputGeneric
        kind="textarea"
        dataid={dataid}
        onChange={onChange}
        value={value}
        disabled={disabled}
        dir="auto"
        rows={rows}
        withKeyDown
        {...rest}
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
