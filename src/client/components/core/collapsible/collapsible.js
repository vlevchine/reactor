import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Icon } from '..';
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
  //iconSize,
  children,
  className,
  open,
  style,
}) {
  const onClick = (ev) => {
    console.log('checked: ', ev.target.checked);
  };

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
      <label htmlFor={id} className={className}>
        <span>{title}</span>
        <Icon name={icon} styled="s" />
      </label>
      {children}
    </div>
  );
}

export default Collapsible;
