import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { useInput, Decorator } from './helpers';

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
  disabled: PropTypes.bool,
};
export default function TextArea(props) {
  const {
    dataid,
    value,
    onChange,
    rows = 4,
    disabled,
    icon,
    info,
    clear,
    fill,
    className,
    style,
  } = props;
  const [val, changed, blurred, keyPressed] = useInput(
      value,
      dataid,
      onChange
    ),
    klass = classNames([className, 'input']);

  return (
    <Decorator
      id={dataid}
      onChange={onChange}
      clear={clear}
      icon={icon}
      info={info}
      fill={fill}
      style={style}
      styled="l">
      <textarea
        value={val}
        onChange={changed}
        className={klass}
        style={style}
        rows={rows}
        onBlur={blurred}
        onKeyDown={keyPressed}
        disabled={disabled}
        dir="auto"
      />
    </Decorator>
  );
}
