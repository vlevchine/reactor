import { useRef, useMemo, useLayoutEffect, Fragment } from 'react';
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
  barShift = header + 7,
  contentsStart = header + yStep / 2,
  rd = 3,
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

Legend.propTypes = {
  items: PropTypes.array,
  bottom: PropTypes.number,
  top: PropTypes.number,
  length: PropTypes.number,
};
function Legend({ items }) {
  //top,
  return (
    <g id="tasks">
      {items.map((e, i) => (
        <text
          key={e.ord}
          x={10 * e.level}
          y={contentsStart + i * yStep}
          className="bar-label">
          {`${e.ord}. ${e.name}`}
        </text>
      ))}
    </g>
  );
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
};
function Header({ timeline, length, bottom, step, pad, weekly }) {
  //, height, width
  let span = pad + step / 2,
    _l = Math.ceil(length / 7),
    brd = span - step / 2 - 4;
  return (
    <g id="header">
      <text
        x={10}
        y={day_upper}
        className="bar-label title">{`Total: ${length} days`}</text>
      <g id="dates">
        <line
          x1={brd}
          x2={brd}
          y1={0}
          y2={bottom}
          className="line-thickest"
        />
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

Rows.propTypes = {
  items: PropTypes.array,
  width: PropTypes.number,
  headerHeight: PropTypes.number,
  top: PropTypes.number,
};
function Rows({ items, top, headerHeight, width }) {
  let y = top;
  return (
    <g>
      <rect
        x="0"
        y="0"
        width={width}
        height={headerHeight}
        className="grid-header"></rect>
      <rect
        x="0"
        y={day_upper + yPad}
        width={width}
        height={yStep}
        className="row-shade"></rect>
      <line
        x1="0"
        x2={width}
        y1={day_upper + yPad}
        y2={day_upper + yPad}
        className="line"></line>
      {items.map((e) => (
        <g key={e.ord} className="grid-row">
          <rect y={y} width={width} height={yStep}></rect>
          <line x2={width} y1={y} y2={y} className="line"></line>
          {(y += yStep)}
        </g>
      ))}
      <line x2={width} y1={y} y2={y} className="line"></line>
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
    btm = bottom - yStep / 2,
    height = btm - top;

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
              y2={btm}
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
function Arrow({ start, move, step }) {
  return (
    <path
      markerEnd="url(#arrowhead)"
      d={`M ${start.x + 1} ${start.y - 3} h ${
        (move.x / 2) * step - 8
      } ${bend_tr} v ${move.y * yStep - 15}`}></path>
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
}) {
  const length = useMemo(
      () => Math.max(0, ...items.map((e) => e.end)),
      [items]
    ),
    xPad = useMemo(
      () => (Math.max(0, ...items.map((e) => e.name.length)) + 7) * 7,
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

  useLayoutEffect(() => {
    const svg = document.querySelector('svg.gantt');
    container.current = svg.parentElement.getBoundingClientRect();
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
    height = header + yStep * items.length + yPad;

  return (
    <div className="svg-container">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="gantt"
        height={height}
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
        <g>
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            className="grid-background"
          />
          <Rows
            items={items}
            top={header}
            width={width}
            headerHeight={header}
          />
          <Columns
            xPad={xPad}
            length={length + pad_s + pad_e}
            daysOff={daysOff}
            wDaysOff={wDaysOff}
            top={header - yStep}
            bottom={height}
            step={weekly ? wStep * 7 : dStep}
            weekly={weekly}
          />
          <Header
            timeline={timeline}
            length={length}
            bottom={height}
            step={xStep}
            pad={xPad}
            weekly={weekly}
          />
        </g>
        <Legend items={items} top={header} />
        <g id="bars">
          {items.map((e, i) => {
            const x_start = xPadded + (e.start - 1) * xStep,
              x_end = xPadded + e.end * xStep,
              width = x_end - x_start,
              y_start = barShift + i * yStep;
            return e.leaf ? (
              e.length ? (
                <g key={e.ord}>
                  <rect
                    id={e.ord}
                    x={x_start}
                    y={y_start}
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
                      y={header + i * yStep}
                      width={w_drag}
                      height={yStep}
                      rx={rd}
                      ry={rd}
                      className="handle"
                    />
                  )}
                </g>
              ) : (
                <line
                  key={e.ord}
                  id={e.ord}
                  className="spanning-line"
                  x1={x_start}
                  x2={x_end}
                  y1={y_start + yStep / 3}
                  y2={y_start + yStep / 3}
                />
              )
            ) : (
              <g key={e.ord}>
                <rect
                  id={e.ord}
                  x={x_start}
                  y={y_start}
                  width={width}
                  height={h_small}
                  rx={0}
                  ry={0}
                  className="bar-dark"></rect>
                <path
                  className="edge"
                  d={`M ${x_start} ${y_start} v 12 l -5 -12`}
                />
                <path
                  className="edge"
                  d={`M ${x_end} ${y_start} v 12 l 5 -12`}
                />
              </g>
            );
          })}
        </g>
        <g id="arrows">
          {items.map((e, i) => {
            return e.next ? (
              <Arrow
                key={i}
                start={{
                  x: xPadded + xStep * e.end,
                  y: header + (i + 1 - 0.5) * yStep,
                }}
                move={{ x: items[e.next].length, y: e.next - i }}
                step={xStep}
              />
            ) : null;
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
