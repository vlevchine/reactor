import PropTypes from 'prop-types';
import { classNames } from '@app/helpers'; //classNames
import Select from './select';
import './styles.css';

const getVal = (v) =>
  v
    ? v
        .split('.')
        .reduce(
          (acc, e, i) => [
            ...acc,
            acc[i - 1] ? `${acc[i - 1]}.${e}` : e,
          ],
          []
        )
    : [];

Cascade.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
  ]),
  dataid: PropTypes.string,
  icon: PropTypes.string,
  clear: PropTypes.bool,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  labels: PropTypes.array,
  horizontal: PropTypes.bool,
  filterBy: PropTypes.string,
  itemStyle: PropTypes.object,
  style: PropTypes.object,
  className: PropTypes.string,
  search: PropTypes.bool,
  limitOptions: PropTypes.number,
  minimal: PropTypes.bool,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onChange: PropTypes.func,
};
//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}
export default function Cascade(props) {
  const {
      dataid,
      value,
      display = 'label',
      icon,
      filterBy,
      search,
      minimal,
      horizontal,
      clear,
      options = {},
      onChange,
      style,
      itemStyle,
      labels,
    } = props,
    val = getVal(value),
    handleChange = (v, id) => {
      console.log(v, id);
      if (v === undefined) {
        onChange(val.slice(0, id).join('.') || undefined, dataid);
      } else if (value !== v) {
        onChange(v, dataid);
      }
    };
  let spec = { value: options };

  return (
    <div
      style={itemStyle}
      className={classNames([
        'cascade',
        `flex-${horizontal ? 'row' : 'column'}`,
      ])}>
      {labels.map((l, i) => {
        if (i) spec = spec?.value?.find((t) => t.id === val[i - 1]);

        return (
          <span key={i}>
            <label className="form-label">{l}</label>
            <Select
              key={i}
              dataid={i.toString()}
              value={val[i]}
              options={spec?.value}
              label={l}
              display={display}
              style={style}
              minimal={minimal}
              tight
              icon={icon}
              clear={clear}
              search={search}
              filterBy={filterBy}
              onChange={handleChange}
            />
          </span>
        );
      })}
    </div>
  );
}
