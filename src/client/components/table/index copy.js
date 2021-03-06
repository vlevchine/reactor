import {
  useState,
  useReducer,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { _ } from '@app/helpers'; //, classNames, useMemo, useRef, useEffect
import { useToaster, useDialog } from '@app/services';
import {
  IconSymbol,
  Button,
  ButtonGroup,
  MultiSelect,
  renderer,
  editor,
} from '../core';
import { mergeIds } from '../core/helpers';
import Row, { Header, RowDetails } from './row';
import Filters from '../filters';
import Pager from '../pager';
import './styles.css';

const colStyle = 'minmax(min-content, auto)',
  gridStyle = (cols, add = 0, style) => {
    const spec = [cols.map(() => colStyle)];
    if (add) spec.unshift('3rem');
    return {
      gridTemplateColumns: spec.join(' '),
      ...style,
    };
  },
  newId = '_new';
const processVisibles = (columns, ids) => {
  const [visibleColumns, hiddenColumns] = _.partition(columns, (c) =>
      ids.includes(c.id)
    ),
    visibleIds = visibleColumns.map((c) => c.id);
  return {
    visibleColumns,
    hiddenColumns,
    visibleIds,
  };
};
function init({ columns: cols, meta, lookups, locale, uom, edit }) {
  const columns = cols.map((c) => {
    const id = c.id;
    return {
      ...c,
      renderer: renderer(c, meta[id], lookups, edit),
      editor: editor(id, meta[id], lookups, locale, uom),
    };
  });
  if (columns.every((c) => !c.on)) columns[0].on = true;

  const hideables = columns.filter((c) => !c.on),
    v_cols = processVisibles(
      columns,
      columns.filter((c) => c.on || !c.hidden).map((c) => c.id)
    );

  return {
    select: '',
    edit: false,
    columns,
    hideables,
    ...v_cols,
  };
}
function reducer(state, pld) {
  let n_state = state;
  if (pld.visibleIds) {
    n_state = {
      ...state,
      ...processVisibles(state.columns, pld.visibleIds),
    };
  }

  if (!_.isNil(pld.edit))
    n_state = {
      ...state,
      select: !pld.edit && state.select === newId ? '' : state.select,
      edit: pld.edit,
    };
  if (!_.isNil(pld.select) && !state.edit)
    n_state = {
      ...n_state,
      select: state.select !== pld.select ? pld.select : '',
    };

  return n_state;
}
function fromValue(value, colKey) {
  return colKey
    ? [...value[colKey]]
    : _.isArray(value)
    ? [...value]
    : [];
}

Table.propTypes = {
  dataid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  columns: PropTypes.array,
  filters: PropTypes.array,
  title: PropTypes.string,
  pageSize: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  height: PropTypes.string,
  intent: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.object,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  meta: PropTypes.object,
  locale: PropTypes.string,
  uom: PropTypes.string,
  lookups: PropTypes.object,
  params: PropTypes.object,
  edit: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};
export default function Table({
  value,
  dataid,
  columns,
  filters,
  title,
  pageSize,
  onChange,
  params,
  edit,
  style,
  //   intent = 'none',
  meta = {},
  locale,
  uom,
  lookups,
}) {
  const colKey =
      _.isObject(value) &&
      Object.keys(value).find((k) => _.isArray(value[k])),
    [vals, setVals] = useState(() => fromValue(value, colKey)),
    count = value.length || value.count,
    editInline = _.isBoolean(edit) && edit,
    navigate = useNavigate(),
    toaster = useToaster(),
    dialog = useDialog(),
    [state, dispatch] = useReducer(
      reducer,
      {
        columns,
        meta,
        lookups,
        locale,
        uom,
        edit: _.isString(edit) && edit,
      },
      init
    ),
    [options, setOptions] = useState(
      _.isEmpty(params)
        ? { page: 1, size: pageSize }
        : { ...params.options, filter: params.filter }
    ),
    body = useRef(null),
    onColumnsChanged = useCallback((visibleIds) =>
      dispatch({ visibleIds })
    ),
    onAdd = () => {
      if (editInline) {
        vals.unshift({ id: newId });
        dispatch({ select: newId, edit: true });
      } else navigate(`${edit}/${newId}`);
    },
    onDelete = async (ev) => {
      ev.stopPropagation();
      const res = await dialog({
        title: 'Please, confirm',
        text: 'Are you sure you want to delete selected row',
        okText: 'Confirm',
        cancelText: 'Cancel',
      });
      if (res) {
        onChange(state.select, mergeIds(dataid, colKey), 'remove');
        dispatch({ select: '' });
        toaster.info('Row deleted');
      }
    },
    onEdit = (ev) => {
      ev.stopPropagation();
      dispatch({ edit: true });
    },
    onInlineEdit = (rowId, v, id) => {
      onChange(
        { [id]: v },
        mergeIds(dataid, colKey, rowId),
        'update'
      );
    },
    onEditEnd = (res) => {
      if (res) {
        if (state.select === newId) {
          onChange(res, mergeIds(dataid, colKey), 'add');
          toaster.info('Row updated');
        } else
          onChange(res, mergeIds(dataid, colKey, res.id), 'update');
        toaster.info('Row added');
      } else if (state.select === newId) {
        vals.shift();
      }
      dispatch({ edit: false });
    },
    rowClick = (id) => {
      dispatch({ select: id });
    },
    onBlur = () => {
      //setTimeout(() => {
      // console.log('blur', Date.now());
      //     if (!body.current.contains(document.activeElement)) {
      //       //dispatch({  id: '' });
      //     }
      // }, 200);
    },
    update = (data) => {
      const { filter, ...options } = data;
      onChange({ options, filter }, dataid, 'options');
      setOptions(data);
    },
    paged = (v) => {
      update({ ...options, page: parseInt(v) });
    },
    onSort = (sort) => {
      update({ ...options, ...sort, page: 1 });
    },
    onFilters = (filter) => {
      update({ ...options, filter, page: 1 });
    },
    styled = gridStyle(state.visibleColumns, 1, style);

  useEffect(() => {
    setVals(fromValue(value, colKey));
  }, [value]);

  return state.loading ? (
    <h3>Loading data...</h3>
  ) : (
    <div className="table">
      <div className="t_title">
        <span>
          <h6>{title}</h6>&nbsp;&nbsp;
          <MultiSelect
            dataid="_columns"
            value={state.visibleIds}
            options={state.hideables}
            prepend="ballot-check"
            iconOnly
            display="title"
            onChange={onColumnsChanged}
          />
        </span>
        {options.size && (
          <Pager {...options} max={count} onChange={paged} />
        )}
        {edit && (
          <ButtonGroup minimal>
            <Button
              onClick={onEdit}
              disabled={!state.select || !!state.edit}>
              <IconSymbol name="edit" />
              <span>Edit</span>
            </Button>
            <Button
              onClick={onDelete}
              disabled={!state.select || !!state.edit}>
              <IconSymbol name="times" />
              <span>Delete</span>
            </Button>
            <Button disabled={!!state.edit} onClick={onAdd}>
              <IconSymbol name="plus" />
              <span>Add</span>
            </Button>
          </ButtonGroup>
        )}
      </div>
      {filters && (
        <Filters
          items={filters}
          columns={columns}
          def={meta}
          model={options.filter}
          lookups={lookups}
          nav={{ uom, locale }}
          onChange={onFilters}
        />
      )}
      <div className="t_body" style={styled}>
        <Header
          columns={state.visibleColumns}
          {...options}
          onSort={onSort}
        />
        <div
          className="t-content"
          ref={body}
          role="button"
          tabIndex="0"
          onBlur={onBlur}>
          {vals.length > 0 ? (
            vals.map((e, i) => {
              const isSelected = state.select === e.id;
              return (
                <Row
                  key={e.id}
                  value={e}
                  ind={2 * (i + 1)}
                  //open={open.includes(e.id)}
                  visible={state.visibleColumns}
                  hidden={state.hiddenColumns}
                  onClick={rowClick}
                  isSelected={isSelected}
                  isEditing={isSelected && state.edit}
                  onEdit={onEdit}
                  onEditEnd={onEditEnd}
                  onDelete={onDelete}
                  onInlineEdit={onInlineEdit}
                  editable={editInline}
                  //onCommand={onOptionsSelect}
                />
              );
            })
          ) : (
            <RowDetails
              columns={[{ id: '_info', renderer: D_Rendeder }]}
              row={1}
              span={state.visibleColumns.length}
              value={{ _info: 'No data available...' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

D_Rendeder.propTypes = {
  value: PropTypes.string,
};
function D_Rendeder({ value }) {
  return <h5>{value}</h5>;
}
