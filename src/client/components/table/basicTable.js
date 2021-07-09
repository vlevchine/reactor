import { useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { _, classNames } from '@app/helpers';
import { useToaster, useDialog } from '@app/services';
import { Button, renderer, editor } from '../core';
import { mergeIds } from '../core/helpers';
import Row, { Header, RowDetails, newId } from './row';
import './styles.css';

// function comparator(id, dir) {
//   return function (a, b) {
//     if (a[id] < b[id]) return -dir;
//     if (a[id] > b[id]) return dir;
//     return 0;
//   };
// }
// function applySort(values, sort) {
//   if (!sort) return values;
//   return values.sort(comparator(sort.id, sort.dir));
// }

const colStyle = '1fr', //minmax(min-content, 1fr)
  boolColStyle = 'minmax(3rem, max-content)',
  gridStyle = (cols, add, style) => {
    const spec = cols.map((c) =>
      c.use === 'Checkbox' ? boolColStyle : colStyle
    );
    if (add) spec.unshift('3rem');
    return {
      gridTemplateColumns: spec.join(' '),
      ...style,
    };
  };

BasicTable.propTypes = {
  dataid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  visibleColumns: PropTypes.array,
  columns: PropTypes.array,
  title: PropTypes.string,
  idProp: PropTypes.string,
  value: PropTypes.array,
  height: PropTypes.string,
  intent: PropTypes.string,
  style: PropTypes.object,
  onSort: PropTypes.func,
  sorted: PropTypes.object,
  dynamicColumns: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  meta: PropTypes.object,
  locale: PropTypes.string,
  uom: PropTypes.string,
  lookups: PropTypes.object,
  params: PropTypes.object,
  editable: PropTypes.bool,
  canAdd: PropTypes.bool,
  noToasts: PropTypes.bool,
};
export default function BasicTable({
  value,
  columns,
  dataid,
  idProp = 'id',
  visibleColumns, //cached ids of visible columns
  onChange,
  sorted,
  onSort,
  disabled,
  dynamicColumns,
  canAdd, //display Add button in last row
  editable, //dispaly delete/edit buttons on row hover
  meta,
  lookups,
  locale,
  uom,
  style,
  noToasts,
}) {
  const toaster = useToaster(),
    dialog = useDialog(),
    [selected, setSelected] = useState(),
    [editing, setEdit] = useState(),
    [sort, setSort] = useState(sorted),
    body = useRef(null),
    renderers = useMemo(() =>
      columns.reduce(
        (acc, c) => {
          acc[0][c.id] = renderer(c, meta, lookups);
          acc[1][c.id] = editor(c, meta, lookups, locale, uom);
          return acc;
        },
        [{}, {}]
      )
    ),
    [visibleIds, setVisibles] = useState(
      () =>
        visibleColumns ||
        columns.filter((c) => c.on || !c.hidden).map((c) => c.id)
    ),
    hiddenCols = columns.filter((c) => !visibleIds?.includes(c.id)),
    onDelete = async (id) => {
      const res = await dialog({
        title: 'Please, confirm',
        text: 'Are you sure you want to delete selected row',
        okText: 'Confirm',
        cancelText: 'Cancel',
      });
      if (res) {
        onChange?.(id, dataid, 'remove');
        !noToasts && toaster.info('Row deleted');
      }
    },
    onEditEnd = (val) => {
      if (val) {
        if (val[idProp] === newId) {
          val[idProp] = nanoid();
          onChange?.(val, dataid, 'add');
          !noToasts && toaster.info('Row added');
        } else
          onChange?.(val, mergeIds(dataid, val[idProp]), 'update');
      } else if (_.last(vals)[idProp] === newId) vals.pop();
      setEdit();
    },
    onBlur = () => {
      //setTimeout(() => {
      //     if (!body.current.contains(document.activeElement)) {
      //       //dispatch({  id: '' });
      //     }
      // }, 200);
    },
    sorting = (s) => {
      setSort(s);
      onSort?.(s);
    },
    firstColInd =
      editable || dynamicColumns || hiddenCols.length > 0 ? 1 : 0,
    num_cols = visibleIds.length + firstColInd,
    styled = gridStyle(
      visibleIds.map((id) => columns.find((c) => c.id === id)),
      firstColInd,
      style
    ),
    vals = value || [];

  return (
    <div
      className={classNames(['t_body'], {
        edit: !!editing,
      })}
      style={styled}>
      <Header
        columns={columns}
        visibleIds={visibleIds}
        setVisible={setVisibles}
        sort={sort}
        onSort={onSort ? sorting : undefined}
        dynamicColumns={dynamicColumns}
        firstColumnInd={firstColInd}
      />
      <div
        className="t-content"
        ref={body}
        role="button"
        tabIndex="0"
        onBlur={onBlur}>
        {vals.map((e, i) => {
          return (
            <Row
              key={e[idProp]}
              value={e}
              ind={2 * (i + 1)}
              idProp={idProp}
              visibleIds={visibleIds}
              hiddenCols={hiddenCols}
              onClick={setSelected}
              isSelected={selected === e[idProp]}
              firstColumnInd={firstColInd}
              renderers={renderers}
              inEdit={!!editing}
              isEditing={editing === e[idProp]}
              onEdit={setEdit}
              onEditEnd={onEditEnd}
              onDelete={onDelete}
              editable={editable}
            />
          );
        })}
        {!vals.length && !canAdd && (
          <RowDetails row={1} span={num_cols} className="t_single">
            <h6>No data available...</h6>
          </RowDetails>
        )}
        {canAdd && !editing && (
          <RowDetails span={num_cols} className="t_single">
            <Button
              prepend="plus"
              text="Add"
              className="muted invert"
              onClick={() => {
                vals.push({ [idProp]: newId });
                setEdit(newId);
              }}
            />
          </RowDetails>
        )}
      </div>
      {disabled && <div className="t_cover" />}
    </div>
  );
}
