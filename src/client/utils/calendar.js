//Monday
const year = 2021,
  month = 3,
  day = 19,
  janDays = 31,
  febDays = 28,
  otherDays = [31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default {
  getWeekDays: (locale = 'en-CA') =>
    [...Array(7)]
      .map((_, i) => new Date(year, month, day + i))
      .map((d, i) => ({
        id: i.toString(),
        short: d.toLocaleString(locale, { weekday: 'short' }),
        long: d.toLocaleString(locale, { weekday: 'long' }),
      })),
  getDaysByMonth: (year) => {
    if (!year) year = new Date().getFullYear();
    const leap = !(year % 4);
    return leap
      ? [janDays, febDays + 1, ...otherDays]
      : [janDays, febDays, ...otherDays];
  },
};
