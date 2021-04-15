/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { mergeIds, useCollapse } from '../helpers';
import { Button, Icon } from '..';
import './styles.css';

const btnStyle = { justifyContent: 'flex-start' };
const CollapsibleNode = ({
  parent,
  item,
  spec,
  onSelect,
  onCollapse,
  collapsed,
  selected,
  className,
}) => {
  const _id = mergeIds(parent, item.id),
    { iconExpand, items } = spec,
    onCollapsing = (msg) => {
      msg.id = _id;
      onCollapse?.(msg);
    },
    onSelecting = (ev) => {
      onSelect?.(ev, _id);
    },
    [src, tgt] = useCollapse(
      collapsed?.includes(_id),
      iconExpand ? 'left' : undefined,
      onCollapsing
    ),
    isSelected = _id === selected,
    icon = item.icon || spec.icon?.(item);

  return (
    <div id={item.id} className="menu-item">
      <div
        ref={src}
        className={classNames(['menu-button'], {
          ['item-selected']: isSelected,
        })}
        onClick={onSelecting}>
        {icon && <Icon name={icon} />}
        <span className="btn-text">
          {spec?.label?.(item) || item.label}
        </span>
        {!iconExpand && <i className="clip-icon caret-down" />}
      </div>

      <div ref={tgt} className={classNames(['accordion', className])}>
        <NodeList
          parent={_id}
          items={item[items]}
          spec={spec}
          onSelect={onSelect}
          selected={selected}
          open={open}
        />
      </div>
    </div>
  );
};

const NodeList = ({
  items,
  onSelect,
  selected,
  spec,
  parent,
  ...rest
}) => {
  return (
    <>
      {items?.map((e) => {
        const id = mergeIds(parent, e.id);

        return e[spec.items] ? (
          <CollapsibleNode
            {...rest}
            key={e.id}
            parent={parent}
            item={e}
            spec={spec}
            onSelect={onSelect}
            selected={selected}
          />
        ) : (
          <Button
            key={e.id}
            id={e.route || id}
            minimal
            text={spec?.label?.(e) || e.label}
            prepend={e.icon || spec?.icon?.(e)}
            style={btnStyle}
            className={classNames(['menu-button'], {
              ['item-selected']: id === selected,
            })}
            onClick={onSelect}
          />
        );
      })}
    </>
  );
};

const Accordion = (props) => {
  const { id, spec, items, className, ...rest } = props,
    _spec = Object.assign({ items: 'items', label: 'label' }, spec);

  return (
    <div className={classNames(['accordion', className])}>
      <NodeList
        {...rest}
        parent={id}
        items={items}
        spec={_spec}
        className={className}
      />
    </div>
  );
};

CollapsibleNode.propTypes = {
  parent: PropTypes.string,
  item: PropTypes.object,
  itemsProp: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  spec: PropTypes.object,
  onClick: PropTypes.func,
  className: PropTypes.string,
  collapsed: PropTypes.array,
  selected: PropTypes.string,
  onSelect: PropTypes.func,
  onCollapse: PropTypes.func,
  selectedClass: PropTypes.string,
};
NodeList.propTypes = {
  parent: PropTypes.string,
  items: PropTypes.array,
  itemsProp: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  spec: PropTypes.object,
  onClick: PropTypes.func,
  className: PropTypes.string,
  selected: PropTypes.string,
  onSelect: PropTypes.func,
};
Accordion.propTypes = {
  id: PropTypes.string,
  items: PropTypes.array,
  itemsProp: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  spec: PropTypes.object,
  className: PropTypes.string,
};

export default Accordion;
