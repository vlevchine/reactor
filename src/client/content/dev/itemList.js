import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';

ItemList.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  items: PropTypes.array,
  onSelect: PropTypes.func,
  selected: PropTypes.string,
};
export default function ItemList({
  title,
  items,
  onSelect,
  selected,
  className,
}) {
  const selecting = ({ target }) => {
    onSelect(target.dataset.id );
  };
  return (
    <div className="pane">
      {title && <h6 className="pane-title">{title}</h6>}
      <div
        role="button"
        tabIndex="0"
        onClick={selecting}
        onKeyUp={_.noop}>
        {items.map((e) => (
          <span
            key={e.id}
            data-id={e.id}
            className={classNames([className], {
              ['item-selected']: e.id === selected,
            })}>
            {e.name || e.named}
          </span>
        ))}
      </div>
    </div>
  );
}
