/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import { memo, useMemo, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { _, classNames } from '@app/helpers';
import {
  getSpec,
  calendar,
  useCommand,
  useChangeReporter,
  dropdownCloseRequest,
} from '../helpers';
import {
  Button,
  Popover,
  Decorator,
  ClearButton,
  Decorate, //MaskInput,
} from '..';
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
      days: [...Array(7)].map((_, i) =>
        i < edge_weekDay ? edge_weekStart + i : i - edge_weekDay + 1
      ),
      edge: edge_weekDay,
    };
  },
  getMonthDetails = (date, weekStartsOn = 0, locale) => {
    const d = date || new Date(),
      monthFormatted = formatMonth(d, locale),
      f_week = edgeWeek(startOfMonth(d), weekStartsOn, -1),
      l_week = edgeWeek(
        startOfMonth(add(d, 1, 'month')),
        weekStartsOn
      );
    f_week.id = [f_week.days[6], monthFormatted].join(',');
    l_week.id = [l_week.days[0], monthFormatted].join(',');
    return {
      monthFormatted,
      f_week,
      l_week,
      fullWeeks:
        weeksInMonth(d) -
        (f_week.edge < 7 ? 1 : 0) -
        (l_week.edge ? 1 : 0),
    };
  };

const renderWeek = (week, out, day) => (
  <div key={week.id} className="week">
    {week.days.map((e, i) => {
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

//https://www.youtube.com/watch?v=IxRJ8vplzAo
//2 modes: debounce - use debounce effect by with debounce prop set in ms,
//otherwise, notify onBlur only
export const DateInput0 = memo(DateInput00);
function DateInput00(props) {
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
    const n_val = _.parseDate(value);
    if (!_.sameDate(val, n_val)) setVal(n_val);
  }, [value]);

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

DateInput00.propTypes = {
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

function getDate(date, day) {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), day, 12)
  );
}
function spanToDate(date, target) {
  const { dataset, innerText } = target;
  if (parseInt(dataset.id, 10) === 0)
    return parseInt(dataset.id, 10) === 0
      ? getDate(date, innerText)
      : undefined;
}
Calendar.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
  ]),
  reference: PropTypes.instanceOf(Date),
  locale: PropTypes.object,
  onChange: PropTypes.func,
  onHover: PropTypes.func,
  disabled: PropTypes.bool,
};
function Calendar(props) {
  const { value, locale, onChange, onHover } = props,
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
    hover = (ev) => {
      onHover?.(spanToDate(refDate, ev.target));
    },
    onDay = (ev) => {
      const res = spanToDate(refDate, ev.target);
      if (res) onChange(res, ev);
    },
    onMonth = (ev, months = 0) => {
      ev.stopPropagation();
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
          onClickCapture={onMonth}
          id={-1}
          minimal
        />
        <span>{monthFormatted}</span>
        <Button
          className="clip-icon chevron-right"
          onClickCapture={onMonth}
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
        onMouseOver={hover}
        onClick={onDay}>
        {renderWeek(f_week, (d) => d < f_week.edge, selected)}
        {[...Array(fullWeeks)].map((_, i) => {
          const shift = 8 - f_week.edge + i * 7;
          return renderWeek(
            {
              id: [shift, monthFormatted].join(','),
              days: weekDays.map((_, e) => shift + e),
            },
            () => false,
            selected
          );
        })}
        {renderWeek(l_week, (d) => d >= l_week.edge, selected)}
      </div>
    </div>
  );
}
const animOptions = { duration: 300 };
DateInput.propTypes = {
  id: PropTypes.string,
  value: PropTypes.instanceOf(Date),
  type: PropTypes.string,
  locale: PropTypes.string,
  disabled: PropTypes.bool,
  clear: PropTypes.bool,
};
const _type = 'date';
export default function DateInput({
  id,
  value,
  disabled,
  locale,
  clear,
  ...props
}) {
  const locCalendar = _.isObject(locale)
      ? locale
      : calendar.locales[locale],
    spec = getSpec(_type, locCalendar),
    candidate = useRef(),
    hovering = useRef(),
    hover = (v) => {
      hovering.current = v;
    },
    [_value, changed, , setVal] = useChangeReporter(
      value,
      props,
      (v) => spec.toString(v)
    ),
    update = (v) => {
      if (!_.sameDate(v, _value)) changed(v, id);
      dropdownCloseRequest(id);
    },
    onDropdownClose = (ev, original_ev) => {
      if (original_ev?.key === 'Enter') changed(hovering.current, id);
      candidate.current = undefined;
      hovering.current = undefined;
    },
    onTyping = (ev) => {
      const res = spec.validateInput(ev.target.value, locCalendar);
      candidate.current = res.value;
      setVal(ev.target.value);
    },
    onClick = ({ target }, dt) => {
      const out = !(dt.onDropdown || dt.onWrapper);
      if (out) {
        const n_v = candidate.current || hovering.current;
        if (n_v) {
          candidate.current = undefined;
          hovering.current = undefined;
          changed(n_v, id);
        } else setVal(_value);
      }
      if (out || target.classList.contains('selected-day'))
        dropdownCloseRequest(id);
    };

  return (
    <Decorate
      {...props}
      clear={clear && _value ? update : undefined}
      append="calendar"
      disabled={disabled}
      dropdown={{
        component: (
          <Calendar
            value={candidate.current || value}
            onChange={update}
            locale={locCalendar}
            onHover={hover}
          />
        ),
        animate: animOptions,
        ignoreClickOnSource: true,
        onDropdownClose,
        className: 'calendar',
        onClick,
      }}>
      <input
        autoComplete="off"
        value={_value}
        //onClickCapture={() =>  ev.stopPropagation()}
        onChange={onTyping}
        className="no-border"
        //  style={innerStyle}
      />
    </Decorate>
  );
}
