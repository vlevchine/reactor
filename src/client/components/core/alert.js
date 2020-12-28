import PropTypes from 'prop-types';
import Icon from './icon';

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
      className="alert"
      style={Object.assign(
        {
          '--color': `var(--${type})`,
          '--bgcolor': `var(--${type}-l)`,
        },
        style
      )}>
      <span>
        <Icon name={icons[type]} fa styled="s" size="xl" />
      </span>
      <span>{text}</span>
    </div>
  );
}
