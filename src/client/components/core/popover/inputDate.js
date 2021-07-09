import { memo, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { _,classNames } from '@app/helpers';
import { getSpec, calendar, useCommand } from '../helpers';
import { Button, Popover, Decorator, ClearButton } from '..';
import { MaskSlots } from '../inputs/maskedInput';
import './styles.css';

const add = (d, num, of) => dayjs(d).add(num, of).toDate(),
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
export default memo(DateInput);
function DateInput(props) {
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
      invalidate,
    } = props,
    [val, setVal] = useState(() => _.parseDate(value)),
    lcl = calendar.locales[locale],
    spec = getSpec('date', locale),
    [cmdClose, setClose] = useCommand(),
    onInput = (v, done) => {
      if (!done) return;
      const res = spec.validate(v);
      invalidate?.(!res.status);
      //valid -> report, invalid - ?
      if (res.status) {
        if (res.value) {
          if (!_.sameDate(res.value, val))
            onChange(res.value, dataid);
        } else if (!val) onChange(res.value, dataid);
      }
    },
    update = (v) => {
      if (!v) return;
      setClose();
      if (!_.sameDate(v, val)) onChange(v, dataid);
    };

    useEffect(() => { 
      const n_val = _.parseDate(value)
      if (!_.sameDate(val, n_val)) setVal(n_val)
    }, [value])

  return (
    <Popover
      id={dataid}
      cmdClose={cmdClose}
      minimal={minimal}
      disabled={disabled}
      withIcon={!!prepend}
      className={classNames([className], { prepend })}
      target={
        <Decorator
          prepend={prepend}
          append="calendar"
          hasValue={!!val}
          onChange={onInput}
          style={style}
          intent={intent}
          minimal={minimal}>
          <MaskSlots
            type="date"
            spec={spec}
            onChange={onInput}
            value={spec.valueToSlots(val)}
            disabled={disabled}
          />
          <ClearButton
            clear={clear}
            id={dataid}
            disabled={disabled || !val}
            onChange={onChange}
          />
        </Decorator>
      }
      content={
        <Calendar value={val} onChange={update} locale={lcl} />
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
  invalidate: PropTypes.func,
  disabled: PropTypes.bool,
  minimal: PropTypes.bool,
  prepend: PropTypes.string,
  clear: PropTypes.bool,
  intent: PropTypes.string,
  className: PropTypes.string,
};
