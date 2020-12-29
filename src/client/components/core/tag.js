import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { renderItem, ClearButton, Decorator } from './helpers';
import './styles.css';

const Tag = ({ id, text, style, intent, disabled, onRemove }) => {
  const stl = onRemove ? style : { ...style, paddingRight: '0.4rem' },
    btn = onRemove && !disabled;
  return (
    <span
      //contentEditable={editable}
      data-intent={intent}
      className={classNames(['tag', 'darkTheme', 'flexRow'], {
        ['tag-text']: !btn,
      })}
      style={stl}>
      {text}
      {btn && (
        <ClearButton
          id={id}
          onClick={onRemove}
          alwayOn={!!onRemove}
          className="dark-theme"
        />
      )}
    </span>
  );
};

//wrapper intent is handled by InputControl
//tagIntent serves for tags intent
const TagGroup = (props) => {
  const {
      dataid,
      value = [], //array of ids
      options = [],
      values, //array of selected options
      display,
      disabled,
      clear,
      icon,
      info,
      fill,
      style,
      tagIntent,
      tagStyle,
      onChange,
    } = props,
    vals = values || options.filter((o) => value.includes(o.id)),
    render = renderItem(display),
    onRemove =
      clear && onChange
        ? (id) => {
            if (!id || id.type === 'click')
              onChange(undefined, dataid);
            else onChange(id, dataid, 'remove');
          }
        : undefined;

  return (
    <Decorator
      id={dataid}
      onChange={onChange}
      clear={clear}
      icon={icon}
      info={info}
      fill={fill}
      style={style}
      styled="l">
      <div className="tag-container">
        {vals.map((e) => (
          <Tag
            key={e.id}
            id={e.id}
            text={render(e)}
            disabled={disabled}
            style={tagStyle}
            intent={tagIntent}
            onRemove={onRemove}
          />
        ))}
      </div>
    </Decorator>
  );
};

Tag.propTypes = {
  id: PropTypes.string,
  onRemove: PropTypes.func,
  text: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  intent: PropTypes.string,
};

TagGroup.propTypes = {
  value: PropTypes.array,
  values: PropTypes.array,
  options: PropTypes.array,
  clear: PropTypes.bool,
  dataid: PropTypes.string,
  fill: PropTypes.bool,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  tagIntent: PropTypes.string,
  style: PropTypes.object,
  tagStyle: PropTypes.object,
  icon: PropTypes.string,
  info: PropTypes.string,
};

export { Tag, TagGroup };
export default TagGroup;
