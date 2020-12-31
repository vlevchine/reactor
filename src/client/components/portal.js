import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

Portal.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  withChild: PropTypes.string,
  children: PropTypes.any,
};

export default function Portal({
  id,
  className,
  withChild,
  children,
}) {
  const [el, setEl] = useState();

  useEffect(() => {
    const root = id
      ? document.getElementById(id)
      : document.getElementsByClassName(className)?.item(0);

    if (withChild) {
      const child = document.createElement('div');
      withChild && child.classList.add(withChild);
      root.appendChild(child);
      setEl(child);
    } else setEl(root);
  }, []);

  return el ? createPortal(children, el) : null;
}
