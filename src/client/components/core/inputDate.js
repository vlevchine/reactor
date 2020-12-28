import React, { useMemo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  add,
  format,
  parseISO,
  getWeeksInMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { classNames } from '@app/helpers';
import { calendar } from './helpers';
import { Button, MaskedInput, Popover } from '../index';
import classes from './styles.css';

const formatMonth = (d) => format(d, 'MMM, yyyy'),
  asDate = (v) => {
    const date = parseISO(v);
    return isNaN(date) ? undefined : date;
  },
  edgeWeek = (edge, weekStartsOn, shift = 0) => {
    //week day of edge day, set 8 if edge is the first day of the week
    let edge_weekDay = edge.getDay() - weekStartsOn;
    if (!edge_weekDay && shift < 0) edge_weekDay = 7;
    const edge_weekStart = (edge_weekDay < 7
      ? startOfWeek(edge, { weekStartsOn })
      : add(edge, { weeks: shift })
    ).getDate(); //day of month for the first day of edge week
    return {
      week: [...Array(7)].map((_, i) =>
        i < edge_weekDay ? edge_weekStart + i : i - edge_weekDay + 1
      ),
      edge: edge_weekDay,
    };
  },
  getMonthDetails = (date, weekStartsOn = 0) => {
    const d = date || new Date(),
      f_week = edgeWeek(startOfMonth(d), weekStartsOn, -1),
      l_week = edgeWeek(
        startOfMonth(add(d, { months: 1 })),
        weekStartsOn
      );
    return {
      monthFormatted: formatMonth(d),
      f_week,
      l_week,
      fullWeeks:
        getWeeksInMonth(d) -
        (f_week.edge < 7 ? 1 : 0) -
        (l_week.edge ? 1 : 0),
    };
  };

const renderWeek = (week, out, day) => (
  <div key={week[0]} className={classes.week}>
    {week.map((e, i) => {
      const outDay = out?.(i),
        shift = outDay ? -1 : 0;
      return (
        <span
          key={`${e}_${shift}`}
          className={classNames([classes.day], {
            mute: outDay,
            [classes.selectedDay]: !outDay && day === e,
          })}
          data-id={shift}>
          {e}
        </span>
      );
    })}
  </div>
);

const Calendar = (props) => {
  const {
      value,
      reference,
      locale,
      onChange,
      //disabled,
    } = props,
    { weekStart, name } = locale,
    weekDays = calendar.getWeekDays(name),
    [refDate, setRefDate] = useState(reference),
    { fullWeeks, f_week, l_week, monthFormatted } = useMemo(
      () => getMonthDetails(refDate, weekStart),
      [refDate]
    ),
    selected =
      value &&
      formatMonth(value) === monthFormatted &&
      value.getDate(),
    onDay = ({ target: { dataset, innerText } }) => {
      const shift = parseInt(dataset.id, 10) || 0,
        d = new Date(
          Date.UTC(
            refDate.getFullYear(),
            refDate.getMonth() + shift,
            innerText,
            12
          )
        );
      onChange(d);
    },
    onMonth = (ev, months = 0) => {
      setRefDate((d) => add(d, { months }));
    };

  useEffect(() => {
    setRefDate(reference);
  }, [reference]);

  return (
    <>
      <div className={classes.month}>
        <Button
          info="chevron-left"
          onClick={onMonth}
          id={-1}
          minimal
        />
        <span>{monthFormatted}</span>
        <Button
          info="chevron-right"
          onClick={onMonth}
          id={1}
          minimal
        />
      </div>
      <div className={classes.weekNames}>
        {weekDays.map((e, i) => (
          <span key={e} className={classes.day}>
            {weekDays[(i + weekStart) % 7]}
          </span>
        ))}
      </div>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events*/}
      <div
        role="button"
        tabIndex="0"
        className={classes.days}
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
    </>
  );
};
//https://www.youtube.com/watch?v=IxRJ8vplzAo
//2 modes: debounce - use debounce effect by with debounce prop set in ms,
//otherwise, notify onBlur only
const DateInput = (props) => {
  const {
      dataid,
      value,
      locale,
      clear,
      icon,
      disabled,
      minimal,
      style,
      onChange,
    } = props,
    pop = useRef(),
    [refDate, setRefDate] = useState(),
    lcl = calendar.getLocale(locale),
    onInput = (v) => {
      pop.current.hide();
      onChange(v, dataid);
    },
    update = (v) => {
      pop.current.hide();
      if (!v) return;
      const val = v.toISOString();
      if (val !== value) onChange(val, dataid);
    },
    openCalendar = () => {
      setRefDate(asDate(value) || new Date());
    },
    header = (
      <MaskedInput
        type="date"
        value={value}
        clear={clear}
        onChange={onInput}
        disabled={disabled}
      />
    );

  return (
    <Popover
      ref={pop}
      id={dataid}
      minimal={minimal}
      toggleIcon
      light
      // fill={fill}
      place="bottom"
      icon={icon}
      style={style}
      contentClass={classes.calendarPanel}
      onClose={update}
      onOpen={openCalendar}
      header={header}>
      <Calendar
        value={asDate(value)}
        reference={refDate}
        onChange={update}
        locale={lcl}
      />
    </Popover>
    // <Popover
    //   id={dataid}
    //   ref={pop}
    //   minimal={minimal}
    //   toggleIcon
    //   place="bottom"
    //   header={header}
    //   icon={icon}
    //   style={style}
    //   contentClass={classes.calendarPanel}
    //   onClose={update}
    //   onOpen={openCalendar}
    //   content={
    //   }></Popover>
  );
};

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
  icon: PropTypes.string,
  clear: PropTypes.bool,
};

export default DateInput;
