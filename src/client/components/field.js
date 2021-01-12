import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Info } from './core/icon/icon';

//Basic wrapper - label + message, intent, ect.
// to be used directly in code, grid positioning must be provided via style
// inside Formit, a wrapper over it - Field -will be used to provide styling
Field.propTypes = {
  label: PropTypes.string,
  message: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.any,
  wrapStyle: PropTypes.object,
  intent: PropTypes.string,
  transient: PropTypes.bool,
  role: PropTypes.string,
  hasValue: PropTypes.bool,
  id: PropTypes.string,
};
export default function Field(props) {
  const {
      id,
      transient,
      intent,
      label,
      hint,
      message,
      role,
      hasValue,
      children,
      wrapStyle,
    } = props,
    klass = classNames(['form-control'], {
      [intent]: intent,
      ['has-value']: hasValue,
      ['no-pad']: !transient,
    });

  return (
    <div style={wrapStyle} className={klass} role={role}>
      {children}
      {label && (
        <label
          htmlFor={id}
          className={classNames([
            'form-label',
            `lbl-${transient ? 'transient' : 'static'}`,
          ])}>
          {label}
          {hint && <Info text={hint} />}
        </label>
      )}
      {message && <small className="form-message">{message}</small>}
    </div>
  );
}
