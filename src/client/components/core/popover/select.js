import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers'; //, classNames
import {
  useChangeReporter,
  useCommand,
  dropdownCloseRequest,
  mergeIds,
} from '../helpers';
import OptionsPanel from './optionsPanel';
import {
  Popover,
  Decorator,
  Decorate,
  ClearButton,
  Readonly,
} from '..';
import { Menu } from '../menu/menu';

const renderBy = (display) => {
  if (_.isFunction(display)) return (v) => (v ? display(v) : '');
  return display?.includes('=>')
    ? eval(display)
    : (v) => v?.[display] || v;
};
//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}

export default function Select0(props) {
  const {
      dataid,
      value,
      display = 'label',
      minimal,
      underlined,
      small,
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
          small={small}
          underlined={underlined}
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

Select0.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.string,
  dataid: PropTypes.string,
  prepend: PropTypes.string,
  clear: PropTypes.bool,
  small: PropTypes.bool,
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
  underlined: PropTypes.bool,
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
export function Count({ min, max, onChange, ...rest }) {
  const changing = (v, id) => {
    onChange?.(Number(v), id);
  };
  return (
    <Select
      {...rest}
      className="count"
      onChange={changing}
      options={_.arrayOfInt(min, max)}
    />
  );
}

function renderIt(display) {
  return _.isFunction(display)
    ? (v) => (v ? display(v) : '')
    : display?.includes('=>')
    ? eval(display)
    : (v) => v?.[display] || v || '';
}

Select.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.array,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  clear: PropTypes.bool,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  innerStyle: PropTypes.object,
};
function targetId(target) {
  return target?.id || target?.parentElement?.id;
}
const animOptions = { duration: 200 };
export function Select(props) {
  const {
      id,
      value,
      display = 'label',
      options,
      disabled,
      clear,
      innerStyle,
    } = props,
    wrapped = options?.[0]?.id,
    [_value, reset] = useChangeReporter(value, props),
    render = useMemo(() => renderIt(display), [display]),
    onClick = ({ target }, dt) => {
      if (dt.onDropdown) reset(targetId(target));
      if (!dt.onWrapper) dropdownCloseRequest(id);
    },
    val = wrapped ? options?.find((e) => e.id === _value) : _value;

  return (
    <Decorate
      {...props}
      clear={clear && _value ? reset : undefined}
      append="angle-down"
      className="cursor-pointer"
      dropdown={
        disabled
          ? undefined
          : {
              component: (
                <Menu
                  items={options}
                  withLabel
                  display="name"
                  itemClass={(o) =>
                    _value === o.id ? 'option-check' : undefined
                  }
                />
              ),
              animate: animOptions,
              onClick,
            }
      }>
      <input
        value={render(val)}
        disabled
        className="no-border infoboard"
        style={innerStyle}
      />
    </Decorate>
  );
}

Search.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  getOptions: PropTypes.func,
  options: PropTypes.array,
  disabled: PropTypes.bool,
  limit: PropTypes.number,
  clear: PropTypes.bool,
  stringOptions: PropTypes.bool,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  innerStyle: PropTypes.object,
  noAppend: PropTypes.bool,
};
function filterOptions(items, limit = 10, str = '') {
  const fltr = str.toLowerCase(),
    res = [];
  for (let i in items) {
    if (items[i].name.toLowerCase().startsWith(fltr))
      res.push(items[i]);
    if (res.length >= limit) break;
  }
  return res;
}
//Search supports both options array (assuming it's a long one)
//and a func to retrieve options
export function Search(props) {
  const {
      id,
      value,
      display = 'label',
      getOptions,
      options,
      limit = 10,
      disabled,
      clear,
      stringOptions,
      innerStyle,
      noAppend,
    } = props,
    _options = useRef([]),
    [_value, reset] = useChangeReporter(value, props),
    [searchStr, setSearch] = useState(),
    valueStr = useMemo(
      () =>
        (stringOptions
          ? _value
          : _options.current.find((e) => e.id === _value)?.[
              display
            ]) || '',
      [_value]
    ),
    inputClicked = async (ev) => {
      if (!_.isNil(searchStr)) {
        //further clicks - prevent dropdown close while typing
        ev.stopPropagation();
        ev.preventDefault();
      } else {
        //clicked first time
        _options.current = options
          ? filterOptions(options, limit)
          : await getOptions({ id, start: '', limit });
        setSearch(valueStr);
      }
    },
    onTyping = async (ev) => {
      const start = ev.target.value;
      _options.current = options
        ? filterOptions(options, limit, start)
        : await getOptions({ id, start, limit });
      setSearch(start);
    },
    onClick = ({ target }, dt) => {
      if (dt.onDropdown) reset(target.id);
      if (!dt.onWrapper) dropdownCloseRequest(id);
      setSearch();
      _options.current = [];
    };

  useEffect(() => {
    setSearch();
  }, [_value]);

  return (
    <Decorate
      {...props}
      clear={clear && _value ? reset : undefined}
      append={noAppend ? undefined : 'search'}
      disabled={disabled}
      dropdown={{
        component: (
          <Menu
            items={_options.current}
            withLabel
            nonExpandable
            display="name"
          />
        ),
        animate: animOptions,
        onClick,
      }}>
      <input
        autoComplete="off"
        value={searchStr ?? valueStr}
        onClickCapture={inputClicked}
        onChange={onTyping}
        className="no-border" //infoboard
        style={innerStyle}
      />
    </Decorate>
  );
}

SearchCascader.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.array,
  disabled: PropTypes.bool,
  limit: PropTypes.number,
  spec: PropTypes.array,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  innerStyle: PropTypes.object,
  onChange: PropTypes.func,
};
function getOptions(options, ids) {
  return ids
    ? ids.reduce(
        (acc, e, i) => {
          acc.push(acc[i]?.find((o) => o.id === e)?.items);
          return acc;
        },
        [options]
      )
    : [options];
}
//Cascader currently only supports an array of options, not a func
export function SearchCascader({
  id,
  value,
  options,
  spec,
  display,
  limit,
  onChange,
  ...rest
}) {
  const valRef = useRef(value || ''),
    [_value, setValue] = useState(valRef.current.split('.')),
    changed = (_id, sid) => {
      let n_v = [];
      if (sid) {
        const slotId = _.last(sid.split('.')),
          ind = spec.indexOf(slotId);
        n_v = valRef.current.split('.');
        if (_id) {
          n_v[ind] = _id;
        } else {
          n_v = n_v.slice(0, ind);
          dropdownCloseRequest(sid);
        }
      }
      valRef.current = n_v.join('.');
      setValue(n_v);
      onChange?.(n_v, id);
    },
    opts = getOptions(options, _value);

  return (
    <Decorate
      {...rest}
      id={id}
      clear={false}
      className="cascade"
      append="search">
      {spec.map((e, i) => (
        <Search
          key={e}
          id={mergeIds(id, e)}
          value={_value?.[i]}
          options={opts[i]}
          display={display}
          disabled={i > 0 && !_value?.[i - 1]}
          limit={limit}
          noAppend
          clear
          onChange={changed}
        />
      ))}
    </Decorate>
  );
}
