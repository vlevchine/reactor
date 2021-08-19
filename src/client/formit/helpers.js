export const containerStyle = (layout = {}) => {
    const { rows = 1, cols = 1 } = layout;
    return { ['--rows']: rows, ['--columns']: cols };
  },
  styleItem = (loc = {}) => {
    const { row = 1, rowSpan = 1, col = 1, colSpan = 1 } = loc;
    return {
      ['--loc']: `${row} / ${col} / ${row + rowSpan} / ${
        col + colSpan
      }`,
    };
  };
