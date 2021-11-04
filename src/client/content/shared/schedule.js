import { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import {
  addDays,
  dateSpec,
  daysInMonth,
  dayOfWeek,
  isDayOff,
  formatDate,
} from '@app/utils/calendar';
import { Label, Select } from '@app/components/core';
import { GanttChart } from '@app/components';

const ms = 3600 * 24,
  options = [
    { label: 'Day', id: 'd' },
    { label: 'Week', id: 'w' },
  ];
function scheduleLeaf(item, start) {
  const { duration, lag } = item,
    length = duration ? duration / ms : 0,
    _lag = lag ? lag / ms : 0;
  item.schedule = {
    id: item.id,
    length,
    start: start + 1 + _lag,
    end: start + length + _lag,
  };
  return item.schedule.end;
}
function scheduleItem(item, ref, options) {
  return item.items
    ? scheduleGroup(item, ref, options)
    : scheduleLeaf(item, ref);
}
function scheduleGroup(item, strt, options) {
  const { listProp } = options,
    items = item[listProp],
    { lag = 0, seq } = item,
    start = strt + lag,
    [dependent = [], independent = []] = _.partition(
      items,
      (e) => e.dependsOn
    );

  if (seq) {
    independent.reduce(
      (acc, e) => scheduleItem(e, acc, options),
      start
    );
  } else independent.forEach((e) => scheduleItem(e, start, options));
  //non-matching on dependsOn - start from beginning, matching may be dependent
  let predessesors = independent;
  while (dependent.length) {
    let deps = dependent
      .map((e) => {
        const pre = predessesors.find((x) => e.dependsOn === x.id);
        return pre && { item: e, pre };
      })
      .filter(Boolean);
    predessesors = [];
    deps.forEach(({ item, pre }) => {
      predessesors.push(item);
      _.remove(dependent, item);
      if (pre.schedule?.end) {
        const st = (pre?.schedule.end || 0) + (item.lag || 0) + 1;
        scheduleItem(item, st, options);
      }
    });
  }

  const end = Math.max(...items.map((e) => e.schedule.end));
  //items with no length span entire time slot
  items.forEach((it) => {
    if (!it.schedule?.length) it.schedule.end = end;
    if (it.dependsOn) it.schedule.dependsOn = it.dependsOn;
  });
  item.schedule = {
    id: item.id,
    length: end - start,
    start: start + 1,
    end,
    group: true,
  };

  return end;
}

function updateTimeline(timeline, date, locale, frmt) {
  const current = _.last(timeline),
    { d, m, y } = dateSpec(date);
  if (current.ind !== m) {
    //new month started
    current.end = daysInMonth(current.ind, y);
    timeline.push({
      name: formatDate(date, locale, frmt),
      start: 1,
      end: d,
      ind: m,
    });
  } else current.end = d;
}
function withCalendar(items, startDate, options) {
  const { locale, workOn } = options,
    duration = Math.max(...items.map((e) => e.end)),
    res = {
      start: startDate,
      duration,
      end: duration,
      items,
      daysOff: [],
      wDaysOff: [],
      pad: [0, 0],
    };
  if (!(startDate && items.length)) return res;

  const { daysOff, wDaysOff } = res,
    worksAll = _.isString(workOn),
    frmt = { year: 'numeric', month: 'short' },
    padLeft = dayOfWeek(startDate, locale) - 1,
    timelineStart = addDays(startDate, -padLeft),
    tlStartsOff = isDayOff(timelineStart);
  if (tlStartsOff) daysOff.push(1);
  let worked = 0,
    day = 0,
    date = startDate,
    timeline = [
      {
        name: formatDate(startDate, locale, frmt),
        ind: timelineStart.getMonth(),
        start: timelineStart.getDate(),
      },
    ];

  while (worked < duration) {
    const dayOff = isDayOff(date, locale);
    updateTimeline(timeline, date, locale, frmt);
    if (dayOff) {
      const shifted = padLeft + day;
      if (!daysOff.includes(shifted)) daysOff.push(shifted);
      if (worksAll || workOn?.includes(dayOff.name)) {
        wDaysOff.push(_.last(daysOff));
        worked++;
      } else {
        items
          .filter((e) => e.end >= day)
          .forEach((e) => {
            e.end++;
            if (e.start > day) e.start++;
          });
      }
    } else worked++;
    date = addDays(startDate, day++);
  }
  const padRight = 7 - dayOfWeek(date, locale),
    endPadded = day + padLeft + padRight;
  if (!tlStartsOff) daysOff.push(endPadded - 1);
  if (!daysOff.includes(endPadded)) daysOff.push(endPadded);
  updateTimeline(timeline, addDays(date, padRight), locale, frmt);

  Object.assign(res, {
    end: duration + padLeft,
    timeline,
    pad: [padLeft, padRight],
  });
  return res;
}

function flattenTree(items, prop, result = [], ord) {
  items.forEach((e, i) => {
    const r = e.schedule;
    delete e.schedule;
    r.name = e.name;
    r.ord = [ord, i + 1].filter(Boolean).join('.');
    r.level = r.ord.split('.').length;
    result.push(r);
    if (e.items) {
      flattenTree(e.items, prop, result, r.ord);
    } else r.leaf = true;
  });

  return result;
}
function generateSchedule(items = [], startDate, options) {
  scheduleGroup({ items, seq: true }, 0, options);
  const list = flattenTree(items, options.listProp),
    res = withCalendar(list, startDate, options);
  list.forEach((e) => {
    if (e.dependsOn)
      e.dependsOn = list.findIndex((it) => e.dependsOn === it.id);
  });
  return res;
}

Schedule.propTypes = {
  value: PropTypes.array,
  readonly: PropTypes.bool,
  onChange: PropTypes.func,
  listProp: PropTypes.string,
  locale: PropTypes.string,
  startDate: PropTypes.instanceOf(Date),
  workOn: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};
export default function Schedule({
  value,
  readonly,
  onChange,
  listProp = 'items',
  locale,
  startDate,
  workOn,
}) {
  //locale = 'de-DE';
  const [schedule, dispatch] = useReducer(_.merge, {
      items: [],
      daysOff: [],
      wDaysOff: [],
      timeline: [],
      mode: 'd',
    }),
    onMode = (mode) => {
      dispatch({ mode });
    },
    changed = (item, length) => {
      //!!!!!!!!!!!!! item.start + length -1)on holiday; 2)add working days only
      const ord = item.ord.split('.').map((e) => Number(e) - 1),
        path = [];
      ord.reduce((acc, e) => {
        const item = acc[e],
          list = item[listProp];
        path.push(item.id);
        if (list) path.push(listProp);
        return list || item;
      }, value);
      const extra = _.arrayOfIndexes(length, schedule.pad[0]).filter(
          (e) =>
            schedule.daysOff.includes(e) &&
            !schedule.wDaysOff.includes(e)
        ),
        duration = length - extra.length;
      onChange(_.dotMerge(...path), duration * ms);
    };

  useEffect(() => {
    const sched = generateSchedule(value, startDate, {
      listProp,
      locale,
      workOn,
    });
    dispatch(sched);
  }, [value]);

  return (
    <>
      <div className="justaposed" style={{ marginBottom: '0.5rem' }}>
        <span>
          <Label text="Process Schedule" />
          <span className="dayOff">Calendar day off</span>
          <span className="dayOff work">
            Work scheduled on day off
          </span>
        </span>
        <span>
          <Label className="hr" text="View by" />
          <Select
            small
            options={options}
            value={schedule.mode}
            onChange={onMode}
          />
        </span>
      </div>
      <GanttChart
        {...schedule}
        locale={locale}
        disabled={readonly}
        onChange={changed}
        style={{ height: '36rem' }}
      />
    </>
  );
}
