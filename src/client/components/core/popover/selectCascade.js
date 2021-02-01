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
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  labels: PropTypes.array,
  horizontal: PropTypes.bool,
  itemStyle: PropTypes.object,
  style: PropTypes.object,
  icon: PropTypes.string,
  className: PropTypes.string,
  limitOptions: PropTypes.number,
  onChange: PropTypes.func,
};
//use: display="title" or ={(item) => `${item.title}, ${item.year}`} or ={(item) => <b>{item.title}</b>}
export default function Cascade(props) {
  const {
      dataid,
      value,
      icon,
      horizontal,
      options = {},
      onChange,
      style,
      itemStyle,
      labels,
      ...rest
    } = props,
    val = getVal(value),
    klass = classNames(['form-field']),
    handleChange = (v, id) => {
      if (value === v) return;
      if (v) {
        onChange(v, dataid);
      } else {
        const ind = id.slice(-1);
        onChange(val[ind - 1], dataid);
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
          <div key={i} className={klass}>
            <Select
              key={i}
              {...rest}
              dataid={dataid + i}
              value={val[i]}
              options={spec?.value}
              className={classNames(['form-control'], { left: icon })}
              label={l}
              icon={icon}
              style={style}
              tight
              onChange={handleChange}
            />
            <label className="form-label lbl-transient">{l}</label>
          </div>
        );
      })}
    </div>
  );
}
