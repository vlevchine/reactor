import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Icon } from '..';
import './styles.css';
import { useRef, useEffect } from 'react';

function useCollapse(id, open) {
  const ref = useRef();
  useEffect(() => {
    ref.current.classList.add('collapsible');
    const el = document.createElement('input'),
      first = [...ref.current.childNodes][0];
    el.setAttribute('id', id);
    el.setAttribute('type', 'checkbox');
    el.setAttribute('hidden', true);
    el.setAttribute('checked', open ?? true);
    ref.current.insertBefore(el, first);
  }, []);

  return ref;
}

Collapsible.propTypes = {
  id: PropTypes.string,
  title: PropTypes.any,
  prepend: PropTypes.string,
  iconSize: PropTypes.string,
  className: PropTypes.string,
  labelClass: PropTypes.string,
  open: PropTypes.bool,
  children: PropTypes.any,
  style: PropTypes.object,
};
export default function Collapsible({
  id,
  title,
  prepend = 'caret-left',
  //iconSize,
  children,
  className,
  open,
  style,
}) {
  const [ref] = useCollapse(id, open);
  // const onClick = (ev) => {
  //   console.log('checked: ', ev.target.checked);
  // };

  return (
    <div ref={ref} className={classNames([className])} style={style}>
      <label data-collapse-source htmlFor={id} className={className}>
        <span>{title}</span>
        <Icon name={prepend} styled="s" />
      </label>
      {children}
    </div>
  );
}

Collapsible0.propTypes = {
  id: PropTypes.string,
  title: PropTypes.any,
  prepend: PropTypes.string,
  iconSize: PropTypes.string,
  className: PropTypes.string,
  labelClass: PropTypes.string,
  open: PropTypes.bool,
  children: PropTypes.any,
  style: PropTypes.object,
};
export function Collapsible0({
  id,
  title,
  prepend = 'caret-left',
  //iconSize,
  children,
  className,
  open,
  style,
}) {
  // const onClick = (ev) => {
  //   console.log('checked: ', ev.target.checked);
  // };

  return (
    <div
      className={classNames(['collapsible', className])}
      style={style}>
      <input
        id={id}
        type="checkbox"
        hidden
        defaultChecked={open ?? true}
        // onChange={onClick}
      />
      <label htmlFor={id} className={className}>
        <span>{title}</span>
        <Icon name={prepend} styled="s" />
      </label>
      <div></div>
      {children}
    </div>
  );
}
