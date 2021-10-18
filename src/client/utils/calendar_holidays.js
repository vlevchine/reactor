function easter(y) {
  var c = Math.floor(y / 100);
  var n = y - 19 * Math.floor(y / 19);
  var k = Math.floor((c - 17) / 25);
  var i =
    c - Math.floor(c / 4) - Math.floor((c - k) / 3) + 19 * n + 15;
  i = i - 30 * Math.floor(i / 30);
  i =
    i -
    Math.floor(i / 28) *
      (1 -
        Math.floor(i / 28) *
          Math.floor(29 / (i + 1)) *
          Math.floor((21 - n) / 11));
  var j = y + Math.floor(y / 4) + i + 2 - c + Math.floor(c / 4);
  j = j - 7 * Math.floor(j / 7);
  var l = i - j;
  var m = 3 + Math.floor((l + 40) / 44);
  var d = l + 28 - 31 * Math.floor(m / 4);
  return [m - 1, d];
}
function victoriaDay(y) {
  const start = new Date(y, 4, 24).getDay() || 7;
  return [4, 24 - start + 1];
}
function flexDay(y, m, w, d = 1) {
  const def = d - new Date(y, m, 1).getDay(),
    date = 1 + def + 7 * (def < 0 ? w : w - 1);
  return [m, date];
}
function fixedDay(y, m, d) {
  const ref = new Date(y, m, d).getDay();
  let shift = 0;
  if (ref == 0) shift = 1;
  if (ref == 6) shift = 2;
  return [m, d + shift];
}
//function yearFirstWeekStart

//using https://github.com/kodie/moment-holiday/tree/master/locale
/* regions :
      AB : Alberta
      BC : British Columbia
      MB : Manitoba
      NB : New Brunswick
      NL : Newfoundland and Labrador
      NS : Nova Scotia
      NT : Northwest Territories
      NU : Nunavut
      ON : Ontario
      PE : Prince Edward Island
      QC : Quebec
      SK : Saskatchewan
*/
const canada = {
    "New Year's Day": {
      date: (y) => fixedDay(y, 0, 1),
    },
    'Family Day': {
      date: (y) => flexDay(y, 1, 3, 1),
      regions: ['ab', 'bc', 'on', 'sk'],
    },
    'Good Friday': {
      date: easter,
      //      regions_n: ['qc'],
    },
    // 'Easter Sunday': {
    //   date: 'easter',
    // },
    'Victoria Day': {
      date: victoriaDay, //'5/(1,[-24])',
      regions: ['ab', 'bc', 'mb', 'nt', 'nu', 'on', 'pe', 'qc', 'sk'],
    },
    'Canada Day': {
      date: (y) => fixedDay(y, 6, 1),
    },
    'Civic Day': {
      date: (y) => flexDay(y, 7, 1, 1), //'8/(1,1)',
      regions: ['ab', 'bc', 'nb', 'nu', 'on', 'sk'],
    },
    'Labour Day': {
      date: (y) => flexDay(y, 8, 1, 1), //'9/(1,1)',
    },
    'Thanksgiving Day': {
      date: (y) => flexDay(y, 9, 2, 1), //'11/(1,2)',
      regions_n: [
        'ab',
        'bc',
        'mb',
        'nt',
        'nu',
        'on',
        'pe',
        'qc',
        'sk',
      ],
    },
    'Remembrance Day': {
      date: (y) => fixedDay(y, 10, 11), //'11/11',
      regions_n: ['ab', 'bc', 'nb', 'nl', 'nt', 'nu', 'pe', 'sk'],
    },
    'Christmas Day': {
      date: (y) => fixedDay(y, 11, 25), //'12/25',
    },
    'Boxing Day': {
      date: (y) => fixedDay(y, 11, 26), //'12/26',
      regions: ['on'],
    },
  },
  usa = {
    "New Year's Day": {
      date: '1/1',
      keywords_n: ['eve'],
    },
    'Martin Luther King Jr. Day': {
      date: '1/(1,3)',
      keywords: ['mlk'],
    },
    "President's Day": {
      date: '2/(1,3)',
      keywords: ['george', 'president', 'day'],
    },
    'Good Friday': {
      date: 'easter-2',
      keywords_y: ['good', 'friday'],
    },
    'Memorial Day': {
      date: '5/(1,-1)',
    },
    'Independence Day': {
      date: '7/4',
      keywords: ['4th', 'fourth', 'july'],
    },
    'Labor Day': {
      date: '9/(1,1)',
      keywords: ['labour'],
    },
    'Columbus Day': {
      date: '10/(1,2)',
      keywords: ['christopher'],
    },
    "Veteran's Day": {
      date: '11/11',
      keywords: ['vet'],
    },
    'Thanksgiving Day': {
      date: '11/(4,4)',
      keywords: ['thanks', 'turkey'],
      keywords_n: ['after'],
    },
    'Day after Thanksgiving': {
      date: '11/(5,4)',
      keywords: ['thanks', 'turkey'],
      keywords_y: ['after'],
    },
    'Christmas Day': {
      date: '12/25',
      keywords: ['christ', 'x-?mas'],
      keywords_n: ['eve'],
    },
  };

const saturday = { name: 'Sat', ind: 6 },
  sunday = { name: 'Sun', ind: 0 },
  map = { 'en-us': usa, 'en-ca': canada };

export default class HolidayTracker {
  constructor(y, locale = 'en-CA', region = 'ab') {
    const spec = map[locale] || map['en-ca'],
      pairs = Object.entries(spec);
    const conf = pairs.filter(
      ([, v]) => !v.regions || v.regions.includes(region)
    );
    this.year = y;
    this.conf = conf.map(([k, v]) => {
      const date = v.date(y),
        [m, d] = date;
      return { name: k, date, fDate: `${m + 1}/${d}` };
    });
  }
  isHoliday(m, d) {
    return this.conf.find(
      ({ date }) => date[0] === m && date[1] === d
    );
  }
  isWeekend(d) {
    const ind = d % 7;
    return ind === 6 ? saturday : !ind && sunday;
  }
  isDayOff(day, m, d) {
    return this.isWeekend(day) || this.isHoliday(m, d);
  }
}
