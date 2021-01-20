import { useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers'; //, classNames, useMemo, useRef, useEffect
import { Button, ButtonGroup, MultiSelect, Pager } from '..';
import Row, { Header } from './row';
import Filters from './filters';
import './styles.css';

const gridStyle = (cols, add = 0, style) => {
    return {
      gridTemplateColumns: `${add ? '3rem ' : ''}${cols
        .map((c) => `minmax(${c.width || '3rem'},auto)`)
        .join(' ')}`,
      gridTemplateRows: 'auto',
      // gridTemplateRows: `repeat(${rows}, auto)`,repeat(${cols}, minmax(3rem,auto))
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

Table.propTypes = {
  dataid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  columns: PropTypes.array,
  title: PropTypes.string,
  pageSize: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  height: PropTypes.string,
  intent: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.object,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  def: PropTypes.array,
};
export default function Table({
  value = [],
  dataid,
  columns = [],
  title,
  pageSize,
  //   disabled,
  onChange,
  //   request,
  style,
  //   intent = 'none',
  def = [],
  //   lookups,
  //   ...rest
}) {
  const vals = value.entities || value,
    count = value.count || value.length,
    [visibleIds, setVisibleIds] = useState(columns.map((e) => e.id)),
    [selected, setSelected] = useState(),
    [editing, setEditing] = useState(false),
    [options, setOptions] = useState({ page: 1, size: pageSize }),
    meta = useMemo(() => _.toObject(def, 'name')),
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
    rowClick = (id) => {
      if (id !== selected) {
        setSelected(id);
        setEditing(false);
      } else if (!editing) {
        setSelected();
      }
    },
    rowDoubleClick = (id) => {
      setSelected(id);
      setEditing(true);
    },
    onBlur = () => {
      setTimeout(() => {
        if (!body.current.contains(document.activeElement)) {
          setEditing(false);
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
  console.log(meta);
  return (
    <div className="table">
      <div className="t_title">
        <span>
          <h6>
            {title}
            <MultiSelect
              value={visibleIds}
              options={columns}
              icon="ballot-check"
              iconOnly
              minimal
              style={{ marginLeft: '1rem' }}
              display="title"
              onChange={setVisibleIds}
            />
            <Filters />
          </h6>
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
            text="Delete"
            icon="multiply"
            fa={false}
            iconStyle="s"
            onClick={onAdd}
            disabled={!selected || editing}
          />
          <Button
            text="Add"
            icon="plus"
            iconStyle="s"
            fa={false}
            onClick={onAdd}
          />
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
          {vals.map((e, i) => {
            let status = selected === e.id ? 1 : 0;
            if (status && editing) ++status;
            return (
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
                status={status}
                editing={editing}
                //onCommand={onOptionsSelect}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

//   <table style={styled}>
//     <thead>
//       <tr>
//         {visibleColumns.map((e) => (
//           <th key={e.id} data-type="text-short">
//             {e.title}
//           </th>
//         ))}
//       </tr>
//     </thead>
//     <tbody style={{ height: '40rem', overflowY: 'auto' }}>
//       {vals.map((e) => (
//         <tr key={e.id}>
//           {visibleColumns.map((c) => (
//             <td key={c.id}>{e?.[c.id]}</td>
//           ))}
//         </tr>
//       ))}
//     </tbody>
//   </table>;
