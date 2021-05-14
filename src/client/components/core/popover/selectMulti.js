import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers'; //classNames
import { renderItem } from '../helpers';
import OptionsPanel from './optionsPanel';
import {
  Info,
  Checkbox,
  ClearButton,
  TagGroup,
  Popover,
  Decorator,
} from '..';

const { safeApply, isListEqual, safeAdd, safeRemove } = _,
  asValues = (value) => (value ? [...value] : []);

//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}
const MultiSelect = (props) => {
  const {
      dataid,
      value,
      display = 'label',
      minimal,
      disabled,
      options = [],
      onChange,
      prepend,
      iconOnly,
      style,
      clear,
      className,
      intent = 'muted',
      limitOptions = 25,
      search,
      initials,
    } = props,
    renderIt = renderItem(display),
    vals = asValues(value),
    [checked, setChecked] = useState(vals),
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
    },
    hasValue = checked.length > 0;
  useEffect(() => {
    setChecked(asValues(value));
  }, [value]);

  return (
    <Popover
      id={dataid}
      onClose={handleChange}
      minimal={minimal}
      disabled={disabled}
      append="caret-down"
      className={classNames([className], { prepend })}
      style={style}
      target={
        iconOnly ? (
          <Info name={prepend} text="Show columns" />
        ) : (
          <Decorator
            prepend={prepend}
            append={iconOnly ? undefined : 'chevron-down'}
            appendType="clip"
            style={style}
            minimal={minimal}
            className={className}
            hasValue={hasValue}>
            <TagGroup
              dataid={dataid}
              value={vals}
              options={options}
              display={display}
              clear={clear}
              disabled={disabled}
              tagIntent={intent}
              initials={initials}
              onChange={onChange}
            />
            <ClearButton
              clear={clear}
              id={dataid}
              disabled={disabled || !hasValue}
              onChange={onChange}
            />
          </Decorator>
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
  prepend: PropTypes.string,
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
