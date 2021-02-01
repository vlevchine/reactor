import { useState, useReducer, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers'; //, classNames, useMemo, useRef, useEffect
import {
  IconSymbol,
  Button,
  ButtonGroup,
  MultiSelect,
  Pager,
  renderer,
} from '../core';
import { mergeIds } from '../core/helpers';
import Row, { Header } from './row';
import Filters from '../filters';
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
  getOptions = ({ page = 1, size, sortBy, dir }) => {
    const options = {
      skip: (page - 1) * size,
      limit: size,
    };
    if (sortBy) options.sort = `${dir > 0 ? '' : '-'}${sortBy}`;
    return { options };
  };
function reducer(state, { type, id }) {
  const { select, edit } = state,
    idleRow = select !== id;
  switch (type) {
    case 'click':
      return idleRow
        ? { edit: false, select: id }
        : edit
        ? state
        : { edit, select: '' };
    case 'doubleClick':
      return { select, edit: true };
    default:
      throw new Error();
  }
}
function rowState({ select, edit }, id) {
  let ind = id === select ? 1 : 0;
  if (ind && edit) ++ind;
  return ind;
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
  def: PropTypes.object,
  locale: PropTypes.string,
  uom: PropTypes.string,
  lookups: PropTypes.object,
  notifier: PropTypes.object,
};
export default function Table({
  value = [],
  dataid,
  columns = [],
  filters = [],
  title,
  pageSize,
  onChange,
  //   request,
  style,
  //   intent = 'none',
  def = {},
  //   lookups,
  locale,
  uom,
  lookups,
  notifier, //, store
}) {
  const colKey =
      _.isObject(value) &&
      Object.keys(value).find((k) => _.isArray(value[k])),
    vals = value[colKey] || value,
    count = value.length || value.count,
    [visibleIds, setVisibleIds] = useState(
      columns.filter((c) => !c.hidden).map((e) => e.id)
    ),
    [state, dispatch] = useReducer(reducer, { select: '', edit: '' }),
    [options, setOptions] = useState({ page: 1, size: pageSize }),
    [visibleColumns, hiddenColumns] = _.partition(columns, (c) =>
      visibleIds.includes(c.id)
    ),
    styled = gridStyle(visibleColumns, 1, style),
    body = useRef(null),
    paged = (v) => {
      const n_options = { ...options, page: parseInt(v) };
      onChange(getOptions(n_options), dataid, 'options');
      setOptions(n_options);
    },
    onAdd = () => {
      onChange({
        type: 'add',
        id: dataid,
      });
    },
    onDelete = async () => {
      const res = await notifier.dialog({
        title: 'Please, confirm',
        text: 'Are you sure you want to delete selected row',
        okText: 'Confirm',
      });
      if (res) {
        onChange(state.select, mergeIds(dataid, colKey), 'remove');
        dispatch({ type: 'click', id: '' });
      }
    },
    rowClick = (id) => {
      dispatch({ type: 'click', id });
    },
    rowDoubleClick = (id) => {
      dispatch({ type: 'doubleClick', id });
    },
    onBlur = () => {
      setTimeout(() => {
        if (!body.current.contains(document.activeElement)) {
          // setEditing(false);
        }
      }, 0);
    },
    onSort = (id) => {
      const { sortBy, dir } = options,
        n_dir = sortBy === id ? -dir : 1,
        n_options = { ...options, page: 1, sortBy: id, dir: n_dir };
      setOptions(n_options);
      onChange(getOptions(n_options), dataid, 'options');
    };

  const renderers = useMemo(
    () =>
      _.toObject('id', (c) =>
        renderer(def[c.id], locale, uom, lookups, c)
      )(columns),
    []
  );
  console.log(vals.map((v) => v.depth));
  return (
    <div className="table">
      <div className="t_title">
        <span style={{}}>
          <h6>{title}</h6>&nbsp;&nbsp;
          <MultiSelect
            value={visibleIds}
            options={columns}
            icon="ballot-check"
            iconOnly
            style={{ margin: '0 0.5rem' }}
            display="title"
            onChange={setVisibleIds}
          />
          <Filters
            items={filters}
            columns={columns}
            def={def}
            lookups={lookups}
            nav={{ uom, locale }}
          />
        </span>

        {count > pageSize && (
          <Pager
            value={options.page}
            max={count}
            pageSize={options.size}
            style={{ margin: '0 3rem 0 auto' }}
            onChange={paged}
          />
        )}
        <ButtonGroup minimal>
          <Button
            onClick={onDelete}
            disabled={!state.select || !!state.edit}>
            <IconSymbol name="times" size="lg" />
            <span>Delete</span>
          </Button>
          <Button disabled={!!state.edit} onClick={onAdd}>
            <IconSymbol name="plus" size="lg" />
            <span>Add</span>
          </Button>
        </ButtonGroup>
      </div>
      <div className="t_body" style={styled}>
        <Header
          columns={visibleColumns}
          {...options}
          onSort={onSort}
        />

        <div
          className="t-content"
          ref={body}
          role="button"
          tabIndex="0"
          onBlur={onBlur}>
          {vals.map((e, i) => (
            <Row
              key={e.id}
              value={e}
              // renderers={renderers}
              ind={2 * (i + 1)}
              //open={open.includes(e.id)}
              visible={visibleColumns}
              hidden={hiddenColumns}
              columns={columns}
              onClick={rowClick}
              onDoubleClick={rowDoubleClick}
              status={rowState(state, e.id)}
              renderers={renderers}
              //onCommand={onOptionsSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
