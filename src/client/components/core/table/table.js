import { useState, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import { Icon, Button, Dropdown, MultiSelect } from '../../index';
import Pager from '../pager';
import classes from '../styles.css';

//Use toggle prop for toggle view, always set intent for toggle,
//otherwise both states hava same background color
const gridStyle = (cols = 1, add = 0, style) => ({
    gridTemplateColumns: `${
      add ? '4rem ' : ''
    }repeat(${cols}, minmax(3rem,auto))`,
    gridTemplateRows: 'auto',
    // gridTemplateRows: `repeat(${rows}, auto)`,
    ...style,
  }),
  itemStyle = (i, j, span = 0) => ({
    gridArea: `${i}/${j}/${i + 1}/${j + span + 1}`,
  }),
  ctrlCell = classNames([classes.tableCell]), //, classes.cellFixed
  options = [
    { icon: 'plus', id: 'add' },
    {
      icon: 'times',
      id: 'remove',
      confirm: 'Are you sure you want to delete this row?',
    },
  ],
  opts1 = [{ icon: 'compress-alt', id: 'toggle' }, ...options],
  opts2 = [{ icon: 'expand-alt', id: 'toggle' }, ...options],
  cmd = (onSelect, id, open) => (
    <Dropdown
      id={id}
      icon="ellipsis-v"
      minimal
      hover
      display="label"
      placeRight
      horizontal
      options={open ? opts1 : opts2}
      onClick={onSelect}
    />
  ),
  d_format = { year: 'numeric', month: 'long', day: 'numeric' },
  renderFactory = {
    Date: (locale) => (v) => v?.toLocaleDateString(locale, d_format),
    DateTime: (locale) => (v) => v?.toLocaleString(locale, d_format),
    ID: (_, lkps) => (v) => lkps.find((e) => e.id === v)?.name,
    Booleans: () => (v) => (
      <Icon name={v ? 'check-square' : 'square'} size="lg" />
    ),
  },
  def_renderer = (v) => v;

const Row = ({
  val,
  open,
  ind,
  columns,
  visibles = [],
  nonVisibles,
  renderers,
  onCommand,
}) => {
  return (
    <>
      <div className={classes.tableRow}>
        <span
          className={classNames([classes.tableCell], {
            [classes.rowOpen]: open,
          })}
          style={itemStyle(ind, 1)}>
          {cmd(onCommand, val.id, open)}
        </span>
        {visibles.map((c, j) => {
          const { id } = c;
          return (
            <span
              key={id}
              className={classes.tableCell}
              style={itemStyle(ind, j + 2)}>
              {renderers[id](val[id]) || '--UNKNOWN--'}
            </span>
          );
        })}
      </div>

      <div
        style={itemStyle(ind + 1, 1, visibles.length)}
        className={classNames([classes.tableRowDetails], {
          [classes.show]: open,
          [classes.hide]: !open,
        })}>
        {open && <span className={classes.tableCell}>hello</span>}
      </div>
    </>
  );
};
const parseValue = (v) => {
  if (Array.isArray(v)) return [v];
  const vals = Object.values(v);
  return [
    vals.find((e) => Array.isArray(e)),
    vals.find((e) => _.isNumber(e)),
  ];
};
const Table = ({
  value = [],
  pageSize,
  dataid,
  columns = [],
  title,
  meta,
  height,
  disabled,
  onChange,
  request,
  style,
  intent = 'none',
  theme = {},
  lookups,
  ...rest
}) => {
  const [open, setOpen] = useState(() => []),
    [items = [], count] = parseValue(value),
    [showColumns, setShowColumns] = useState(
      columns.map((e) => e.id)
    ),
    visibles = columns.filter((c) => showColumns.includes(c.id)),
    nonVisibles = columns.filter((c) => !showColumns.includes(c.id)),
    styled = gridStyle(visibles.length, 1, style),
    options = useRef({ size: pageSize }),
    onOptionsSelect = (op, id) => {
      if (op === 'toggle') setOpen((s) => _.toggle(s, id));
    },
    onColumns = (v) => {
      setShowColumns(v);
    },
    paged = (v) => {
      options.current.page = parseInt(v);
      request(options.current, dataid);
    },
    onAdd = () => {
      onChange({
        type: 'add',
        id: dataid,
      });
    };
  //  handleChange = () => {
  //     onChange(!value, dataid);
  //   };
  const renderers = useMemo(
    () =>
      meta?.fields
        ? columns.reduce((acc, c) => {
            const field = meta.fields.find((f) => f.name === c.id);
            //if (field?.type === 'ID')
            acc[c.id] =
              renderFactory[field?.type]?.(
                'en-CA',
                lookups[field?.ref]
              ) || def_renderer;
            return acc;
          }, {})
        : {},
    [meta.fields]
  );
  useEffect(() => {
    options.current.size = pageSize;
  }, [pageSize]);

  return (
    <div className={classes.table}>
      <div className={classes.tableTitleBar}>
        <h4>{title}</h4>
        {count && (
          <Pager
            value={options.current.page}
            max={count}
            pageSize={pageSize}
            style={{ margin: '0 3rem 0 auto' }}
            onChange={paged}
          />
        )}
        <Button text="Add" icon="plus" minimal onClick={onAdd} />
      </div>
      <div className={classes.tableBody} style={styled}>
        <div className={classes.tableHeader}>
          <span className={ctrlCell} style={itemStyle(1, 1)}>
            <MultiSelect
              value={showColumns}
              options={columns}
              showIcon="bars"
              display="title"
              onChange={onColumns}
            />
          </span>
          {visibles.map((c, j) => (
            <span
              key={c.id}
              style={itemStyle(1, j + 2)}
              className={classes.tableCell}>
              {c.title}
            </span>
          ))}
        </div>
        {items.map((e, i) => {
          return (
            <Row
              key={e.id}
              val={e}
              renderers={renderers}
              ind={2 + 2 * i}
              open={open.includes(e.id)}
              visibles={visibles}
              nonVisibles={nonVisibles}
              columns={columns}
              onCommand={onOptionsSelect}
            />
          );
        })}
      </div>
    </div>
  );
};

Table.propTypes = {
  dataid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  columns: PropTypes.array,
  text: PropTypes.string,
  toggle: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  intent: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.object,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

export default Table;
