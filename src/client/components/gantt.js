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

const header = 50,
  dStep = 20,
  wStep = 6,
  yStep = 28,
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
        y={(ind + 0.5) * yStep}
        onClick={clicked}
        //style={{ pointerEvents: 'bounding-box' }}
        className="bar-label">
        <tspan>{`${
          e.group ? (collapsed.includes(i) ? '\u271B' : '\u2012') : ''
        }`}</tspan>
        <tspan>{`${e.ord}. ${e.name}`}</tspan>
      </text>
    );

  return (
    <>
      {skipUndefined(items, (e, i) => (
        <rect
          key={e.ord}
          x={0}
          y={i * yStep}
          height={yStep}
          width="100%"></rect>
      ))}
      {skipUndefined(items, render)}
    </>
  );
}

const dfltTimeline = (length, weekly) => [
  { name: weekly ? 'Week' : 'Day', start: 1, end: length },
];
Header.propTypes = {
  width: PropTypes.number,
  left: PropTypes.number,
  timeline: PropTypes.array,
  bottom: PropTypes.number,
  length: PropTypes.number,
  step: PropTypes.number,
  pad: PropTypes.number,
  weekly: PropTypes.bool,
};
function Header({ timeline, length, width, step, left, weekly }) {
  //, height, width
  let span = left + step / 2,
    _l = Math.ceil(length / 7),
    day_upper = header / 2 - 10,
    l_upper = day_upper + 8;
  return (
    <g id="dates">
      {length && (
        <line
          x1={0}
          x2={width}
          y1={l_upper}
          y2={l_upper}
          className="line"
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
            {i < timeline.length - 1 && (
              <line
                key={i}
                x1={span_end - step / 2}
                x2={span_end - step / 2}
                y1={0}
                y2={l_upper}
                className="line-thicker"
              />
            )}
            {!weekly &&
              _.times(l, (j) => {
                const _x = span + j * step,
                  _x1 = _x + step / 2;
                return (
                  <Fragment key={j}>
                    <text
                      x={_x}
                      y={header - 10}
                      className="lower-text">
                      {start + j}
                    </text>
                    <line
                      x1={_x1}
                      x2={_x1}
                      y1={l_upper}
                      y2={2 * yStep}
                      className="line"
                    />
                  </Fragment>
                );
              })}
            {(span = span_end)}
          </Fragment>
        );
      })}
      {weekly &&
        _.times(_l, (j) => {
          const _x0 = 7 * j * step,
            _x = _x0 + 3 * step,
            _x1 = _x0 + 7 * step;
          return (
            <Fragment key={j}>
              <text x={_x} y={header - 10} className="lower-text">
                {'w' + (j + 1)}
              </text>
              <line
                x1={_x1}
                x2={_x1}
                y1={l_upper}
                y2={2 * yStep}
                className="line"
              />
            </Fragment>
          );
        })}
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
    height = bottom - top;

  return (
    <g id="v-lines">
      {!weekly &&
        daysOff?.map((d) => (
          <rect
            key={d}
            className="day-highlight"
            x={xPad + (d - 1) * step}
            y={0}
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
            y={0}
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
  // style,
}) {
  const txtLength = Math.max(...items.map((e) => e.name?.length)) + 3,
    length = useMemo(() => Math.max(0, ...items.map((e) => e.end)), [
      items,
    ]),
    xPad = useMemo(
      () =>
        (Math.max(0, ...items.map((e) => e.name.length)) + 7) * 7 +
        sep,
      [items]
    ),
    [pad_s, pad_e] = pad || [0, 0],
    weekly = mode === 'w',
    scale = 1,
    xStep = weekly ? wStep : dStep,
    xPadded = pad_s * xStep,
    selected = useRef(),
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
    const cnt = document.querySelector('.gantt-container'),
      svgMain = cnt.querySelector('#gantt-main');
    cnt.style.setProperty('--first-row', header);
    cnt.style.setProperty('--first-col', txtLength);
    svgMain.addEventListener('mousedown', startDrag);
    svgMain.addEventListener('mousemove', move);
    svgMain.addEventListener('mouseup', endDrag);
    // _svg.addEventListener('mouseout', hideTooltip);

    return () => {
      svgMain.removeEventListener('mousedown', startDrag);
      svgMain.removeEventListener('mousemove', move);
      svgMain.removeEventListener('mouseup', endDrag);
      //   _svg.removeEventListener('mouseout', hideTooltip);
    };
  }, [items]);

  let width = xStep * (length + pad_s + pad_e),
    currentHeight = yStep * numActive;
  const [scroll, setScroll] = useState({ top: 0, left: 0 }),
    onScroll = (ev) =>
      setScroll({
        left: ev.target.scrollLeft,
        top: ev.target.scrollTop,
      });

  return (
    <div className="gantt-container">
      <div className="gantt-summary">
        <h6>{`Total: ${length} days`}</h6>
      </div>
      <div>
        <svg
          id="header"
          xmlns="http://www.w3.org/2000/svg"
          className="gantt"
          height={header}
          width={width}
          viewBox={`${scroll.left} 0 ${scale * width} ${header}`}>
          <Header
            width={width}
            height={header}
            timeline={timeline}
            length={length}
            step={xStep}
            left={-scrollX}
            pad={xPad}
            weekly={weekly}
          />
        </svg>
      </div>
      <div>
        <svg
          id="legend"
          xmlns="http://www.w3.org/2000/svg"
          className="gantt"
          height={currentHeight}
          width="1000" //"100%"
          viewBox={`0 ${scroll.top} 1000 ${scale * currentHeight}`}>
          <Legend
            items={_items}
            onClick={onClick}
            collapsed={collapsed}
          />
        </svg>
      </div>
      <div className="gantt-main" onScroll={onScroll}>
        <svg
          id="gantt-main"
          xmlns="http://www.w3.org/2000/svg"
          className="gantt"
          height={currentHeight}
          width={width}
          viewBox={`0 0 ${scale * width} ${scale * currentHeight}`}>
          <desc>SVG Gantt main area</desc>
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
          {skipUndefined(_items, (e, i) => (
            <rect
              key={e.ord}
              x={0}
              y={i * yStep}
              height={yStep}
              width="100%"></rect>
          ))}
          <Columns
            xPad={0}
            length={length + pad_s + pad_e}
            daysOff={daysOff}
            wDaysOff={wDaysOff}
            top={0}
            bottom={currentHeight}
            step={weekly ? wStep * 7 : dStep}
            weekly={weekly}
          />
          <g id="bars">
            {skipUndefined(_items, (e, i) => {
              const x_start = xPadded + (e.start - 1) * xStep,
                x_end = xPadded + e.end * xStep,
                width = x_end - x_start,
                y_start = i * yStep,
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
                renderGroupBar(
                  e.ord,
                  x_start,
                  width,
                  y_start + y_shift
                )
              );
            })}
          </g>
          <g id="arrows">
            {skipUndefined(_items, (e, i) => {
              const src = items[e.dependsOn];
              return src ? (
                <Arrow
                  key={i}
                  start={{
                    x: xPadded + xStep * src.end,
                    y: (e.dependsOn + 0.37) * yStep,
                  }}
                  move={{
                    x: (e.start - src.end - 1) * xStep,
                    y: (i - e.dependsOn - 0.5) * yStep,
                  }}
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
        </svg>
      </div>
    </div>
  );
}
