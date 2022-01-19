import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers'; //classNames
import { renderItem, dropdownCloseRequest } from '../helpers';
import OptionsPanel from './optionsPanel';
import {
  Readonly,
  Checkbox,
  ClearButton,
  TagGroup,
  Popover,
  TagInput,
  Decorator,
} from '..';
import { useChangeReporter } from '../helpers';
import { Menu } from '../menu/menu';

const { safeApply, isListEqual, safeAdd, safeRemove } = _,
  asValues = (value) => (value ? [...value] : []);

//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}
export const MultiSelect0 = (props) => {
  const {
      dataid,
      value,
      display = 'label',
      minimal,
      disabled,
      readonly,
      options,
      onChange,
      prepend,
      iconOnly,
      tooltip,
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

  return readonly ? (
    <Readonly txt={vals.length ? vals.join(', ') : undefined} />
  ) : (
    <Popover
      id={dataid}
      onClose={handleChange}
      minimal={minimal}
      disabled={disabled}
      tooltip={tooltip}
      append="caret-down"
      className={classNames([className, 'multi'], { prepend })}
      style={style}
      target={
        <Decorator
          prepend={prepend}
          append={iconOnly ? undefined : 'chevron-down'}
          appendType="clip"
          style={style}
          minimal={minimal}
          className={className}
          hasValue={hasValue}>
          {iconOnly ? null : (
            <>
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
            </>
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
          limitOptions={limitOptions}
        />
      }
    />
  );
};

MultiSelect0.propTypes = {
  value: PropTypes.array,
  dataid: PropTypes.string,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  minimal: PropTypes.bool,
  prepend: PropTypes.string,
  clear: PropTypes.bool,
  iconOnly: PropTypes.bool,
  tooltip: PropTypes.string,
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

MultiSelect.propTypes = {
  id: PropTypes.string,
  value: PropTypes.array,
  options: PropTypes.array,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  clear: PropTypes.bool,
};
const animOptions = { duration: 200 };
export default function MultiSelect(props) {
  const { id, value, options, disabled, clear } = props,
    [_value, changed] = useChangeReporter(value || [], props),
    // clicked = (ev) => {
    //   ev.target?.classList.toggle('option-check');
    // },
    onClose = (target) => {
      const checked = [
        ...target.querySelectorAll('.option-check'),
      ].map((e) => e.id);
      changed(checked);
    },
    onDropdownClose = ({ target }) => {
      onClose(target);
    },
    onClick = ({ target }, dt) => {
      if (!dt.onDropdown) {
        onClose(dt.el);
        dropdownCloseRequest(id);
      } else target?.classList.toggle('option-check');
    },
    changing = (v) => {
      const _vals = v && v.map((e) => e.id),
        n_val = _vals?.length ? _vals : undefined;
      changed(n_val);
    },
    val = _.filter(options, (e) => _value?.includes(e.id));

  return (
    <TagInput
      {...props}
      value={val}
      noAdding
      onChange={changing}
      append="chevron-down"
      dropdown={
        !disabled && {
          component: (
            <Menu
              items={options}
              withLabel
              itemClass={(o) =>
                _value?.includes(o.id) ? 'option-check' : undefined
              }
              display="name"
            />
          ),
          animate: animOptions,
          onClick,
          onDropdownClose,
        }
      }
      clear={clear && val?.length > 0}
      uncontrolled={false}
    />
  );
}
