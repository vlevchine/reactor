import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers'; //, classNames
import { useCommand } from '../helpers';
import OptionsPanel from './optionsPanel';
import { Popover, Decorator, ClearButton } from '..';
import './styles.css';

const renderBy = (display = 'label') => {
  if (_.isFunction(display)) return (v) => (v ? display(v) : '');
  return display.includes('=>') ? eval(display) : (v) => v?.[display];
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
      options = [],
      onChange,
      style,
      intent,
      className,
      ...rest
    } = props,
    val = options.find((o) => o.id === value),
    [cmdClose, setClose] = useCommand(),
    render = renderBy(display),
    handleChange = (v) => {
      setClose();
      if (v !== val?.id) {
        onChange?.(v, dataid);
      }
    },
    text = render(val) || '';

  return (
    <Popover
      {...rest}
      id={dataid}
      cmdClose={cmdClose}
      minimal={minimal}
      disabled={disabled}
      className={classNames([className], {
        ['has-value']: !!val,
      })}
      append="caret-down"
      target={
        <Decorator
          prepend={prepend}
          append="chevron-down"
          appendType="clip"
          hasValue={!!val}
          onChange={handleChange}
          style={style}
          intent={intent}
          minimal={minimal}>
          <span className="dropdown-text select-title text-dots">
            {text}
          </span>
          <ClearButton
            clear={clear && !disabled}
            id={dataid}
            onChange={onChange}
          />
        </Decorator>
      }
      content={
        <OptionsPanel
          render={render}
          options={options}
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
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
  ]),
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
