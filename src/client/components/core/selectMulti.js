import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers'; //classNames
import { renderItem, OptionsPanel } from './helpers';
import { Checkbox, TagGroup, Popover } from '../index';
import classes from './styles.css';

const findOptions = (options, value = []) =>
    options.filter((e) => value.includes(e.id)),
  fromValue = (v = []) => [...v];

const { safeApply, list } = _,
  { isEqual, safeAdd, safeRemove } = list;

//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}
const MultiSelect = (props) => {
  const {
      dataid,
      value,
      display = 'label',
      minimal,
      disabled,
      clear,
      fill,
      options = [],
      onChange,
      icon,
      style,
      filterBy,
      limitOptions = 25,
      search,
    } = props,
    pop = useRef(),
    renderIt = renderItem(display),
    [checked, setChecked] = useState(fromValue(value)),
    render = (v) => safeApply(renderIt, v),
    onTag = (v) => {
      pop.current.hide();
      onChange(v, dataid, v ? 'remove' : 'edit');
    },
    onOption = (v, id) => {
      if (id) {
        const op = v ? safeAdd : safeRemove;
        setChecked(op(checked, id));
      }
    },
    handleChange = () => {
      if (isEqual(checked, value)) return;
      onChange(checked, dataid);
    },
    header = (
      <TagGroup
        dataid={dataid}
        values={findOptions(options, value)}
        display={display}
        onChange={onTag}
        clear={clear}
        disabled={disabled}
      />
    );
  useEffect(() => {
    setChecked(fromValue(value));
  }, [value]);

  return (
    <Popover
      ref={pop}
      id={dataid}
      minimal={minimal}
      toggleIcon
      light
      fill={fill}
      place="bottom"
      icon={icon}
      style={style}
      onClose={handleChange}
      header={header}>
      <OptionsPanel
        options={options}
        render={(e) => (
          <Checkbox
            dataid={e.id}
            value={checked?.includes(e.id)}
            text={render(e)}
            onChange={onOption}
          />
        )}
        optionClass={classes.optionCheckbox}
        className={classes.light}
        minimal={minimal}
        filterBy={filterBy}
        limitOptions={limitOptions}
        search={search}
      />
    </Popover>
  );
};

MultiSelect.propTypes = {
  value: PropTypes.array,
  dataid: PropTypes.string,
  disabled: PropTypes.bool,
  minimal: PropTypes.bool,
  icon: PropTypes.string,
  clear: PropTypes.bool,
  fill: PropTypes.bool,
  search: PropTypes.bool,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  filterBy: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  limitOptions: PropTypes.number,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onChange: PropTypes.func,
};

export default MultiSelect;
