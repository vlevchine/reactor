import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import InputGeneric from './input_generic';
import { Decorator } from '..';

TextArea.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.string,
  rows: PropTypes.number,
  icon: PropTypes.string,
  info: PropTypes.string,
  fill: PropTypes.bool,
  clear: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
  onChange: PropTypes.func,
  blend: PropTypes.bool,
};
export default function TextArea(props) {
  const {
    dataid,
    value,
    onChange,
    info,
    icon,
    clear,
    style,
    blend,
    rows = 4,
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
        kind="textarea"
        dataid={dataid}
        onChange={onChange}
        value={value}
        dir="auto"
        rows={rows}
        {...rest}
      />
    </Decorator>
  );
}
