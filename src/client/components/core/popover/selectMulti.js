import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers'; //classNames
import { renderItem } from '../helpers';
import OptionsPanel from './optionsPanel';
import { Info, Checkbox, TagGroup, Popover } from '..';

const { safeApply, isListEqual, safeAdd, safeRemove } = _;

//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}
const MultiSelect = (props) => {
  const {
      dataid,
      value,
      display = 'label',
      minimal,
      options = [],
      onChange,
      icon,
      iconOnly,
      style,
      clear,
      className,
      intent,
      limitOptions = 25,
      search,
      initials,
    } = props,
    renderIt = renderItem(display),
    [checked, setChecked] = useState(value ? [...value] : []),
    render = (v) => safeApply(renderIt, v),
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
      className={classNames([className], {
        ['has-value']: value?.length > 0,
      })}
      style={style}
      target={
        iconOnly ? (
          <Info name={icon} text="Show columns" />
        ) : (
          <TagGroup
            dataid={dataid}
            value={value}
            options={options}
            display={display}
            icon={icon}
            clear={clear}
            info={iconOnly ? undefined : 'chevron-down'}
            minimal={minimal}
            intent={intent}
            editable
            initials={initials}
            onChange={onChange}
          />
        )
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
  intent: PropTypes.string,
  className: PropTypes.string,
  limitOptions: PropTypes.number,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onChange: PropTypes.func,
  initials: PropTypes.bool,
};

export default MultiSelect;
