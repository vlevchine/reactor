import faker from 'faker';
import moment from 'moment';
import { toPairs, fromPairs, range, random, sum } from 'lodash';
import config from '@app/config/factoryConfig';

var completeSet = (names, level) => {
  //output [{name, val}]
  var vals = [...names, 'def'].map(() => random(0.01, 0.99)),
    total = sum(vals);
  return fromPairs(
    names.map((n, i) => [n, (vals[i] * level) / total])
  );
};
var e10StateCodes = ['1000', '2000', '3000', '4000', '5000', '6000'],
  timeCodes = ['ru', 'wa', 'bl', 'int', 'flt', 'oth'];
var dataFor = (key, { line }) => {
  //, station
  var ln = config.lines.find((l) => l.key === line) || { items: [] },
    stations = ln.items.map((e) => e.name),
    res;

  if (key === 'ds2') {
    res = ln.items.map((s) => ({
      name: s.name,
      max: faker.random.number({ min: 140, max: 900 }),
      min: faker.random.number({ min: 20, max: 50 }),
      avg: faker.random.number({ min: 80, max: 120 }),
      panels: faker.random.number({ min: 800, max: 900 }),
      placed: faker.random.number({ min: 2000, max: 90000 }),
      pickErr: faker.random.number({ min: 20, max: 900 }),
      ident: faker.random.number({ min: 200, max: 190 }),
      coplan: faker.random.number({ min: 200, max: 900 }),
      procErr: faker.random.number({ min: 200, max: 900 }),
    }));
  } else if (key === 'ds3') {
    res = {
      tracks: range(22).map((i) => ({
        name:
          stations[i % stations.length] +
          ' - Tr ' +
          faker.finance.account(),
        val: random(0.01, 0.12),
      })),
      comp: range(22).map(() => ({
        name: faker.lorem.word(),
        val: random(0.01, 0.12),
      })),
      forms: range(22).map(() => ({
        name: faker.lorem.word(),
        val: random(0.01, 0.12),
      })),
    };
  } else if (key === 'ds4') {
    var total = 120000,
      names = [...stations, 'line'];
    res = {
      total,
      e10States: names.map((name) => {
        return { name, ...completeSet(e10StateCodes, total) };
      }),
      timeShares: names.map((name) => {
        return { name, ...completeSet(timeCodes, total) };
      }),
    };
  } else if (key === 'ds5') {
    var totalTime = 78000;
    res = {
      totalTime,
      data: ['line', ...stations].map((s) => ({
        name: s,
        utilization: random(0.3, 0.8),
        availability: random(0.5, 0.9),
        availabilityTgt: random(0.7, 0.9),
        performance: random(0.54, 0.85),
        performanceTgt: random(0.7, 0.85),
        quality: random(0.5, 0.92),
        qualityTgt: random(0.7, 0.9),
        oee: random(0.67, 0.82),
        oeeTgt: random(0.7, 0.8),
        pcb: random(500, 800),
        comp: random(200000, 300000),
        placed: random(200000, 300000),
        wasted: random(200, 500),
        mtba: random(5000, 12000),
        mttr: random(5000, 12000),
        faults: random(20, 30),
        timeShares: completeSet(timeCodes, 78000),
      })),
    };
  } else if (key === 'ds6') {
    var start = 12,
      opts = ['line', ...ln.items.map((e) => e.key)];
    res = range(600).map((e, i) => ({
      date: new Date(2019, 6, start + i),
      avl: opts.reduce(
        (acc, o) => ({ ...acc, [o]: random(0.5, 0.9) }),
        {}
      ),
      perf: opts.reduce(
        (acc, o) => ({ ...acc, [o]: random(0.54, 0.85) }),
        {}
      ),
      qlt: opts.reduce(
        (acc, o) => ({ ...acc, [o]: random(0.5, 0.92) }),
        {}
      ),
      oee: opts.reduce(
        (acc, o) => ({ ...acc, [o]: random(0.67, 0.82) }),
        {}
      ),
    }));
  }

  return res;
};

const request = {
  get: async (key, filters, query) => {
    //args: dataoutput key = '', query = {line, station}, filters = {time, from, to, ...}
    var prefix = `Time: ${moment().format(
        'LTS'
      )}; Source: ${key}; filters: ${toPairs(
        filters
      )}, query: ${toPairs(query)}`,
      test = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].reduce(
        (acc, e) => {
          acc[e] = { prefix, text: faker.lorem.paragraph() };
          return acc;
        },
        {}
      );
    var dt = dataFor(key, query) || test;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dt);
      }, 100);
    });
  },
};

export default request;
