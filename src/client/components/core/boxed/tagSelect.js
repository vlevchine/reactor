import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Tag } from '..';

//Use toggle prop for toggle view, always set intent for toggle,
//otherwise both states hava same background color
TaggedSelect.propTypes = {
  id: PropTypes.string,
  dataid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  text: PropTypes.string,
  pills: PropTypes.bool,
  options: PropTypes.array,
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  defaultValue: PropTypes.string,
  intent: PropTypes.string,
  style: PropTypes.object,
  display: PropTypes.string,
  disabled: PropTypes.bool,
  selectedColor: PropTypes.string,
  single: PropTypes.bool,
  onChange: PropTypes.func,
};
export default function TaggedSelect({
  value,
  defaultValue,
  id,
  dataid,
  options,
  single,
  pills,
  display = 'label',
  onChange,
}) {
  const val = single
      ? [value || defaultValue].filter((e) => !_.isNil(e))
      : value,
    onClick = (ev, _id) => {
      if (!single) {
        const ind = value.findIndex((e) => e === _id),
          vals =
            ind > -1
              ? [...value.slice(0, ind), ...value.slice(ind + 1)]
              : [...value, _id];
        onChange?.(vals, dataid || id);
      } else onChange?.(_id, dataid || id);
    };

  return (
    <div className="flex-row">
      {options &&
        options.map((e) => {
          return (
            <Button key={e.id} minimal id={e.id} onClick={onClick}>
              <Tag
                text={e[display]}
                className={pills ? 'pill' : undefined}
                intent={val?.includes(e.id) ? 'muted' : undefined}
              />
            </Button>
          );
        })}
    </div>
  );
}
