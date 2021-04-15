import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { renderItem } from './helpers';
import { Button, ClearButton, IconSymbol, Decorator } from '.';

Tag.propTypes = {
  id: PropTypes.string,
  onRemove: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  text: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  initials: PropTypes.bool,
  intent: PropTypes.string,
  clear: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
};
export function Tag({
  id,
  text,
  clear,
  //style,
  initials,
  intent,
  disabled,
  onRemove,
}) {
  const onClick = () => {
      //ev.preventDefault();
      onRemove(id);
    },
    txt = initials
      ? text
          .split(' ')
          .map((e) => e[0])
          .join('')
          .toUpperCase()
      : text;

  return (
    <span
      data-tip={initials ? text : undefined}
      className={classNames(['tag on'], {
        [`bg-${intent}`]: intent,
        ['container-relative']: initials,
      })}>
      <span className="text-dots">{txt}</span>
      {!disabled && clear && (
        <Button minimal onClick={onClick}>
          <IconSymbol name="times-s" />
        </Button>
      )}
    </span>
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
      prepend,
      append,
      appendType,
      style,
      className,
      tagIntent,
      intent,
      initials,
      tagStyle,
      editable,
      onChange,
    } = props,
    vals = options.filter((o) => value.includes(o.id)),
    render = renderItem(display),
    onItemRemove = (id) => {
      onChange(id, dataid, 'remove');
    };

  return (
    <Decorator
      prepend={prepend}
      append={append}
      appendType={appendType}
      style={style}
      className={className}
      intent={intent}
      hasValue={vals.length > 0}>
      <span className={classNames(['tag-container'], { disabled })}>
        {vals.map((e) => (
          <Tag
            key={e.id}
            id={e.id}
            text={render(e)}
            initials={initials}
            disabled={disabled}
            style={tagStyle}
            intent={tagIntent}
            clear={editable && 2}
            onRemove={editable && onItemRemove}
          />
        ))}{' '}
      </span>
      <ClearButton
        clear={clear && !disabled}
        id={dataid}
        onChange={onChange}
      />
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
  intent: PropTypes.string,
  tagStyle: PropTypes.object,
  initials: PropTypes.bool,
  prepend: PropTypes.string,
  append: PropTypes.string,
  appendType: PropTypes.string,
  editable: PropTypes.bool,
  className: PropTypes.string,
};
