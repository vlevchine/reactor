import { useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';

RawHtml.propTypes = {
  Type: PropTypes.string,
  inner: PropTypes.string,
  children: PropTypes.any,
  style: PropTypes.object,
};
export default function RawHtml({ style, inner, children }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (inner) ref.current.innerHTML = inner;
  }, []);

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}
