import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers'; //, classNames
import { useCommand } from '../helpers';
import OptionsPanel from './optionsPanel';
import { Popover, Decorator, ClearButton, Readonly } from '..';
import './styles.css';

const renderBy = (display) => {
  if (_.isFunction(display)) return (v) => (v ? display(v) : '');
  return display?.includes('=>')
    ? eval(display)
    : (v) => v?.[display] || v;
};
//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}

export default function Select(props) {
  const {
      dataid,
      value,
      display = 'label',
      minimal,
      //     filterBy,
      limitOptions = 25,
      prepend,
      search,
      clear,
      disabled,
      readonly,
      defaultValue,
      options,
      allowedOptions,
      onChange,
      style,
      intent,
      className,
      placeholder,
      ...rest
    } = props,
    _v = value || defaultValue,
    wrapped = options?.[0]?.id,
    opts = allowedOptions || options || [],
    val = wrapped ? options?.find((o) => o.id === _v) : _v,
    [cmdClose, setClose] = useCommand(),
    render = renderBy(display),
    handleChange = (v) => {
      setClose();
      const old = wrapped ? val?.id : val;
      if (v !== old) {
        onChange?.(v, dataid);
      }
    },
    text = render(val),
    hasValue = !!val;

  return readonly ? (
    <Readonly txt={text} style={style} />
  ) : (
    <Popover
      {...rest}
      id={dataid}
      cmdClose={cmdClose}
      minimal={minimal}
      prepend={prepend}
      disabled={disabled}
      className={classNames([className])}
      style={style}
      append="caret-down"
      target={
        <Decorator
          prepend={prepend}
          append="chevron-down"
          appendType="clip"
          hasValue={hasValue}
          onChange={handleChange}
          intent={intent}
          minimal={minimal}>
          <span
            className={classNames(
              ['dropdown-text select-title text-dots'],
              { placeholder: !text && placeholder }
            )}>
            {text || placeholder || ''}
          </span>
          {clear && !disabled && (
            <ClearButton
              clear={clear}
              id={dataid}
              disabled={!hasValue}
              onChange={onChange}
            />
          )}
        </Decorator>
      }
      content={
        <OptionsPanel
          render={render}
          options={opts}
          search={search}
          delBtnOn
          //filterBy={filterBy}
          limitOptions={limitOptions}
          onChange={handleChange}
        />
      }
    />
  );
}

Select.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.string,
  dataid: PropTypes.string,
  prepend: PropTypes.string,
  clear: PropTypes.bool,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  intent: PropTypes.string,
  allowedOptions: PropTypes.array,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  filterBy: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  search: PropTypes.bool,
  limitOptions: PropTypes.number,
  minimal: PropTypes.bool,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

Count.propTypes = {
  dataid: PropTypes.string,
  id: PropTypes.string,
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func,
};
export function Count({ min, max, ...rest }) {
  return (
    <Select
      {...rest}
      className="count"
      options={_.arrayOfInt(min, max)}
    />
  );
}
