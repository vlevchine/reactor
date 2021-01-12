import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import Icon from './icon/icon';
import Button from './button/button';

const icons = {
    success: 'check-circle',
    info: 'info',
    danger: 'exclamation-triangle',
    warning: 'exclamation-circle',
  },
  icon = (t) => icons[t] || icons.info;

Toast.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  text: PropTypes.string,
  clear: PropTypes.func,
};
export default function Toast({ id, type = 'info', text, clear }) {
  return (
    <div
      className={classNames(['toast'], {
        [`toast-${type}`]: type,
      })}>
      <span>
        <Icon name={icon(type)} size="lg" fa />
        <span>{text}</span>
      </span>
      {clear && (
        <Button icon="times" minimal id={id} onClick={clear} />
      )}
    </div>
  );
}
