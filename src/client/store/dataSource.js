// import _, { toPairs } from 'lodash';
// import date from 'date-fns';
// import request from './request';
// import { timer } from 'rxjs';
// import {Timer} from '@app/helpers';

// class DataSource {
//   constructor({ name, dataViews = {} }) {
//     this.key = name;
//     this.data = {};
//     this.views = {};
//     this.subscription = {};
//     this.dataViews = Object.keys(dataViews).reduce((acc, e) => {
//       const code = `var result; ${dataViews[e]}; return result;`;
//       return {
//         ...acc,
//         [e]: new Function('_', 'm', 'dt', code).bind(null, _, date),
//       };
//     }, {});
//   }

//   subscribe(id, cb, key) {
//     this.subscription[id] = { key, cb };
//   }
//   unsubscribe(id) {
//     delete this.subscription[id];
//   }

//   async fetch(filters, query) {
//     this.data = await request.get(this.name);
//     this.prefix = `Time: ${date.format(new Date(), 'MMM d, yyyy')}; Source: ${
//       this.key
//     }; filters: ${toPairs(filters)}, query: ${toPairs(query)}`;
//   }

//   startFetching(filters, query, interval) {
//     const source$ = interval ? timer(0, interval * 1000) : timer(0);
//     this.timer = source$.subscribe(async () => {
//       const consumers = Object.values(this.subscription);

//       try {
//         consumers.forEach((e) => {
//           e.cb({ loading: true });
//         });
//         this.data = await request.get(this.key, filters, query);

//         consumers.forEach((e) => {
//           e.cb({ loading: false, data: this.data });
//         });
//       } catch (err) {
//         consumers.forEach((e) => {
//           e.cb({ loading: false, error: err });
//         });
//       }
//     });
//   }

//   cancel() {
//     if (this.timer) {
//       this.timer.unsubscribe();
//       this.timer = null;
//     }
//   }

//   sort() {}

//   getView(key) {
//     const fn = this.dataViews[key],
//       res = fn ? fn(this.data) : this.data[key] || this.data;
//     return res;
//   }
//   dataView(key) {
//     var res = this.views[key] || this.data[key]; // || this.data;
//     return this.prefix ? { prefix: this.prefix, items: [res || res.a] } : {};
//   }
// }

// export default DataSource;
