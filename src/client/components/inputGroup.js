import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Info } from './core/icon';

//Basic wrapper - label + message, intent, ect.
// to be used directly in code, grid positioning must be provided via style
// inside Formit, a wrapper over it - Field -will be used to provide styling
InputGroup.propTypes = {
  label: PropTypes.string,
  message: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.any,
  style: PropTypes.object,
  intent: PropTypes.string,
  role: PropTypes.string,
};
export default function InputGroup(props) {
  const {
      intent,
      label,
      hint,
      message,
      role,
      children,
      style,
    } = props,
    { value, id, dataid } = children.props || {},
    klass = classNames(['input-wrapper'], {
      [intent]: intent,
      ['has-value']: value !== undefined,
    });

  return (
    <div style={style} className={klass} role={role}>
      {children}
      {label && (
        <label
          htmlFor={id || dataid}
          className={classNames(['input-label'])}>
          {label}
          {hint && <Info text={hint} />}
        </label>
      )}
      {message && <small className="input-message">{message}</small>}
    </div>
  );
}
