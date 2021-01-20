import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import { Button, Icon } from '..';
import './styles.css';
//, useMemo, useRef, useEffect
const itemStyle = (i, j, span = 0) => ({
  gridArea: `${i}/${j}/${i + 1}/${j + span + 1}`,
});

Row.propTypes = {
  value: PropTypes.object,
  open: PropTypes.bool,
  ind: PropTypes.number,
  columns: PropTypes.array,
  visible: PropTypes.array,
  hidden: PropTypes.array,
  renderers: PropTypes.array,
  status: PropTypes.number,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
};

export default function Row({
  value,
  open,
  ind,
  visible = [],
  onClick,
  onDoubleClick,
  status = 0,
  hidden = [],
  //renderers,
  // onCommand,
}) {
  const el = useRef(null),
    [expanded, expand] = useState(false),
    // onEdit = () => {
    //   // setEdit(true);
    //   // el.current.focus();
    //   // const rect = getBoundingClientRect();
    //   // console.log('editr', rect, id);ev, id
    // },
    // onEditEnd = () => {
    //   //   setEdit(false);
    //   //   onSelect?.();
    // },
    onBlur = () => {
      //   setTimeout(() => {
      //     if (!el.current.contains(document.activeElement)) {
      //       onEditEnd();
      //
      //     }
      //   }, 0);
    },
    double = useRef(),
    clicked = () => {
      setTimeout(() => {
        if (double.current) {
          double.current = false;
        } else onClick(value.id);
      }, 0);
    },
    doubleClicked = () => {
      double.current = true;
      onDoubleClick(value.id);
    },
    onExpand = (ev) => {
      ev.stopPropagation();
      expand((e) => !e);
    };

  return (
    <>
      <div
        ref={el}
        className={classNames(['t_row'], {
          ['row-select']: status === 1,
          ['row-edit']: status === 2,
          expand: expanded,
        })}
        role="button"
        tabIndex="0"
        onKeyDown={_.noop}
        onClick={clicked}
        onDoubleClick={doubleClicked}
        onBlur={onBlur}>
        <span
          className={classNames(['t_cell'], {
            ['row-open']: open,
          })}
          style={itemStyle(ind, 1)}>
          {hidden.length > 0 && (
            <Button
              id={value.id}
              minimal
              fa={false}
              icon={expanded ? 'minus' : 'plus'}
              onClick={onExpand}
            />
          )}
        </span>
        {visible.map((c, j) => {
          const { id } = c;
          return (
            <span
              key={id}
              className="t_cell"
              role="button"
              tabIndex="0"
              style={itemStyle(ind, j + 2)}>
              {value?.[id]}
              {/* {renderers[id](value[id]) || '--UNKNOWN--'} */}
            </span>
          );
        })}
      </div>

      {expanded && (
        <div
          style={itemStyle(ind + 1, 1, visible.length)}
          className={classNames(['t_row-details'])}>
          <span className="t_cell">hello</span>
        </div>
      )}
    </>
  );
}

Header.propTypes = {
  columns: PropTypes.array,
  sortBy: PropTypes.string,
  dir: PropTypes.number,
  onSort: PropTypes.func,
};

export function Header({ columns, sortBy, dir, onSort }) {
  const sortit = (_, id) => {
    onSort(id);
  };
  return (
    <div className="t_header">
      <span className="t_cell" style={itemStyle(1, 1)}>
        <Icon name="folder-open" styled="l" fa />
      </span>
      {columns.map((c, i) => (
        <span
          key={c.id}
          className="t_cell"
          style={itemStyle(1, i + 2)}>
          {c.title}
          <Button
            id={c.id}
            minimal
            icon={
              sortBy === c.id
                ? dir > 0
                  ? 'sort-up'
                  : 'sort-down'
                : 'sort'
            }
            iconStyle="l"
            onClick={sortit}
          />
        </span>
      ))}
    </div>
  );
}
