import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

Portal.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.any,
};

const select = ({ id, className }) =>
  id
    ? document.getElementById(id)
    : document.getElementsByClassName(className)?.item(0);

export default function Portal(props) {
  const [el, setEl] = useState(select(props));

  useEffect(() => {
    setEl(select(props));
  }, []);

  return el ? createPortal(props.children, el) : null;
}
