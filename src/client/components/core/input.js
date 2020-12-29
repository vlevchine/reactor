import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import { useInput, Decorator } from './helpers';

//2 modes: debounce - use debounce effect by with debounce prop set in ms,
//otherwise, notify onBlur only
Input.propTypes = {
  type: PropTypes.string,
  dataid: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.string,
  info: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onModify: PropTypes.func,
  style: PropTypes.object,
  onChange: PropTypes.func,
  fill: PropTypes.bool,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.bool,
  clear: PropTypes.bool,
  tabIndex: PropTypes.number,
};
const use = ['disabled', 'name', 'tabIndex', 'autoComplete'];
export default function Input(props) {
  const {
      type = 'text',
      dataid,
      value,
      onChange,
      onModify,
      info,
      icon,
      clear,
      fill,
      className,
      style,
      ...rest
    } = props,
    other = _.pick(rest, use),
    [val, handlers] = useInput(
      value,
      dataid,
      onChange,
      type,
      onModify
    ),
    klass = classNames([className, 'input'], { fill });
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
      <input {...other} value={val} className={klass} {...handlers} />
    </Decorator>
  );
}
