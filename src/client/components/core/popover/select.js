import PropTypes from 'prop-types';
import { _ } from '@app/helpers'; //, classNames
import { OptionsPanel, Decorator, useCommand } from '../helpers';
import { Popover } from '../index';
import './styles.css';

const renderBy = (display = 'label') =>
  _.isFunction(display)
    ? (v) => <span>{v ? display(v) : ''}</span>
    : (v) => <span>{v?.[display]}</span>;
//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}
const Select = (props) => {
  const {
      dataid,
      value,
      display = 'label',
      minimal,
      //     filterBy,
      limitOptions = 25,
      icon,
      search,
      clear,
      options = [],
      onChange,
      style,
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
      id={dataid}
      {...rest}
      cmdClose={cmdClose}
      minimal={minimal}
      info="caret-down"
      infoClasses="select"
      withIcon={!!icon}
      target={
        <Decorator
          icon={icon}
          clear={clear}
          info={'chevron-down'}
          hasValue={!!val}
          onChange={handleChange}
          className="input-wrapper"
          style={style}
          minimal={minimal}>
          <span className="dropdown-text select-title">{text}</span>
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
