import { _ } from '@app/helpers';

export const containerStyle = (layout = {}) => {
    const { rows = 1, cols = 1 } = layout,
      res = { ['--rows']: rows, ['--columns']: cols };
    if (_.isString(rows)) res.gridTemplateRows = rows;
    return res;
  },
  styleItem = (loc = {}) => {
    const { row = 1, rowSpan = 1, col = 1, colSpan = 1 } = loc;
    return {
      ['--loc']: `${row} / ${col} / ${row + rowSpan} / ${
        col + colSpan
      }`,
    };
  };
