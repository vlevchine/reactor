function addCostCenters() {
  return [...Array(7)].map((_, c) => ({
    name: `Cost Center #${c + 1}`,
    type: 'costCenter',
    id: c.toString(),
    _id: c.toString(),
    value: [...Array(7)].map((_, a) => ({
      name: `Account #${c + 1}${a + 1}`,
      id: `${c}.${a}`,
      _id: `${c}.${a}`,
      type: 'account',
      value: [...Array(7)].map((_, s) => ({
        name: `Sub-account #${c + 1}${a + 1}${s + 1}`,
        id: `${c}.${a}.${s}`,
        _id: `${c}.${a}.${s}`,
        type: 'subAccount',
      })),
    })),
  }));
}
const enhance = (e, i, extra) => {
    var id = String(i + 1);
    return Object.assign(e, { id, _id: id }, extra && { [extra]: i });
  },
  fromName = (name, num) =>
    [...Array(num)].map((_, i) => {
      var id = String(i + 1);
      return { name: `${name} #${id}`, id, _id: id };
    }),
  fromArray = (arr) =>
    arr.map((name, i) => {
      var id = String(i + 1);
      return { name, id, _id: id };
    }),
  costCenterDef = {
    upper: 'Cost Center',
    upperNum: 5,
    lower: 'Account',
    lowerNum: 4,
  },
  looks = {
    jobStatus: fromArray([
      'Not started',
      'In work',
      'Submitted',
      'Rejected/In work',
      'Approved',
    ]),
    muds: fromName('Mud', 5),
    films: [
      { title: 'The Shawshank Redemption', year: 1994 },
      { title: 'The Godfather', year: 1972 },
      { title: 'The Godfather: Part II', year: 1974 },
      { title: 'The Dark Knight', year: 2008 },
      { title: '12 Angry Men', year: 1957 },
      { title: "Schindler's List", year: 1993 },
    ].map((e, i) => enhance(e, i, 'rank')),
    songs: [
      { title: 'Waterloo', year: 1973 },
      { title: 'Let it be', year: 1970 },
      { title: 'Candle in the wind', year: 1975 },
    ].map((e, i) => enhance(e, i, 'rank')),
    costCenters: [...Array(costCenterDef.upperNum)].map((_, i) => {
      var id = String(i + 1);
      return {
        name: `Cost center #${id}`,
        id,
        _id: id,
        accounts: [...Array(costCenterDef.lowerNum)].map((_, j) => {
          var idd = `${id}.${j + 1}`;
          return { name: `Account #${id}`, id: idd, _id: idd };
        }),
      };
    }),
  };

looks.costCenters = addCostCenters();
const lookups = Object.keys(looks).reduce((acc, k) => {
  acc[k] = { id: k, _id: k, value: looks[k] };
  return acc;
}, {});

module.exports = { lookups };
