import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { getIcon } from '../icon';
import './styles.css';

Collapsible.propTypes = {
  id: PropTypes.string,
  title: PropTypes.any,
  icon: PropTypes.string,
  iconSize: PropTypes.string,
  className: PropTypes.string,
  labelClass: PropTypes.string,
  open: PropTypes.bool,
  children: PropTypes.any,
  style: PropTypes.object,
};

function Collapsible({
  id,
  title,
  icon = 'caret-left',
  iconSize,
  children,
  className,
  open,
  style,
}) {
  const after = getIcon(icon),
    onClick = (ev) => {
      console.log('checked: ', ev.target.checked);
    },
    klass = classNames(['with-icons i-fa i-s'], {
      [`i-${iconSize}`]: iconSize,
    });

  return (
    <div
      className={classNames(['collapsible', className])}
      style={style}>
      <input
        id={id}
        type="checkbox"
        hidden
        defaultChecked={open ?? true}
        onChange={onClick}
      />
      <label htmlFor={id} data-after={after} className={klass}>
        <span>{title}</span>
      </label>
      {children}
    </div>
  );
}

export default Collapsible;
