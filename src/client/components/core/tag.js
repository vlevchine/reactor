import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { renderItem } from './helpers';
import { Button, EditableText } from '.';

Tag.propTypes = {
  id: PropTypes.string,
  onRemove: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  text: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  initials: PropTypes.bool,
  intent: PropTypes.string,
  dragAllowed: PropTypes.bool,
  clear: PropTypes.bool,
};
export function Tag({
  id,
  text,
  clear,
  className,
  initials,
  intent,
  disabled,
  dragAllowed,
  onRemove,
  style,
}) {
  const onClick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      console.log('click');
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
      data-draggable={dragAllowed}
      style={style}
      className={classNames(['tag', intent, className], {
        ['container-relative']: initials,
      })}>
      <span className="text-dots">{txt}</span>
      {!disabled && clear && (
        <Button
          className="clip-icon close minimal"
          onClick={onClick}
        />
      )}
    </span>
  );
}

//wrapper intent is handled by InputControl
//tagIntent serves for tags intent
//either selectable - all options displayed
//or just those in value array, e.g. with MultiSelect
export default function TagGroup({
  dataid,
  id,
  value, //array of ids
  options,
  display = 'label',
  disabled,
  clear,
  tagIntent,
  pills,
  minimal,
  initials,
  tagStyle,
  tagClear,
  editable,
  onChange,
  dragAllowed,
  single,
  defaultValue,
  onSelect,
  selected, //array of ids
}) {
  const vals =
      (onSelect
        ? options
        : options?.filter((o) => value?.includes(o.id))) || [],
    render = renderItem(display),
    onItemRemove = (_id) => {
      onChange(_id, dataid || id, 'remove');
    },
    onAdd = (v, __, done) => {
      if (v && done?.accept) onChange(v, dataid || id, 'add');
    },
    sel = single
      ? selected || [defaultValue].filter((e) => !_.isNil(e))
      : selected,
    onClick = (ev) => {
      const cid = ev.currentTarget.id;
      if (!single) {
        const ind = value.findIndex((e) => e === cid),
          vals =
            ind > -1
              ? [...value.slice(0, ind), ...value.slice(ind + 1)]
              : [...value, cid];
        onSelect?.(vals, dataid || id);
      } else onSelect?.(cid, dataid || id);
    },
    clearTag = tagClear || (clear && tagClear === undefined);

  return (
    <>
      <span
        className={classNames(['tag-container'], {
          disabled,
          ['no-padding']: minimal,
        })}>
        {vals.map((e) => {
          const tag = (
            <Tag
              key={e.id}
              id={e.id}
              intent={
                onSelect && sel?.includes(e.id) ? 'muted' : tagIntent
              }
              text={render(e)}
              initials={initials}
              disabled={disabled}
              style={tagStyle}
              className={pills ? 'pill' : undefined}
              clear={clearTag}
              dragAllowed={dragAllowed}
              onRemove={clearTag && onItemRemove}
            />
          );
          return onSelect ? (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <span
              role="button"
              tabIndex="-1"
              key={e.id}
              id={e.id}
              onClick={onClick}>
              {tag}
            </span>
          ) : (
            tag
          );
        })}
        {editable && !disabled && (
          <EditableText
            id={dataid || id}
            placeholder=""
            onChange={onAdd}
            resetOnDone={true}
            style={{ maxWidth: '5rem' }}
          />
        )}
      </span>
    </>
  );
}

TagGroup.propTypes = {
  value: PropTypes.array,
  options: PropTypes.array,
  tagClear: PropTypes.bool,
  clear: PropTypes.bool,
  dataid: PropTypes.string,
  id: PropTypes.string,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  tagIntent: PropTypes.string,
  style: PropTypes.object,
  intent: PropTypes.string,
  tagStyle: PropTypes.object,
  initials: PropTypes.bool,
  editable: PropTypes.bool,
  className: PropTypes.string,
  pills: PropTypes.bool,
  minimal: PropTypes.bool,
  dragAllowed: PropTypes.bool,
  single: PropTypes.bool,
  defaultValue: PropTypes.string,
  onSelect: PropTypes.func,
  selected: PropTypes.array,
};
