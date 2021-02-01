import { useState } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { SearchInput } from '../index';
import './styles.css';

export const filterOptions = (filter, options, render, limit) => {
  const _v = filter?.toLowerCase(),
    opts = _v
      ? options.filter((o) => render(o)?.toLowerCase().includes(_v))
      : options;
  return limit ? opts.slice(0, limit) : opts;
};
export const useOptions = (options, render, limit) => {
  const [filter, setFilter] = useState(''),
    opts = filterOptions(filter, options, render, limit);
  return [filter, setFilter, opts];
};

OptionsPanel.propTypes = {
  render: PropTypes.func,
  onChange: PropTypes.func,
  refPanel: PropTypes.object,
  className: PropTypes.string,
  search: PropTypes.bool,
  right: PropTypes.bool,
  horizontal: PropTypes.bool,
  minimal: PropTypes.bool,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  filterBy: PropTypes.string,
  limitOptions: PropTypes.number,
  style: PropTypes.object,
  optionClass: PropTypes.string,
};

export default function OptionsPanel({
  options,
  render,
  limitOptions,
  search,
  horizontal,
  onChange,
  optionClass,
}) {
  //filter
  const [, setFilter, opts] = useOptions(
      options,
      render,
      limitOptions
    ),
    searching =
      search || (limitOptions && options.length > limitOptions),
    handleChange = (ev) => {
      ev.stopPropagation();
      const v =
        ev.target.dataset.value || ev.target.parentNode.dataset.value;
      onChange && onChange(v);
    };

  return (
    <>
      {searching && (
        <SearchInput
          name="filter"
          tabIndex={-1}
          placeholder="Filter options..."
          throttle={400}
          search
          onChange={setFilter}
        />
      )}
      <div
        role="button"
        tabIndex="0"
        className={classNames(['button-options'], {
          row: horizontal,
        })}
        onKeyUp={() => {}}
        onClick={handleChange}>
        {opts.length ? (
          opts.map((e) => (
            <span
              key={e.id}
              className={optionClass}
              data-value={e.id}>
              {render(e)}
            </span>
          ))
        ) : (
          <span className={optionClass}>No results...</span>
        )}
      </div>
    </>
  );
}
