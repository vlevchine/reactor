import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers'; //classNames
import { renderItem } from '../helpers';
import OptionsPanel from './optionsPanel';
import { Checkbox, TagGroup, Popover, Decorator } from '..';

const { safeApply, isListEqual, safeAdd, safeRemove } = _;

//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}
const MultiSelect = (props) => {
  const {
      dataid,
      value,
      display = 'label',
      minimal,
      disabled,
      clear,
      options = [],
      onChange,
      icon,
      iconOnly,
      style,
      // filterBy,
      limitOptions = 25,
      search,
    } = props,
    renderIt = renderItem(display),
    [checked, setChecked] = useState(value ? [...value] : []),
    render = (v) => safeApply(renderIt, v),
    onTag = (v) => {
      if (v) {
        onChange(v, dataid, 'remove');
      } else onChange(undefined, dataid);
    },
    handleChange = () => {
      if (isListEqual(checked, value)) return;
      onChange(checked, dataid);
    },
    onOption = (v, id) => {
      if (id) {
        const op = v ? safeAdd : safeRemove;
        setChecked(op(checked, id));
      }
    };
  useEffect(() => {
    setChecked(value ? [...value] : []);
  }, [value]);

  return (
    <Popover
      id={dataid}
      onClose={handleChange}
      minimal={minimal}
      info="caret-down"
      infoClasses="select"
      target={
        <Decorator
          icon={icon}
          info={iconOnly ? undefined : 'chevron-down'}
          className="input-wrapper"
          style={style}
          hasValue={value?.length > 0}
          minimal={minimal}>
          {iconOnly ? undefined : (
            <TagGroup
              dataid={dataid}
              value={value}
              options={options}
              display={display}
              editable
              onChange={onTag}
              clear={clear}
              disabled={disabled}
            />
          )}
        </Decorator>
      }
      content={
        <OptionsPanel
          render={(e) => (
            <Checkbox
              dataid={e.id}
              value={checked?.includes(e.id)}
              text={render(e)}
              onChange={onOption}
            />
          )}
          options={options}
          search={search}
          delBtnOn
          //filterBy={filterBy}
          limitOptions={limitOptions}
        />
      }
    />
  );
};

MultiSelect.propTypes = {
  value: PropTypes.array,
  dataid: PropTypes.string,
  disabled: PropTypes.bool,
  minimal: PropTypes.bool,
  icon: PropTypes.string,
  clear: PropTypes.bool,
  iconOnly: PropTypes.bool,
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
