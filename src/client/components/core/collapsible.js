import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { getIcon } from './helpers';

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
const l_Class = 'icon icon-fa i-after i-s';
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
    onClick = () => {
      //report (ev.target.checked);
    },
    klass = iconSize ? `${l_Class} i-${iconSize}` : l_Class;

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
        {title}
      </label>
      {children}
    </div>
  );
}

export default Collapsible;
