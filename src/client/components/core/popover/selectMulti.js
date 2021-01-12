import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers'; //classNames
import { renderItem, Decorator, OptionsPanel } from '../helpers';
import { Checkbox, TagGroup, Popover } from '..';

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
      //  style,
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
          info={'chevron-down'}
          className="input-wrapper"
          hasValue={value?.length > 0}
          minimal={minimal}>
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
    // <Popover
    //   ref={pop}
    //   id={dataid}
    //   minimal={minimal}
    //   toggleIcon
    //   light
    //   fill={fill}
    //   place="bottom"
    //   icon={icon}
    //   style={style}
    //   onClose={handleChange}
    //   header={header}>
    //   <OptionsPanel
    //     options={options}
    //     render={(e) => (
    //       <Checkbox
    //         dataid={e.id}
    //         value={checked?.includes(e.id)}
    //         text={render(e)}
    //         onChange={onOption}
    //       />
    //     )}
    //     optionClass="option-checkbox"
    //     className="light"
    //     minimal={minimal}
    //     filterBy={filterBy}
    //     limitOptions={limitOptions}
    //     search={search}
    //   />
    // </Popover>
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
