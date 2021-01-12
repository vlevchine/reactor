import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { renderItem, Decorator } from './helpers';

Tag.propTypes = {
  id: PropTypes.string,
  onRemove: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  text: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  intent: PropTypes.string,
  clear: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
};
export function Tag({
  id,
  text,
  clear,
  style,
  intent,
  disabled,
  onRemove,
}) {
  const stl = onRemove ? style : { ...style, paddingRight: '0.4rem' };
  return (
    <Decorator
      id={id}
      clear={clear}
      style={stl}
      hasValue
      className={classNames(['tag on darkTheme'], {
        [`bg-${intent}`]: intent,
      })}
      onChange={!disabled && clear && onRemove}>
      {text}
    </Decorator>
  );
}

//wrapper intent is handled by InputControl
//tagIntent serves for tags intent
export default function TagGroup(props) {
  const {
      dataid,
      value = [], //array of ids
      options = [],
      display,
      disabled,
      clear,
      icon,
      info,
      style,
      tagIntent,
      tagStyle,
      editable,
      onChange,
    } = props,
    vals = options.filter((o) => value.includes(o.id)),
    render = renderItem(display),
    onItemRemove = (_, id) => {
      onChange(id, dataid, 'remove');
    },
    onRemove = () => {
      onChange(undefined, dataid);
    };

  return (
    <Decorator
      id={dataid}
      onChange={clear && onRemove}
      clear={clear}
      icon={icon}
      info={info}
      style={style}
      className="input-wrapper"
      hasValue={vals.length > 0}>
      <span className="tag-container">
        {vals.map((e) => (
          <Tag
            key={e.id}
            id={e.id}
            text={render(e)}
            disabled={disabled}
            style={tagStyle}
            intent={tagIntent}
            clear={editable && 2}
            onRemove={editable && onItemRemove}
          />
        ))}{' '}
      </span>
    </Decorator>
  );
}

TagGroup.propTypes = {
  value: PropTypes.array,
  values: PropTypes.array,
  options: PropTypes.array,
  clear: PropTypes.bool,
  dataid: PropTypes.string,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  tagIntent: PropTypes.string,
  style: PropTypes.object,
  tagStyle: PropTypes.object,
  icon: PropTypes.string,
  info: PropTypes.string,
  editable: PropTypes.bool,
};
