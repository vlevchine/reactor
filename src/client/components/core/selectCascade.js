import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers'; //classNames
import { Decorated } from '../index';
import classes from './styles.css';

const getVal = (v) =>
  v
    ? v
        .split('.')
        .reduce(
          (acc, e, i) => [
            ...acc,
            acc[i - 1] ? `${acc[i - 1]}.${e}` : e,
          ],
          []
        )
    : [];
//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}
const Cascade = (props) => {
  const {
      dataid,
      value,
      display = 'label',
      icon,
      filterBy,
      limitOptions = 25,
      search,
      minimal,
      horizontal,
      clear,
      options = {},
      onChange,
      style,
      itemStyle,
      labels,
    } = props,
    val = getVal(value),
    handleChange = (v, ind) => {
      if (value !== v) {
        onChange(v, dataid);
      }
    };
  let spec = options;
  return (
    <div
      style={itemStyle}
      className={classNames([classes.cascade], {
        [classes.flexRow]: horizontal,
        [classes.flexColumn]: !horizontal,
      })}>
      {labels.map((l, i) => {
        const ind = `${i}_${options.id}`;
        if (i) spec = spec?.items?.find((t) => t.id === val[i - 1]);
        return (
          <Decorated.Select
            key={ind}
            dataid={ind}
            value={val[i]}
            options={spec?.items}
            label={l}
            display={display}
            style={style}
            minimal={minimal}
            tight
            icon={icon}
            clear={clear}
            search={search}
            filterBy={filterBy}
            onChange={handleChange}
          />
        );
      })}
    </div>
  );
};

Cascade.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
  ]),
  dataid: PropTypes.string,
  icon: PropTypes.string,
  clear: PropTypes.bool,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  labels: PropTypes.array,
  horizontal: PropTypes.bool,
  filterBy: PropTypes.string,
  itemStyle: PropTypes.object,
  style: PropTypes.object,
  className: PropTypes.string,
  search: PropTypes.bool,
  limitOptions: PropTypes.number,
  minimal: PropTypes.bool,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onChange: PropTypes.func,
};

export default Cascade;
