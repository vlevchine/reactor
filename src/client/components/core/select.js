import { useRef } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers'; //classNames
import { OptionsPanel, renderItem } from './helpers';
import { Popover } from '../index';
import classes from './styles.css';

const { defaultTo, safeApply } = _;
const findVal = (options, v) => options.find((o) => o.id === v);
//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}
const Select = (props) => {
  const {
      dataid,
      value,
      display = 'label',
      filterBy,
      limitOptions = 25,
      search,
      minimal,
      fill,
      clear,
      options = [],
      onChange,
      ...rest
    } = props,
    pop = useRef(),
    val = findVal(options, value),
    renderIt = renderItem(display),
    render = (v) => <span>{safeApply(renderIt, v)}</span>,
    handleChange = (v) => {
      pop.current.hide();
      if (v !== val?.id) {
        onChange(v, dataid);
      }
    },
    clearUp = defaultTo(handleChange, clear && val);

  return (
    <Popover
      {...rest}
      ref={pop}
      id={dataid}
      minimal={minimal}
      toggleIcon
      light
      fill={fill}
      place="bottom"
      clear={clearUp}
      header={render(val)}>
      <OptionsPanel
        options={options}
        render={render}
        onChange={handleChange}
        minimal={minimal}
        search={search}
        filterBy={filterBy}
        limitOptions={limitOptions}
        optionClass={classes.iconOption}
        className={classes.light}
      />
    </Popover>
  );
};

Select.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
  ]),
  dataid: PropTypes.string,
  icon: PropTypes.string,
  clear: PropTypes.bool,
  fill: PropTypes.bool,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  filterBy: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  search: PropTypes.bool,
  limitOptions: PropTypes.number,
  minimal: PropTypes.bool,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onChange: PropTypes.func,
};

export default Select;
