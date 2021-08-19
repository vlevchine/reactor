import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Info } from '@app/components/core';

//This will be a group of controls located ina single form cell
InputGroup.propTypes = {
  label: PropTypes.string,
  message: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.any,
  style: PropTypes.object,
  intent: PropTypes.string,
  role: PropTypes.string,
  className: PropTypes.string,
};
export default function InputGroup(props) {
  const {
      intent,
      label,
      hint,
      message,
      role,
      children,
      className,
      style,
    } = props,
    { id, dataid } = children.props || {},
    klass = classNames(['input-group', className, intent]);

  return (
    <div style={style} className={klass} role={role}>
      {children}
      {label && (
        <label htmlFor={id || dataid} className={classNames(['lbl'])}>
          {label}
          {hint && <Info text={hint} />}
        </label>
      )}
      {message && <small className="form-message">{message}</small>}
    </div>
  );
}
