import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { Decorator } from '..';
import InputGeneric from './input_generic';
import './styles.css';

Input.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  icon: PropTypes.string,
  info: PropTypes.string,
  infoText: PropTypes.bool,
  style: PropTypes.object,
  clear: PropTypes.bool,
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
    info,
    infoText,
    icon,
    clear,
    style,
    blend,
    intent,
    className,
    ...rest
  } = props;

  return (
    <Decorator
      id={dataid}
      clear={clear}
      icon={icon}
      info={info}
      infoText={infoText}
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
        throttle={700}
        {...rest}
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
      icon="search"
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
