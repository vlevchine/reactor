import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Info } from './core/icon';

//Basic wrapper - label + message, intent, ect.
// to be used directly in code, grid positioning must be provided via style
// inside Formit, a wrapper over it - Field -will be used to provide styling
InputWrapper.propTypes = {
  label: PropTypes.string,
  message: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.any,
  wrapStyle: PropTypes.object,
  intent: PropTypes.string,
  role: PropTypes.string,
  hasValue: PropTypes.bool,
  id: PropTypes.string,
};
export default function InputWrapper(props) {
  const {
      id,
      intent,
      label,
      hint,
      message,
      role,
      hasValue,
      children,
      wrapStyle,
    } = props,
    klass = classNames(['input-wrapper'], {
      [intent]: intent,
      ['has-value']: hasValue,
    });

  return (
    <div style={wrapStyle} className={klass} role={role}>
      {children}
      {label && (
        <label htmlFor={id} className={classNames(['input-label'])}>
          {label}
          {hint && <Info text={hint} />}
        </label>
      )}
      {message && <small className="input-message">{message}</small>}
    </div>
  );
}
