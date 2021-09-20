import { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import {
  Button,
  ButtonGroup,
  MultiSelect,
  IconSymbol,
  Icon,
} from '../core';
import './styles.css';

export const newId = '_new';
const itemStyle = (i, j, span = 1) => ({
  gridColumn: `${j}/${j + span}`,
});

Row.propTypes = {
  value: PropTypes.object,
  edit: PropTypes.object,
  open: PropTypes.bool,
  ind: PropTypes.number,
  idProp: PropTypes.string,
  columns: PropTypes.array,
  visibleIds: PropTypes.array,
  hiddenCols: PropTypes.array,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onEditEnd: PropTypes.func,
  renderers: PropTypes.array,
  editors: PropTypes.object,
  isSelected: PropTypes.bool,
  firstColumnInd: PropTypes.number,
  isEditing: PropTypes.bool,
  inEdit: PropTypes.bool,
  editable: PropTypes.any,
};

export default function Row(props) {
  const {
    value,
    ind,
    idProp,
    visibleIds,
    hiddenCols,
    firstColumnInd,
    onClick,
    onEdit,
    onEditEnd,
    onDelete,
    isSelected,
    inEdit,
    isEditing, // row id currently edited, undefined - nothing edited
    editable,
    renderers, //[{renderers by id}, {editors by id}]
  } = props;
  const el = useRef(null),
    [val, setVal] = useState(value),
    [open, setOpen] = useState(false),
    renderer = renderers[isEditing ? 1 : 0],
    editEnd = (ev) => {
      ev.stopPropagation();
      if (ev.currentTarget.name === 'ok') {
        onEditEnd(val);
      } else {
        onEditEnd();
        setVal(value);
      }
    },
    clicked = () => {
      !isEditing && onClick(isSelected ? undefined : value[idProp]);
    },
    deleting = (ev) => {
      ev.stopPropagation();
      onDelete(value[idProp]);
    },
    onDetailsBtn = (ev) => {
      ev.stopPropagation();
      setOpen((e) => !e);
    },
    onEditing = (ev) => {
      ev.stopPropagation();
      hiddenCols.length && setOpen(true);
      onEdit(value[idProp]);
    },
    changed = (v, id) => {
      setVal({ ...val, [id]: v });
    };

  useEffect(() => {
    if (val !== value) {
      setVal(value);
    }
  }, [value]);

  return (
    <>
      <div
        role="row"
        ref={el}
        className={classNames(['t_row'], {
          ['row-select']: isSelected,
          ['row-edit']: isEditing,
        })}
        tabIndex="0"
        onKeyDown={_.noop}
        onClick={clicked}>
        {firstColumnInd > 0 && (
          <span
            className={classNames(['t_cell'], {
              ['row-open']: open,
            })}
            style={itemStyle(ind, 1)}>
            {hiddenCols.length > 0 && !isEditing && (
              <Button
                id={value[idProp]}
                minimal
                onClick={onDetailsBtn}
                disabled={isEditing}>
                {open ? (
                  <IconSymbol
                    name="bar-v"
                    rotate={90}
                    className="expander"
                  />
                ) : (
                  <IconSymbol name="plus" className="expander" />
                )}
              </Button>
            )}
            {isEditing && (
              <ButtonGroup minimal>
                <Button
                  onClick={editEnd}
                  tooltipPos="bottom"
                  tooltip="Cancel edit">
                  <IconSymbol name="times-s" />
                </Button>
                <Button
                  name="ok"
                  onClick={editEnd}
                  tooltipPos="bottom"
                  tooltip="Accept edit">
                  <IconSymbol name="checkmark" />
                </Button>
              </ButtonGroup>
            )}
          </span>
        )}
        {visibleIds.map((id, j) => {
          const Renderer = renderer[id],
            last = visibleIds.length - j === 1;
          return (
            <span
              key={id}
              className="t_cell"
              role="button"
              tabIndex="0"
              style={itemStyle(ind, j + firstColumnInd + 1)}>
              <Renderer
                value={val[id]}
                onChange={changed}
                id={val[idProp]}
              />
              {last && editable && !inEdit && (
                <ButtonGroup className="t_toolbar minimal">
                  <Button
                    minimal
                    onClick={onEditing}
                    tooltip="Edit row"
                    tooltipPos="bottom">
                    <IconSymbol name="edit" />
                  </Button>
                  <Button
                    minimal
                    onClick={deleting}
                    tooltipPos="bottom"
                    tooltip="Delete row">
                    <IconSymbol name="times" />
                  </Button>
                </ButtonGroup>
              )}
            </span>
          );
        })}
      </div>

      {open && hiddenCols.length && (
        <RowDetails
          row={ind + 1}
          span={visibleIds.length + firstColumnInd}
          value={val}
          className={isEditing ? 'row-edit' : undefined}
          onChange={changed}>
          {hiddenCols.map(({ id, title }) => {
            const Renderer = renderer[id];
            return (
              <span key={id} className="t_item">
                {title && <label>{title}:</label>}
                <Renderer
                  value={val[id]}
                  onChange={changed}
                  id={val.id}
                />
              </span>
            );
          })}
        </RowDetails>
      )}
    </>
  );
}

RowDetails.propTypes = {
  value: PropTypes.object,
  row: PropTypes.number,
  span: PropTypes.number,
  isEditing: PropTypes.bool,
  className: PropTypes.any,
  onChange: PropTypes.func,
  onAnimationEnd: PropTypes.func,
  children: PropTypes.any,
};
export function RowDetails({
  row,
  span,
  className,
  onAnimationEnd,
  children,
}) {
  return (
    <div
      role="row"
      style={itemStyle(row, 1, span)}
      className={classNames(['t_row-details', className])}
      onAnimationEnd={onAnimationEnd}>
      <span className="t_cell">{children}</span>
    </div>
  );
}

Header.propTypes = {
  columns: PropTypes.array,
  visibleIds: PropTypes.array,
  setVisible: PropTypes.func,
  sort: PropTypes.object,
  onSort: PropTypes.func,
  dynamicColumns: PropTypes.bool,
  firstColumnInd: PropTypes.number,
};

export function Header({
  columns,
  visibleIds,
  setVisible,
  sort,
  onSort,
  dynamicColumns,
  firstColumnInd,
}) {
  const sorted = sort || {},
    sortit = (_, id) => {
      let same = id === sorted.id,
        n_sort = { id, dir: same ? -sorted.dir : 1 };
      onSort(n_sort);
    },
    cols = columns.filter((c) => visibleIds?.includes(c.id)),
    hideables = useMemo(() => {
      const res = columns.filter((c) => !c.on);
      return res.length > 0 ? res : _.tail(columns);
    });

  return (
    <div className="t_header" role="row">
      {firstColumnInd > 0 && (
        <span className="t_cell" style={itemStyle(1, 1)}>
          {dynamicColumns ? (
            <MultiSelect
              dataid="_columns"
              value={visibleIds}
              options={hideables}
              className="hint-right"
              prepend="ballot-check"
              tooltip="Show columns"
              iconOnly
              minimal
              display="title"
              onChange={setVisible}
            />
          ) : (
            <Icon name="folder-open" className="primary" styled="l" />
          )}
        </span>
      )}
      {cols.map((c, i) => (
        <span
          key={c.id}
          className="t_cell"
          style={itemStyle(1, i + firstColumnInd + 1)}>
          {c.title}
          {onSort && (
            <Button
              id={c.id}
              minimal
              rotate={sorted.dir > 0 ? 180 : undefined}
              prepend={sorted.id !== c.id ? 'sort' : 'sort-up'}
              iconStyle="l"
              onClick={sortit}
            />
          )}
        </span>
      ))}
    </div>
  );
}

Header.getInfo = ({ sortBy, dir }) =>
  sortBy ? { sort: `${dir > 0 ? '' : '-'}${sortBy}` } : undefined;
