import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers'; //, classNames
import { useCommand } from '../helpers';
import OptionsPanel from './optionsPanel';
import { Popover, Decorator, ClearButton } from '..';
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
      defaultValue,
      options,
      onChange,
      style,
      intent,
      className,
      ...rest
    } = props,
    _v = value || defaultValue,
    opts = options || [],
    wrapped = opts[0]?.id,
    val = wrapped ? opts.find((o) => o.id === _v) : _v,
    [cmdClose, setClose] = useCommand(),
    render = renderBy(display),
    handleChange = (v) => {
      setClose();
      const old = wrapped ? val?.id : val;
      if (v !== old) {
        onChange?.(v, dataid);
      }
    },
    text = render(val) || '',
    hasValue = !!val;

  return (
    <Popover
      {...rest}
      id={dataid}
      cmdClose={cmdClose}
      minimal={minimal}
      disabled={disabled}
      prepend={prepend}
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
          <span className="dropdown-text select-title text-dots">
            {text}
          </span>
          <ClearButton
            clear={clear}
            id={dataid}
            disabled={disabled || !hasValue}
            onChange={onChange}
          />
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
  intent: PropTypes.string,
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
