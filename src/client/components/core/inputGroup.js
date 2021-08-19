import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Info } from '.';

InputGroup.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  role: PropTypes.string,
  message: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.any,
  style: PropTypes.object,
  className: PropTypes.string,
  transient: PropTypes.bool,
  readonly: PropTypes.bool,
  intent: PropTypes.string,
};
export default function InputGroup({
  id,
  label,
  role,
  message,
  hint,
  intent,
  className,
  style,
  transient,
  readonly,
  children,
}) {
  const klass = classNames([className, 'input-group'], {
    [intent]: intent,
    ['no-pad']: !transient && label,
  });

  return (
    <div style={style} className={klass} role={role}>
      {children}
      {label && (
        <label
          htmlFor={id}
          className={classNames([
            'lbl',
            `lbl-${transient && !readonly ? 'transient' : 'static'}`,
          ])}>
          {label}
          {hint && <Info text={hint} />}
        </label>
      )}
      {message && !readonly && (
        <span className="help-block">{message}</span>
      )}
    </div>
  );
}
