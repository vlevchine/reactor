import { useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { useToaster, useDialog } from '@app/services';
import { Button, renderer, editor } from '../core';
import { mergeIds } from '../core/helpers';
import Row, { Header, RowDetails, newId } from './row';
import './styles.css';

function comparator(id, dir) {
  return function (a, b) {
    if (a[id] < b[id]) return -dir;
    if (a[id] > b[id]) return dir;
    return 0;
  };
}
function applySort(values, sort) {
  if (!sort) return values;
  return values.sort(comparator(sort.id, sort.dir));
}

const colStyle = 'minmax(min-content, auto)',
  gridStyle = (cols, add = 0, style) => {
    const spec = [cols.map(() => colStyle)];
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
  value: PropTypes.array,
  height: PropTypes.string,
  intent: PropTypes.string,
  style: PropTypes.object,
  onSort: PropTypes.func,
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
};
export default function BasicTable({
  value,
  columns,
  dataid,
  visibleColumns, //cached ids of visible columns
  onChange,
  onSort,
  dynamicColumns,
  canAdd, //display Add button in last row
  editable, //dispaly delete/edit buttons on row hover
  meta,
  lookups,
  locale,
  uom,
  style,
}) {
  const toaster = useToaster(),
    dialog = useDialog(),
    [selected, setSelected] = useState(),
    [editing, setEdit] = useState(),
    [sort, setSort] = useState(),
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
        onChange(id, dataid, 'remove');
        toaster.info('Row deleted');
      }
    },
    onEditEnd = (val) => {
      if (val) {
        if (val.id === newId) {
          delete val.id;
          onChange(val, dataid, 'add');
          toaster.info('Row added');
        } else onChange(val, mergeIds(dataid, val.id), 'update');
      } else if (_.last(vals).id === newId) vals.pop();
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
    styled = gridStyle(visibleIds, 1, style);
  let vals = applySort(value || [], sort);

  return (
    <div className="t_body" style={styled}>
      <Header
        columns={columns}
        visibleIds={visibleIds}
        setVisible={setVisibles}
        sort={sort}
        onSort={sorting}
        dynamicColumns={dynamicColumns}
      />
      <div
        className="t-content"
        ref={body}
        role="button"
        tabIndex="0"
        onBlur={onBlur}>
        {vals.length > 0 ? (
          vals.map((e, i) => {
            return (
              <Row
                key={e.id}
                value={e}
                ind={2 * (i + 1)}
                visibleIds={visibleIds}
                hiddenCols={hiddenCols}
                onClick={setSelected}
                isSelected={selected === e.id}
                renderers={renderers}
                editing={editing}
                onEdit={setEdit}
                onEditEnd={onEditEnd}
                onDelete={onDelete}
                editable={editable}
              />
            );
          })
        ) : (
          <RowDetails
            row={1}
            span={visibleIds.length}
            className="t_single">
            <h6>No data available...</h6>
          </RowDetails>
        )}
        {canAdd && !editing && (
          <RowDetails span={visibleIds.length} className="t_single">
            <Button
              prepend="plus"
              text="Add"
              className="muted btn-invert"
              onClick={() => {
                vals.push({ id: newId });
                setEdit(newId);
              }}
            />
          </RowDetails>
        )}
      </div>
    </div>
  );
}
