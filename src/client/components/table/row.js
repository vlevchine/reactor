import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import { Button, Icon, IconSymbol } from '../core';
//import { useCollapse } from '../core/helpers';
import './styles.css';

const itemStyle = (i, j, span = 0) => ({
  gridColumn: `${j}/${j + span + 1}`,
});

Row.propTypes = {
  value: PropTypes.object,
  edit: PropTypes.object,
  open: PropTypes.bool,
  ind: PropTypes.number,
  columns: PropTypes.array,
  visible: PropTypes.array,
  hidden: PropTypes.array,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onEditEnd: PropTypes.func,
  onInlineEdit: PropTypes.func,
  isSelected: PropTypes.bool,
  isEditing: PropTypes.bool,
  editable: PropTypes.any,
};

export default function Row({
  value,
  open,
  ind,
  visible,
  hidden,
  onClick,
  onEdit,
  onEditEnd,
  onDelete,
  onInlineEdit,
  isSelected,
  isEditing,
  editable,
}) {
  const el = useRef(null),
    [val, setVal] = useState(),
    onBlur = () => {
      //   setTimeout(() => {
      //     if (!el.current.contains(document.activeElement)) {
      //       onEditEnd();
      //
      //     }
      //   }, 0);
    },
    editEnd = (ev) => {
      ev.stopPropagation();
      if (ev.currentTarget.name === 'ok') {
        onEditEnd(val);
      } else {
        onEditEnd();
        setVal();
      }
    },
    clicked = () => {
      onClick(value.id);
    },
    onDetailsBtn = (ev) => {
      ev.stopPropagation();
    },
    inlineChanged = (...args) => {
      onInlineEdit(value.id, ...args);
    },
    changed = (v, id) => {
      setVal({ ...val, [id]: v });
    };

  useEffect(() => {
    setVal(isEditing ? { ...value } : undefined);
  }, [isEditing]);

  return (
    <>
      <div
        ref={el}
        className={classNames(['t_row'], {
          ['row-select']: isSelected,
          ['row-edit']: isEditing,
          // expand: expanded || isEditing,
        })}
        role="button"
        tabIndex="0"
        onKeyDown={_.noop}
        onClick={clicked}
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
              onClick={onDetailsBtn}
              disabled={isEditing}>
              <IconSymbol name="bar-v" rotate={90} />
            </Button>
          )}
          {isSelected && editable && (
            <span className="t_toolbar">
              {isEditing && (
                <Button onClick={editEnd} tooltip="Cancel edit">
                  <IconSymbol name="times-s" size="lg" />
                </Button>
              )}
              {isEditing && (
                <Button
                  name="ok"
                  onClick={editEnd}
                  tooltip="Accept edit">
                  <IconSymbol name="checkmark" size="lg" />
                </Button>
              )}
              {!isEditing && (
                <Button onClick={onEdit} tooltip="Edit row">
                  <IconSymbol name="edit" size="lg" />
                </Button>
              )}
              {!isEditing && (
                <Button onClick={onDelete} tooltip="Delete row">
                  <IconSymbol name="times" size="lg" />
                </Button>
              )}
            </span>
          )}
        </span>
        {visible.map(({ id, renderer: Render, editor: Edit }, j) => (
          <span
            key={id}
            className="t_cell"
            role="button"
            tabIndex="0"
            style={itemStyle(ind, j + 2)}>
            {isEditing ? (
              <Edit value={(val || value)[id]} onChange={changed} />
            ) : (
              <Render
                value={value[id]}
                _id={value.id}
                id={id}
                onChange={inlineChanged}
              />
            )}
          </span>
        ))}
      </div>

      <RowDetails
        columns={hidden}
        row={ind + 1}
        span={visible.length}
        value={val || value}
        isEditing={isEditing}
        onChange={changed}
      />
    </>
  );
}

RowDetails.propTypes = {
  columns: PropTypes.array,
  value: PropTypes.object,
  row: PropTypes.number,
  span: PropTypes.number,
  isEditing: PropTypes.bool,
  className: PropTypes.any,
  onChange: PropTypes.func,
  onAnimationEnd: PropTypes.func,
};
export function RowDetails({
  columns,
  row,
  span,
  value,
  isEditing,
  onChange,
  className,
  onAnimationEnd,
}) {
  return (
    <div
      style={itemStyle(row, 1, span)}
      className={classNames(['t_row-details'])}
      onAnimationEnd={onAnimationEnd}>
      <span className={classNames(['t_cell', className])}>
        {columns.map(
          ({ id, title, renderer: Render, editor: Edit }) => (
            <span key={id} className="t_item">
              {title && <label>{`${title}:`}</label>}
              {isEditing ? (
                <Edit value={value[id]} onChange={onChange} />
              ) : (
                <Render value={value[id]} />
              )}
            </span>
          )
        )}
      </span>
    </div>
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
    let sort = { sortBy: id, dir: sortBy === id ? -dir : 1 };
    onSort(sort);
  };
  return (
    <div className="t_header">
      <span className="t_cell" style={itemStyle(1, 1)}>
        <Icon name="folder-open" styled="l" />
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
            rotate={dir > 0 ? 180 : undefined}
            prepend={sortBy !== c.id ? 'sort' : 'sort-up'}
            iconStyle="l"
            onClick={sortit}
          />
        </span>
      ))}
    </div>
  );
}

Header.getInfo = ({ sortBy, dir }) =>
  sortBy ? { sort: `${dir > 0 ? '' : '-'}${sortBy}` } : undefined;
