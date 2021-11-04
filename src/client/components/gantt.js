import {
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
  Fragment,
} from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers'; //, useState, classNames
import { addDays, formatDate } from '@app/utils/calendar';
import { getMousePosition } from './svg/helpers';
import Tooltip from './svg/tooltip';

const header = 60,
  yPad = 10,
  yDays = header - 10,
  day_upper = yDays / 2 - yPad / 2,
  // xDay = 30,   // xWeek = 60,
  dStep = 28,
  wStep = 8,
  yStep = 28,
  contentsStart = header + yStep / 2,
  rd = 3,
  sep = 5,
  w_drag = 5,
  h_small = 8,
  h_big = 12,
  bend_tr = 'a 5 5 0 0 1 5 5';

function tooltipContent(it, start, locale) {
  const d_start = start
      ? formatDate(addDays(start, it.start - 1), locale)
      : it.start,
    d_end = start
      ? formatDate(addDays(start, it.end - 1), locale)
      : it.end,
    content = [
      it.name,
      `Start: ${d_start}`,
      `End: ${d_end}`,
      `Work days: ${it.length || ''}`,
    ];
  if (start && it.length)
    content.push(`Calendar days: ${it.end - it.start + 1}`);
  return content;
}

function visibleItems(items, collapsed) {
  const visible = [...items];
  collapsed.forEach((e) => {
    const first = items[e],
      last = items.findIndex(
        (x, i) => i > e && x.level <= first.level
      ),
      ind = last > -1 ? last - 1 : items.length - 1;
    let i = e;
    while (++i <= ind) {
      visible[i] = null;
    }
  });
  return visible;
}
function skipUndefined(items, fn) {
  let ind = 0;
  return items.map((e, i) => (e ? fn(e, ind++, i) : null));
}
function renderRow(top, step, width, left = 0, id) {
  const btm = top + step;
  return (
    <g key={id} className="grid-row">
      <rect x={left} y={top} width={width} height={step}></rect>
      <line
        x1={left}
        x2={width}
        y1={btm}
        y2={btm}
        className="line"></line>
    </g>
  );
}
function renderEdge(x, y, right) {
  return (
    <path
      className="edge"
      d={`M ${x} ${y} v 12 l ${right ? 5 : -5} -12`}
    />
  );
}
function renderGroupBar(id, x, width, y) {
  return width ? (
    <g key={id}>
      <rect
        id={id}
        x={x}
        y={y}
        width={width}
        height={h_small}
        rx={0}
        ry={0}
        className="bar-dark"></rect>
      {renderEdge(x, y)}
      {renderEdge(x + width, y, true)}
    </g>
  ) : null;
}
function renderDashLine(id, start, end, y) {
  return (
    <line
      key={id}
      id={id}
      className="spanning-line"
      x1={start}
      x2={end}
      y1={y}
      y2={y}
    />
  );
}
Legend.propTypes = {
  items: PropTypes.array,
  onClick: PropTypes.func,
  collapsed: PropTypes.array,
};
function Legend({ items, collapsed, onClick }) {
  const clicked = ({ target }) => {
      const tgt =
        target.localName === 'tspan' ? target.parentElement : target;
      onClick(tgt.id);
    },
    render = (e, ind, i) => (
      <text
        key={e.ord}
        x={10 * e.level - (e.group ? 6 : 0)}
        id={e.ord}
        y={contentsStart + ind * yStep}
        onClick={clicked}
        //style={{ pointerEvents: 'bounding-box' }}
        className="bar-label">
        <tspan>{`${
          e.group ? (collapsed.includes(i) ? '\u271B' : '\u2012') : ''
        }`}</tspan>
        <tspan>{`${e.ord}. ${e.name}`}</tspan>
      </text>
    );

  return <g id="tasks">{skipUndefined(items, render)}</g>;
}

const dfltTimeline = (length, weekly) => [
  { name: weekly ? 'Week' : 'Day', start: 1, end: length },
];
Header.propTypes = {
  timeline: PropTypes.array,
  bottom: PropTypes.number,
  width: PropTypes.number,
  length: PropTypes.number,
  step: PropTypes.number,
  pad: PropTypes.number,
  weekly: PropTypes.bool,
  height: PropTypes.number,
};
function Header({
  timeline,
  length,
  bottom,
  step,
  pad,
  weekly,
  // height,
  // width,
}) {
  //, height, width
  let span = pad + step / 2,
    _l = Math.ceil(length / 7),
    brd = span - step / 2;
  return (
    <g id="header">
      <text
        x={10}
        y={day_upper}
        className="bar-label title">{`Total: ${length} days`}</text>
      <g id="dates">
        {length && (
          <line
            x1={brd}
            x2={brd}
            y1={0}
            y2={bottom}
            className="line-thickest"
          />
        )}
        {timeline.map(({ name, start, end }, i) => {
          const l = end - start + 1,
            span_end = span + step * l;
          return (
            <Fragment key={i}>
              {l > (weekly ? 8 : 2) && (
                <text
                  x={span}
                  y={day_upper}
                  className="bar-label title">
                  {name}
                </text>
              )}
              {l > 12 && !weekly && (
                <text
                  x={span_end - 100}
                  y={day_upper}
                  className="bar-label title">
                  {name}
                </text>
              )}
              {!weekly &&
                _.times(l, (j) => (
                  <text
                    key={j}
                    x={span + j * step}
                    y={yDays}
                    className="lower-text">
                    {start + j}
                  </text>
                ))}
              <line
                key={i}
                x1={span_end - step / 2}
                x2={span_end - step / 2}
                y1={0}
                y2={yStep}
                className="line-thicker"
              />
              {(span = span_end)}
            </Fragment>
          );
        })}
        {weekly &&
          _.times(_l, (j) => (
            <text
              key={j}
              x={pad + (3 + 7 * j) * step}
              y={yDays}
              className="lower-text">
              {'w' + (j + 1)}
            </text>
          ))}
      </g>
    </g>
  );
}

Columns.propTypes = {
  xPad: PropTypes.number,
  bottom: PropTypes.number,
  top: PropTypes.number,
  timeline: PropTypes.array,
  length: PropTypes.number,
  daysOff: PropTypes.array,
  wDaysOff: PropTypes.array,
  step: PropTypes.number,
  weekly: PropTypes.bool,
};
function Columns({
  xPad,
  length,
  daysOff,
  wDaysOff,
  top,
  bottom,
  step,
  weekly,
}) {
  const count = weekly ? Math.ceil(length / 7) : length,
    //  btm = bottom - yStep / 2,
    height = bottom - top;

  return (
    <g id="v-lines">
      {!weekly &&
        daysOff?.map((d) => (
          <rect
            key={d}
            className="day-highlight"
            x={xPad + (d - 1) * step}
            y={day_upper + yPad}
            width={step}
            height={height}
          />
        ))}
      {!weekly &&
        wDaysOff?.map((d) => (
          <rect
            key={d}
            className="day-highlight-more"
            x={xPad + (d - 1) * step}
            y={day_upper + yPad}
            width={step}
            height={height}
          />
        ))}
      {length &&
        _.times(count, (i) => {
          const x = xPad + (i + 1) * step;
          return (
            <line
              key={i}
              x1={x}
              x2={x}
              y1={top}
              y2={bottom}
              className="line"
            />
          );
        })}
    </g>
  );
}
Arrow.propTypes = {
  start: PropTypes.object,
  move: PropTypes.object,
  step: PropTypes.number,
};
function Arrow({ start, move }) {
  return (
    <path
      markerEnd="url(#arrowhead)"
      d={`M ${start.x} ${start.y} h ${move.x} ${bend_tr} v ${move.y}`}></path>
  );
}

GanttChart.propTypes = {
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  items: PropTypes.array,
  daysOff: PropTypes.array,
  wDaysOff: PropTypes.array,
  timeline: PropTypes.array,
  start: PropTypes.instanceOf(Date),
  locale: PropTypes.string,
  pad: PropTypes.array,
  mode: PropTypes.string,
  style: PropTypes.object,
}; //props

export default function GanttChart({
  start,
  items,
  pad,
  timeline: _timeline,
  daysOff,
  wDaysOff,
  disabled,
  onChange,
  locale,
  mode,
  style,
}) {
  const length = useMemo(
      () => Math.max(0, ...items.map((e) => e.end)),
      [items]
    ),
    xPad = useMemo(
      () =>
        (Math.max(0, ...items.map((e) => e.name.length)) + 7) * 7 +
        sep,
      [items]
    ),
    [pad_s, pad_e] = pad || [0, 0],
    weekly = mode === 'w',
    xStep = weekly ? wStep : dStep,
    xPadded = xPad + pad_s * xStep,
    selected = useRef(),
    container = useRef({ width: 0 }),
    timeline = _timeline || dfltTimeline(length, weekly),
    startDrag = (ev) => {
      const handle = ev.target,
        svg = ev.currentTarget;
      ev.preventDefault();
      if (handle?.classList.contains('handle')) {
        const bar = handle?.previousSibling,
          item = bar && items.find((e) => e.ord === bar.id),
          start = getMousePosition(ev, svg);
        //offset.x -= parseFloat(handle.getAttributeNS(null, 'x'));
        //    offset.y -= parseFloat(tgt.getAttributeNS(null, 'y'));
        selected.current = {
          handle,
          x0: handle.x.baseVal.value,
          bar,
          item,
          start,
          length: item.length,
        };
        handle.classList.add('h-drag');
        bar.classList.add('h-drag');
      }
    },
    drag = (ev) => {
      const svg = ev.currentTarget;
      ev.preventDefault();
      const { x } = getMousePosition(ev, svg),
        { item, handle, x0, bar, start } = selected.current,
        shift = x - start.x,
        exp_width = item.length * xStep + shift;

      if (handle.id === 'r') {
        //change interval end only with right handle - ignore left handle
        //const exp_handle =xPad + item.end * xStep + shift;
        if (x > xPadded + item.start * xStep)
          handle.setAttributeNS(null, 'x', x0 + shift);

        const ratio = exp_width / xStep,
          units = Math.floor(ratio);
        let n_length = selected.current.length;
        if (
          exp_width > selected.current.length &&
          ratio - units > 0.6
        ) {
          n_length = units + 1;
        } else if (
          ratio < selected.current.length &&
          ratio - units < 0.4 &&
          selected.current.length > 1
        )
          n_length = units;
        if (n_length > 0) {
          selected.current.length = n_length;
          bar.setAttributeNS(
            null,
            'width',
            selected.current.length * xStep
          );
        }
      }
    },
    move = (ev) => {
      if (selected.current) {
        drag(ev);
      } else {
        const { target, currentTarget: svg } = ev,
          id = target?.id,
          item = items.find((e) => e.ord === id);
        let content, mousePos, posInBox;
        if (item) {
          const {
            bottom,
            right,
          } = svg.parentElement.getBoundingClientRect();
          content = tooltipContent(item, start, locale);
          mousePos = getMousePosition(ev, svg);
          posInBox = {
            x: right - ev.clientX,
            y: bottom - ev.clientY,
          };
          document.dispatchEvent(
            new CustomEvent('showTooltip', {
              detail: { content, mousePos, posInBox },
            })
          );
        } else document.dispatchEvent(new CustomEvent('hideTooltip'));
      }
      //  ev.preventDefault();
    },
    endDrag = (ev) => {
      ev.preventDefault();
      if (selected.current) {
        const { item, length, handle } = selected.current;
        handle.classList.remove('h-drag');
        handle.setAttributeNS(
          null,
          'x',
          xPad + (item.start + length - 1) * xStep
        );
        if (item.length !== length) onChange(item, length);
      }
      selected.current = null;
    };

  const [collapsed, setCollapsed] = useState([]),
    _items = visibleItems(items, collapsed),
    numActive = _items.filter(Boolean).length,
    onClick = (id) => {
      const _id = items.findIndex((e) => e.ord === id),
        ind = collapsed.indexOf(_id),
        n_collapsed =
          ind > -1
            ? [
                ...collapsed.slice(0, ind),
                ...collapsed.slice(ind + 1),
              ]
            : [...collapsed, _id].sort();
      setCollapsed(n_collapsed);
    };

  useLayoutEffect(() => {
    const svg = document.querySelector('svg.gantt'),
      parent = svg.parentElement;
    container.current = parent.getBoundingClientRect();
    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', move);
    svg.addEventListener('mouseup', endDrag);
    // _svg.addEventListener('mouseout', hideTooltip);

    return () => {
      svg.removeEventListener('mousedown', startDrag);
      svg.removeEventListener('mousemove', move);
      svg.removeEventListener('mouseup', endDrag);
      //   _svg.removeEventListener('mouseout', hideTooltip);
    };
  }, [items]);

  let minWidth = xPad + xStep * (length + pad_s + pad_e),
    width = Math.max(minWidth, container.current.width - 15),
    height = header + yStep * items.length + yPad,
    btm = header + yStep * numActive + yPad;

  return (
    <div className="svg-container" style={style}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="gantt"
        height={btm}
        width={width + xStep}
        // style={{ overflowX: 'auto', overflowY: 'auto' }}
        // viewBox={`0 0 ${width} ${height}`}
      >
        <desc>SVG Gantt chart</desc>
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="3"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            markerUnits="strokeWidth"
            fill="#777"
            stroke="#555"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>

        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          className="grid-background"
        />
        <g id="rows">
          <rect
            x="0"
            y="0"
            width={width}
            height={header}
            className="grid-header"></rect>
          <line
            x1={xPad}
            x2={width}
            y1={day_upper + yPad}
            y2={day_upper + yPad}
            className="line-thicker"></line>
          {renderRow(day_upper + yPad, yStep, width)}

          {skipUndefined(_items, (e, i) => {
            const top = header + i * yStep;
            return renderRow(top, yStep, width, 0, e.ord);
          })}
        </g>
        <Legend
          items={_items}
          onClick={onClick}
          collapsed={collapsed}
        />
        <Columns
          xPad={xPad}
          length={length + pad_s + pad_e}
          daysOff={daysOff}
          wDaysOff={wDaysOff}
          top={header - yStep}
          bottom={btm}
          step={weekly ? wStep * 7 : dStep}
          weekly={weekly}
        />
        <Header
          width={width}
          height={header}
          timeline={timeline}
          length={length}
          bottom={height}
          step={xStep}
          pad={xPad}
          weekly={weekly}
        />

        <g id="bars">
          {skipUndefined(_items, (e, i) => {
            const x_start = xPadded + (e.start - 1) * xStep,
              x_end = xPadded + e.end * xStep,
              width = x_end - x_start,
              y_start = header + i * yStep,
              y_shift = yStep / 4;
            return e.leaf ? (
              e.length ? (
                <g key={e.ord}>
                  <rect
                    id={e.ord}
                    x={x_start}
                    y={y_start + y_shift}
                    width={width}
                    height={h_big}
                    rx={rd}
                    ry={rd}
                    className="bar"
                  />
                  {!disabled && (
                    <rect
                      id="r"
                      x={x_end}
                      y={y_start}
                      width={w_drag}
                      height={yStep}
                      rx={rd}
                      ry={rd}
                      className="handle"
                    />
                  )}
                </g>
              ) : (
                renderDashLine(
                  e.ord,
                  x_start,
                  x_end,
                  y_start + yStep / 3
                )
              )
            ) : (
              renderGroupBar(e.ord, x_start, width, y_start + y_shift)
            );
          })}
        </g>
        <g id="arrows">
          {items.map((e, i) => {
            const src = items[e.dependsOn];
            if (src) console.log(src.name, '->', e.name);
            return src ? (
              <Arrow
                key={i}
                start={{
                  x: xPadded + xStep * src.end,
                  y: header + (e.dependsOn + 0.37) * yStep,
                }}
                move={{
                  x: (e.start - src.end - 1) * xStep,
                  y: (i - e.dependsOn - 0.5) * yStep,
                }}
                step={xStep}
              />
            ) : null; //(move.x / 2) * step - 8
          })}
        </g>
        <Tooltip
          content={tooltipContent}
          start={start}
          locale={locale}
          title
          lines={start ? 5 : 4}
        />
        {'Sorry, your browser does not support inline SVG.'}
      </svg>
    </div>
  );
}
