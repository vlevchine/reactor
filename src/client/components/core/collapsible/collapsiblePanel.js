import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { useCollapse } from '../helpers';

CollapsiblePanel.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.any,
  hidden: PropTypes.bool,
  collapsed: PropTypes.bool,
};
export default function CollapsiblePanel({
  title,
  className,
  style,
  hidden,
  collapsed,
  children,
}) {
  const [src, tgt] = useCollapse(collapsed);
  //TBD: always start open???
  return hidden ? null : (
    <section
      className={classNames(['panel', className])}
      style={style}>
      <div ref={src} className="panel-header">
        <i className="clip-icon caret-down" />
        {title}
      </div>
      <div ref={tgt} className="panel-body">
        {children}
      </div>
    </section>
  );
}
