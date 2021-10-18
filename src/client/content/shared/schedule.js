import { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import {
  addDays,
  compareDates,
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
function getSchedule(item, start) {
  const { duration } = item,
    length = duration ? duration / ms : 0;
  return {
    length,
    start: start + 1,
    end: start + length,
  };
}
function timelineTask(
  start,
  duration,
  options,
  fnNonWorking,
  fnWorking
) {
  const { daysOff, w_daysOff, locale, startDate, workOn } = options,
    worksAll = _.isString(workOn);

  let ref = start,
    passed = 0;
  while (passed < duration) {
    const date = addDays(startDate, ref++),
      dayOff = isDayOff(date, locale);
    if (dayOff && !daysOff.includes(ref)) daysOff.push(ref);
    const works =
      !dayOff || worksAll || workOn?.includes(dayOff.name);
    if (works) {
      fnWorking?.(passed, ref);
      dayOff && w_daysOff.push(_.last(daysOff));
      passed++;
    } else fnNonWorking?.(passed, ref);
  }
  return;
}
function scheduleFork(items, start, options) {
  items.forEach((item) => {
    item.schedule = getSchedule(item, start);
  });
  const schedules = items.map((e) => e.schedule);
  if (options.startDate) {
    const duration = Math.max(...schedules.map((e) => e.length));
    timelineTask(start, duration, options, (wd) =>
      schedules.filter((e) => e.length > wd).forEach((e) => e.end++)
    );
  }

  return (
    start + Math.max(...schedules.map((e) => e.end - e.start + 1))
  );
}
function scheduleLeaf(item, start, options) {
  scheduleFork([item], start, options);
  return item.schedule.end;
}
function scheduleSeq(items, start, options) {
  const end = items.reduce(
    (acc, item) => scheduleItem(item, acc, options),
    start
  );
  return end;
}
function scheduleGroup(item, start, options, parallel) {
  const items = item[options.listProp],
    end = parallel
      ? scheduleFork(items, start, options)
      : scheduleSeq(items, start, options),
    lengths = items.map((e) => e.schedule.length),
    length = item.parallel ? Math.max(...lengths) : _.sum(lengths);
  //items with no length span entire time slot
  items.forEach((it) => {
    if (!it.schedule?.length) {
      it.schedule.end = end;
    }
  });
  item.schedule = { length, start: start + 1, end };

  return end;
}
function scheduleItem(item, start, options) {
  const { listProp } = options,
    end = item[listProp]
      ? scheduleGroup(item, start, options, item.parallel)
      : scheduleLeaf(item, start, options);

  return end;
}
function getLabels(start, length, locale) {
  let { m, y, d } = dateSpec(start),
    ref = new Date(y, ++m, 1);
  const frmt = { year: 'numeric', month: 'short' },
    end = addDays(start, length - 1),
    timeline = [
      {
        name: formatDate(start, locale, frmt),
        start: d,
      },
    ];
  //start getMonth, all full monthes, last month
  while (compareDates(ref, end) <= 0) {
    _.last(timeline).end = daysInMonth(m - 1, y);
    timeline.push({
      name: formatDate(ref, locale, frmt),
      start: 1,
    });
    ref = new Date(y, ++m, 1);
  }
  _.last(timeline).end = end.getDate();
  return timeline;
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
function generateSchedule(items, options) {
  options.daysOff = [];
  options.w_daysOff = [];
  const end = scheduleGroup({ items }, 0, options),
    { listProp, locale, startDate, daysOff, w_daysOff } = options,
    list = flattenTree(items, listProp);
  let timeline,
    padLeft = 0,
    padRight = 0;

  if (startDate) {
    const lastDay = addDays(startDate, end - 1);
    padLeft = dayOfWeek(startDate, locale) - 1;
    const timelineStart = addDays(startDate, -padLeft);
    padRight = 7 - dayOfWeek(lastDay, locale);
    timeline = getLabels(
      timelineStart,
      end + padLeft + padRight,
      locale
    );

    daysOff.forEach((e, i) => {
      daysOff[i] = e + padLeft;
    });
    w_daysOff.forEach((e, i) => {
      w_daysOff[i] = e + padLeft;
    });
    const endPadded = end + padLeft + padRight;
    if (isDayOff(timelineStart)) {
      daysOff.unshift(1);
      if (!daysOff.includes(endPadded)) daysOff.push(endPadded);
    } else daysOff.push(endPadded - 1, endPadded);
  }

  //hack for dependencies
  const nexts = [];
  list.forEach((e) => {
    const d = e.end + 1,
      next = list.findIndex((it) => d === it.start);
    if (next > -1 && !nexts.includes(next)) {
      nexts.push(next);
      e.next = next;
    }
  });

  return {
    start: startDate,
    end: end + padLeft,
    pad: [padLeft, padRight],
    items: list,
    timeline,
    daysOff,
    wDaysOff: w_daysOff,
  };
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
    //!!!if start date not set, timeline udefined
    const sched = generateSchedule(value, {
      startDate,
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
      />
    </>
  );
}
