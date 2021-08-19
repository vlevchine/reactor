import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';

const defaultRender = (e) => <span>{e.name}</span>;

ItemList.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  items: PropTypes.array,
  onSelect: PropTypes.func,
  selected: PropTypes.string,
  render: PropTypes.func,
};
export default function ItemList({
  title,
  items,
  onSelect,
  selected,
  className,
  render,
}) {
  const ref = useRef(null),
    onClick = ({ target }) => {
      const id = target.dataset.id || target.parentElement.dataset.id;
      onSelect(id);
    },
    renderer = render || defaultRender;

  useEffect(() => {
    ref.current?.addEventListener('click', onClick);
    return () => ref.current?.removeEventListener('click', onClick);
  }, [onSelect]);

  return (
    <div className="pane">
      {title && <h6 className="pane-title">{title}</h6>}
      <ul ref={ref} role="radiogroup" tabIndex="0">
        {(items || []).map((e) => (
          <li
            key={e.id}
            data-id={e.id}
            className={classNames([className], {
              ['item-selected']: e.id === selected,
            })}>
            {renderer(e)}
          </li>
        ))}
      </ul>
    </div>
  );
}
