import { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { classNames } from '@app/helpers';
import { calendar } from '../helpers';
import { useCommand } from '../helpers';
import { Button, MaskedInput, Popover } from '..';
import './styles.css';

const parse = (d) => {
    const ms = Date.parse(d);
    return isNaN(ms) ? undefined : new Date(ms);
  },
  sameDate = (d1, d2) => d1?.valueOf() === d2?.valueOf(),
  add = (d, num, of) => dayjs(d).add(num, of).toDate(),
  dayOfWeek = (d, start = 0) => {
    const num = d.getDay() - start;
    return num < 0 ? num + 7 : num;
  },
  startOfWeek = (d, start = 0) =>
    dayjs(d).day(start).hour(0).minute(0).second(0).toDate(),
  startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1),
  weeksInMonth = (d, start = 0) => {
    const y = d.getFullYear(),
      m = d.getMonth(),
      startsOn = dayOfWeek(new Date(y, m, 1), start),
      daysInMoth = new Date(y, m + 1, 0).getDate();
    return Math.ceil((daysInMoth + startsOn) / 7);
  },
  formatMonth = (d, locale) => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
    }).format(d);
  },
  edgeWeek = (edge, weekStartsOn, shift = 0) => {
    //week day of edge day, set 8 if edge is the first day of the week
    let edge_weekDay = edge.getDay() - weekStartsOn;
    if (!edge_weekDay && shift < 0) edge_weekDay = 7;
    const edge_weekStart = (edge_weekDay < 7
      ? startOfWeek(edge, weekStartsOn)
      : add(edge, shift, 'w')
    ).getDate(); //day of month for the first day of edge week
    return {
      week: [...Array(7)].map((_, i) =>
        i < edge_weekDay ? edge_weekStart + i : i - edge_weekDay + 1
      ),
      edge: edge_weekDay,
    };
  },
  getMonthDetails = (date, weekStartsOn = 0, locale) => {
    const d = date || new Date(),
      f_week = edgeWeek(startOfMonth(d), weekStartsOn, -1),
      l_week = edgeWeek(
        startOfMonth(add(d, 1, 'month')),
        weekStartsOn
      );
    return {
      monthFormatted: formatMonth(d, locale),
      f_week,
      l_week,
      fullWeeks:
        weeksInMonth(d) -
        (f_week.edge < 7 ? 1 : 0) -
        (l_week.edge ? 1 : 0),
    };
  };

const renderWeek = (week, out, day) => (
  <div key={week[0]} className="week">
    {week.map((e, i) => {
      const outDay = out?.(i),
        shift = outDay ? -1 : 0;
      return (
        <span
          key={`${e}_${shift}`}
          className={classNames(['day'], {
            ['out-day']: outDay,
            ['selected-day']: !outDay && day === e,
          })}
          data-id={shift}>
          {e}
        </span>
      );
    })}
  </div>
);

const Calendar = (props) => {
  const { value, locale, onChange } = props,
    { weekStart, name } = locale,
    weekDays = calendar.getWeekDays(name),
    [refDate, setRefDate] = useState(value || new Date()),
    { fullWeeks, f_week, l_week, monthFormatted } = useMemo(
      () => getMonthDetails(refDate, weekStart, name),
      [refDate]
    ),
    selected =
      value &&
      formatMonth(value, name) === monthFormatted &&
      value.getDate(),
    onDay = ({ target: { dataset, innerText } }) => {
      if (parseInt(dataset.id, 10) === 0)
        onChange(
          new Date(
            Date.UTC(
              refDate.getFullYear(),
              refDate.getMonth(),
              innerText,
              12
            )
          )
        );
    },
    onMonth = (ev, months = 0) => {
      setRefDate((d) => add(d, months, 'M'));
    };

  useEffect(() => {
    setRefDate(value || new Date());
  }, [value]);

  return (
    <div className="calendar-panel">
      <div className="month">
        <Button
          className="clip-icon rotate180 chevron-right"
          onClick={onMonth}
          id={-1}
          minimal
        />
        <span>{monthFormatted}</span>
        <Button
          className="clip-icon chevron-right"
          onClick={onMonth}
          id={1}
          minimal
        />
      </div>
      <div className="week-names">
        {weekDays.map((e, i) => (
          <span key={e} className="day">
            {weekDays[(i + weekStart) % 7]}
          </span>
        ))}
      </div>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events*/}
      <div
        role="button"
        tabIndex="0"
        className="days"
        onClick={onDay}>
        {renderWeek(f_week.week, (d) => d < f_week.edge, selected)}
        {[...Array(fullWeeks)].map((_, i) => {
          const shift = 8 - f_week.edge + i * 7;
          return renderWeek(
            weekDays.map((_, e) => shift + e),
            () => false,
            selected
          );
        })}
        {renderWeek(l_week.week, (d) => d >= l_week.edge, selected)}
      </div>
    </div>
  );
};
//https://www.youtube.com/watch?v=IxRJ8vplzAo
//2 modes: debounce - use debounce effect by with debounce prop set in ms,
//otherwise, notify onBlur only
export default function DateInput(props) {
  const {
      dataid,
      value,
      locale,
      prepend,
      disabled,
      minimal,
      style,
      clear,
      intent,
      className,
      onChange,
    } = props,
    refDate = parse(value),
    lcl = calendar.getLocale(locale),
    [cmdClose, setClose] = useCommand(),
    onInput = (v) => {
      const val = v ? new Date(v) : v;
      if (!sameDate(val, value)) onChange(val, dataid);
    },
    update = (v) => {
      if (!v) return;
      setClose();
      if (!sameDate(v, value)) onChange(v, dataid);
    };

  return (
    <Popover
      id={dataid}
      cmdClose={cmdClose}
      minimal={minimal}
      disabled={disabled}
      withIcon={!!prepend}
      className={classNames([className], {
        ['has-value']: value,
      })}
      target={
        <MaskedInput
          dataid={dataid}
          type="date"
          value={value?.toLocaleDateString(locale)}
          onChange={onInput}
          disabled={disabled}
          prepend={prepend}
          clear={clear}
          append="chevron-down"
          appendType="clip"
          intent={intent}
          // onChange={handleChange}
          style={style}
        />
      }
      content={
        <Calendar value={refDate} onChange={update} locale={lcl} />
      }
    />
  );
}

Calendar.propTypes = {
  value: PropTypes.instanceOf(Date),
  reference: PropTypes.instanceOf(Date),
  locale: PropTypes.object,
  onChange: PropTypes.func,
  clickOut: PropTypes.func,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
};
DateInput.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  locale: PropTypes.string,
  style: PropTypes.object,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  minimal: PropTypes.bool,
  prepend: PropTypes.string,
  clear: PropTypes.bool,
  intent: PropTypes.string,
  className: PropTypes.string,
};
