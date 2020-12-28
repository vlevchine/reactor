const { nanoid } = require('nanoid'),
  { users, roles, lookups } = require('./seedData'),
  { writeFile, readFile } = require('../utils');

const copyLookups = (to) => {
    const txt = JSON.stringify(lookups, null, '\t');
    return writeFile(txt, to, 'lookups', '_common.json');
  },
  demo_copyUsers = async (...to) => {
    const usr = users.map((e) => ({
      username: e.username,
      name: `${e.firstName} ${e.lastName}`,
      roles: e.roles,
    }));
    return writeFile(
      JSON.stringify({ users: usr, roles }, null, '\t'),
      ...to,
      '_users.json'
    );
  },
  load_wells = async (path, file) => {
    const txt = await readFile(path, file),
      lines = txt
        .split(/\r?\n/)
        .slice(1)
        .filter((l) => !!l),
      extractDate = (d) =>
        d && !d.includes('#')
          ? d.slice(0, d.length - 5).replace(/\s+/g, '')
          : undefined,
      trimmed = (d) =>
        d
          ? d.trim().replace('  ', ' ').replace('- ', '-')
          : undefined;
    let wells = lines
      .map((l) => {
        var line = l.split(','),
          lon = parseFloat(line[10]),
          lat = parseFloat(line[6]); //.map((s) => s.replace(/\s+/g, ''));
        if (!lat || !lon) return;
        var val = {
          id: nanoid(10),
          drillContractor: trimmed(line[1]),
          drillOper: trimmed(line[2]),
          field: trimmed(line[3]),
          elev: parseFloat(line[4]),
          lahee: trimmed(line[5])
            ? trimmed(line[5]).replace('- -', '-')
            : undefined,
          location: {
            type: 'Point',
            coordinates: [lon, lat],
          },
          licenseDate: extractDate(line[7]),
          license: trimmed(line[8]),
          licensee: trimmed(line[9]),
          owned: line[11].includes('CROWN') ? 'CROWN' : 'FREEHOLD',
          depth: parseFloat(line[12]),
          psacArea: trimmed(line[13]),
          range: parseInt(line[15]) || undefined,
          rig: trimmed(line[16]),
          rigRelease: extractDate(line[17]),
          spudDate: extractDate(line[18]),
          substance: trimmed(line[19]),
          gridLocation: trimmed(line[20]),
          zone: trimmed(line[21]),
          uwi: line[22],
          name: trimmed(line[23]),
          purpose: trimmed(line[24]),
          type: trimmed(line[25]),
        };
        val.createdAt = new Date(
          new Date(val.spudDate).valueOf() +
            Math.floor(Math.random() * 10000000)
        );
        val.updatedAt = val.createdAt;
        return val;
      })
      .filter((e) => !!e);
    const nameMap = {
      drillContractor: 'drillingCompany',
      drillOper: 'drillingOper',
      lahee: 'lahee',
      psacArea: 'psacArea',
      licensee: 'wellOperator',
      field: 'wellField',
      purpose: 'wellPurpose',
      type: 'wellType',
      substance: 'wellSubstance',
      owned: 'wellOwnerType',
      zone: 'wellZone',
    };

    var lookupKeys = Object.keys(nameMap),
      lookups = lookupKeys.reduce(
        (acc, l) => ({
          ...acc,
          [nameMap[l]]: [...new Set(wells.map((e) => e[l]))]
            .filter((e) => !!e)
            .map((e, i) => ({ id: String(i + 1), name: e })),
        }),
        {}
      );
    lookupKeys.forEach((l) => {
      var vals = lookups[nameMap[l]];
      wells.forEach((w) => {
        var prop = w[l],
          val = vals.find((v) => v.name == prop);
        if (val) w[l] = val.id;
      });
      lookups[nameMap[l]] = vals
        .map((e) => [e.id, e.name].join(':'))
        .join(',');
    });
    await writeFile(
      JSON.stringify(lookups, null, '\t'),
      path,
      'lookups',
      'well_lookups.json'
    );

    return wells;
  };

module.exports = { demo_copyUsers, copyLookups, load_wells };
