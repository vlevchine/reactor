/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRef } from 'react';
import PropTypes from 'prop-types';
const { nanoid } = require('nanoid'); //_
import { _, classNames } from '@app/helpers';
import { useChangeReporter } from './helpers';
import { Decorate } from './decorator';

Tag.propTypes = {
  value: PropTypes.object,
  display: PropTypes.string,
  remove: PropTypes.func,
  disabled: PropTypes.bool,
  pill: PropTypes.bool,
  initials: PropTypes.bool,
  intent: PropTypes.string,
  dragAllowed: PropTypes.bool,
  className: PropTypes.string,
};
export function Tag({
  value,
  display = 'name',
  intent,
  className,
  initials,
  remove,
  disabled,
  dragAllowed,
  pill,
}) {
  const onClick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      remove(value.id);
    },
    name = value?.[display] || value,
    text = initials
      ? name
          .split(' ')
          .map((e) => e[0])
          .join('')
          .toUpperCase()
      : name,
    ref = useRef(); //useNativeEvent('click', onClick);

  return (
    <span
      data-tip={initials ? name : undefined}
      data-draggable={dragAllowed}
      className={classNames(['tag no-border', intent, className], {
        pill: pill,
        invert: intent,
      })}>
      <span>{text}</span>
      {!disabled && remove && (
        <button
          data-clear
          ref={ref}
          className="btn"
          onMouseUp={onClick}>
          <i className="clip-icon close sm"></i>
        </button>
      )}
    </span>
  );
}

TagGroup.propTypes = {
  value: PropTypes.array,
  onRemove: PropTypes.func,
};
export function TagGroup(props) {
  const { value, onRemove, ...rest } = props;

  return (
    <ul className="flex-row">
      {(value || []).map((e) => (
        <li key={e.id}>
          <Tag {...rest} value={e} remove={onRemove} />
        </li>
      ))}
    </ul>
  );
}

TagInput.propTypes = {
  value: PropTypes.array,
  display: PropTypes.string,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  clear: PropTypes.bool,
  uncontrolled: PropTypes.bool,
  noAdding: PropTypes.bool,
};
export default function TagInput(props) {
  const {
      value,
      display = 'name',
      disabled,
      noAdding,
      clear,
      ...rest
    } = props,
    [_value, changed] = useChangeReporter(value, props),
    addTag = (target) => {
      const v = target?.value;
      if (!v) return;
      const _vals = _value || [],
        tag = v.replace(/\s+/g, ' '),
        tags = tag
          .split(',')
          .map((s) => s.trim())
          .filter((e) => !_vals.some((t) => t.name === e));
      const n_tags = [
        ..._vals,
        ...tags.map((e) => ({ id: nanoid(4), name: e })),
      ];
      target.value = '';
      changed(n_tags);
    },
    onKeyUp = (ev) => {
      if (ev.code === 'Enter') {
        addTag(ev.target);
      }
    },
    onBlur = (ev) => {
      if (ev.target.value) addTag(ev.target);
    },
    removeTag = (id) => {
      const n_tags = _.remove(_value, (e) => e.id === id, true);
      changed(n_tags);
    },
    clearUp = () => {
      document.activeElement?.blur();
      changed();
    };

  return (
    <Decorate
      {...props}
      className="tag-list"
      setHidenInputValue={(v) => v?.length}
      clear={clear && !disabled ? clearUp : undefined}>
      <input
        readOnly
        value={_value?.length || ''}
        className="absolute hide no-events"></input>
      <TagGroup
        {...rest}
        value={_value}
        display={display}
        disabled={disabled}
        onRemove={removeTag}
      />
      {/* <ul className="flex-row">
        {(_value || []).map((e) => (
          <li key={e.id}>
            <Tag
              {...rest}
              value={e}
              display={display}
              disabled={!canEdit}
              remove={removeTag}
            />
          </li>
        ))}
      </ul> */}
      {!disabled && !noAdding && (
        <input
          type="text"
          className="tag-input no-border"
          spellCheck="false"
          onKeyUp={onKeyUp}
          onBlur={onBlur}
        />
      )}
    </Decorate>
  );
}
