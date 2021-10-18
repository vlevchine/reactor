import { useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';

RawHtml.propTypes = {
  Type: PropTypes.string,
  className: PropTypes.string,
  inner: PropTypes.string,
  children: PropTypes.any,
  style: PropTypes.object,
  value: PropTypes.any,
};
export default function RawHtml({
  className,
  style,
  inner,
  children,
  ...rest
}) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (inner) ref.current.innerHTML = inner;
  }, []);

  return (
    <div className={className} ref={ref} style={style}>
      {_.isFunction(children) ? children(rest) : children}
    </div>
  );
}
