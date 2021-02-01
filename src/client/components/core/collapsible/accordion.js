import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import { mergeIds } from '../helpers';
import Collapsible from './collapsible';
import { Button, Icon } from '..';
import './styles.css';

const btnStyle = { justifyContent: 'flex-start' };
const NodeList = ({
  parent,
  items,
  itemsProp,
  labelProp,
  className,
  onSelect,
  open,
}) => {
  return (
    <div className={classNames(['accordion', className])}>
      {items.map((e) => {
        const _id = mergeIds(parent, e.id),
          expanded = open.startsWith(_id);

        return e.items ? (
          <Collapsible
            key={e.id}
            id={e.id}
            className="menu-item"
            open={expanded}
            title={
              <span>
                <Icon name={e.icon} />
                {e[labelProp]}
              </span>
            }>
            <NodeList
              parent={_id}
              items={e[itemsProp]}
              itemsProp={itemsProp}
              labelProp={labelProp}
              onSelect={onSelect}
              open={open}
            />
          </Collapsible>
        ) : (
          <Button
            key={e.id}
            id={e.route}
            minimal
            text={e[labelProp]}
            icon={e.icon}
            style={btnStyle}
            className="menu-button"
            onClick={onSelect}
          />
        );
      })}
    </div>
  );
};

const Accordion = (props) => {
  const {
      items,
      itemsProp = 'items',
      labelProp = 'label',
      onSelect = _.noop,
      selected = '',
      className,
    } = props,
    onLeaf = (_, id) => {
      onSelect(id);
    };

  return (
    <NodeList
      items={items}
      itemsProp={itemsProp}
      labelProp={labelProp}
      open={selected}
      onSelect={onLeaf}
      className={className}
    />
  );
};

NodeList.propTypes = {
  parent: PropTypes.string,
  items: PropTypes.array,
  itemsProp: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  labelProp: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  open: PropTypes.string,
  onSelect: PropTypes.func,
};
Accordion.propTypes = {
  items: PropTypes.array,
  itemsProp: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  labelProp: PropTypes.string,
  selected: PropTypes.string,
  onSelect: PropTypes.func,
  expandAll: PropTypes.bool,
  className: PropTypes.string,
};

export default Accordion;
