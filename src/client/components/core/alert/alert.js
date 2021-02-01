import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Icon } from '../index';
import './alert.css';

const icons = {
  info: 'exclamation-triangle',
  success: 'check-square',
  danger: 'times-octagon',
  warning: 'engine-warning',
};

Alert.propTypes = {
  type: PropTypes.string,
  style: PropTypes.object,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default function Alert({ type, text, style }) {
  return (
    <div
      className={classNames(['alert'], { [type]: type })}
      style={Object.assign(
        {
          '--color': `var(--${type})`,
          '--bgcolor': `var(--${type}-l)`,
        },
        style
      )}>
      <span>
        <Icon name={icons[type]} styled="s" size="xxl" />
      </span>
      <span>{text}</span>
    </div>
  );
}
