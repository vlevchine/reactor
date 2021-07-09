import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { useCollapse } from '../helpers';

CollapsiblePanel.propTypes = {
  title: PropTypes.any,
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
  const [ref] = useCollapse(collapsed),
    composedTitle = _.isFunction(title);

  //TBD: always start open???
  return hidden ? null : (
    <section
      ref={ref}
      className={classNames(['panel', className])}
      style={style}>
      <div data-collapse-source className="panel-header">
        <i className="clip-icon caret-down" />
        {title?.props ? title : composedTitle ? title?.() : title}
      </div>
      <div data-collapse-target className="panel-body">
        {children}
      </div>
    </section>
  );
}
