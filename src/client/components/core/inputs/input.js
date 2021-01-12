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
  style: PropTypes.object,
  clear: PropTypes.bool,
  tabIndex: PropTypes.number,
  blend: PropTypes.bool,
};

export default function Input(props) {
  const {
    dataid,
    value,
    onChange,
    info,
    icon,
    clear,
    style,
    blend,
    ...rest
  } = props;

  return (
    <Decorator
      id={dataid}
      clear={clear}
      icon={icon}
      info={info}
      blend={blend}
      onChange={onChange}
      className="input-wrapper"
      hasValue={!_.isNil(value)}
      style={style}>
      <InputGeneric
        kind="input"
        dataid={dataid}
        onChange={onChange}
        value={value}
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
