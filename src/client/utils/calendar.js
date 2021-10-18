import dayjs from 'dayjs';
import { _ } from '@app/helpers';
import HolidayTracker from './calendar_holidays';

//Monday
const dfltLocale = 'en-CA',
  sunStart = ['en-CA', 'en-US'],
  year = 2021,
  month = 3,
  day = 19,
  janDays = 31,
  febDays = 28,
  otherDays = [31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  allDays = [janDays, febDays, ...otherDays],
  trackers = {
    2020: new HolidayTracker(2020),
    2021: new HolidayTracker(2021),
    2022: new HolidayTracker(2022),
  };

function currentYear() {
  return new Date().getFullYear();
}

export function dateSpec(d) {
  return {
    y: d.getFullYear(),
    m: d.getMonth(),
    d: d.getDate(),
    day: d.getDay(),
  };
}
export function daysInMonth(m, y) {
  if (!y) y = currentYear();
  const month = m % 12, // - 1,
    leap = !(y % 4),
    days = allDays[month];
  return month === 1 && leap ? days + 1 : days;
}
export function formatDate(d, locale = dfltLocale, options) {
  return new Intl.DateTimeFormat(locale, options).format(d);
}
export function getWeekDays(locale = dfltLocale) {
  return [...Array(7)]
    .map((_, i) => new Date(year, month, day + i))
    .map((d, i) => ({
      id: i.toString(),
      short: d.toLocaleString(locale, { weekday: 'short' }),
      long: d.toLocaleString(locale, { weekday: 'long' }),
    }));
}

export function getDaysByMonth(year) {
  if (!year) year = currentYear();
  const leap = !(year % 4);
  return leap
    ? [janDays, febDays + 1, ...otherDays]
    : [janDays, febDays, ...otherDays];
}
export function dayOfWeek(d, locale = dfltLocale) {
  const day = d.getDay();
  return sunStart.includes(locale) ? day + 1 : day > 0 ? day : 7;
}
export function startOfWeek(d, locale = dfltLocale) {
  const spec = dateSpec(d),
    shift = spec.day + (sunStart.includes(locale) ? 1 : 0);
  return new Date(spec.y, spec.m, spec.d - shift);
}
export function endOfWeek(d, locale = dfltLocale) {
  const spec = dateSpec(d),
    shift = spec.day + (sunStart.includes(locale) ? 1 : 0);
  return new Date(spec.y, spec.m, spec.d - shift);
}
export function compareDates(d1, d2) {
  const r1 = d1.valueOf(),
    r2 = d2.valueOf();
  return r1 < r2 ? -1 : r1 > r2 ? 1 : 0;
}
export function add(d, num, of = 'day') {
  return dayjs(d).add(num, of).toDate();
}
export function addDays(d, days = 0) {
  if (!days) return d;
  const spec = dateSpec(d);
  return new Date(spec.y, spec.m, spec.d + days);
}
export function isDayOff(date) {
  const { day, y, m, d } = dateSpec(date);
  return holidayTracker(y).isDayOff(day, m, d);
}
export function holidayTracker(y) {
  const year = _.isNumber(y) ? y : y.getFullYear();
  if (!trackers[year]) trackers[year] = new HolidayTracker(year);
  return trackers[year];
}
