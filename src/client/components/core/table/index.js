import { useState, useRef } from 'react';
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
  //   theme = {},
  //   lookups,
  //   ...rest
}) {
  const vals = value.entities || value,
    count = value.count || value.length,
    [visibleIds, setVisibleIds] = useState(columns.map((e) => e.id)),
    [selected, setSelected] = useState(),
    [editing, setEditing] = useState(false),
    [sorted, sort] = useState([]),
    options = useRef({ size: pageSize }),
    [visibleColumns, hiddenColumns] = _.partition(columns, (c) =>
      visibleIds.includes(c.id)
    ),
    styled = gridStyle(visibleColumns, 1, style),
    body = useRef(null),
    paged = (v) => {
      options.current.page = parseInt(v);
      //request(options.current, dataid);
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
      const [by, dir] = sorted;
      sort([id, by === id ? -dir : 1]);
    };

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

        {count && (
          <Pager
            value={options.current.page}
            max={count}
            pageSize={pageSize}
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
          sort={sorted}
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
