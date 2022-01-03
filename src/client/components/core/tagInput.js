/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
const { nanoid } = require('nanoid'); //_
import { _, classNames } from '@app/helpers';
import { Select } from '.';
import {
  getSpec,
  useChangeReporter,
  //useNativeEvent,
} from './helpers'; //, setCaret
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
  display,
  intent,
  className,
  initials,
  remove,
  disabled,
  dragAllowed,
  pill,
}) {
  const onClick = () => {
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
          onClick={onClick}>
          <i className="clip-icon close sm"></i>
        </button>
      )}
    </span>
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
      readonly,
      noAdding,
      clear,
      ...rest
    } = props,
    [_value, changed] = useChangeReporter(value, props),
    canEdit = !(readonly || disabled),
    addTag = (target) => {
      if (!target?.value) return;
      const v = target.value,
        tag = v.replace(/\s+/g, ' '),
        tags = tag
          .split(',')
          .map((s) => s.trim())
          .filter((e) => !_value.some((t) => t.name === e)),
        n_tags = [
          ..._value,
          ...tags.map((e) => ({ id: nanoid(4), name: e })),
        ];
      target.value = '';
      changed(n_tags);
    },
    onKeyUp = (ev) => {
      if (ev.code === 'Enter') addTag(ev.target);
    },
    onBlur = (ev) => {
      if (ev.target.value) addTag(ev.target);
    },
    removeTag = (id) => {
      const n_tags = _.remove(_value, (e) => e.id === id, true);
      changed(n_tags);
    };

  return (
    <Decorate
      {...props}
      setHidenInputValue={(v) => v?.length}
      clear={clear && changed}>
      <input
        readOnly
        value={_value?.length || ''}
        className="absolute hide no-events"></input>
      <ul>
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
        {canEdit && !noAdding && (
          <input
            type="text"
            className="tag-input no-border"
            spellCheck="false"
            onKeyUp={onKeyUp}
            onBlur={onBlur}
          />
        )}
      </ul>
    </Decorate>
  );
}

// Select.propTypes = {
//   value: PropTypes.string,
//   options: PropTypes.array,
//   disabled: PropTypes.bool,
//   readonly: PropTypes.bool,
//   clear: PropTypes.bool,
// };
// export function Select(props) {
//   const { value, options, disabled, readonly, clear } = props,
//     [_value, changed] = useChangeReporter(value, props),
//     clicked = (target) => {
//       const value = target?.dataset.value;
//       if (value && value !== val) changed(value);
//     },
//     canEdit = !(disabled || readonly),
//     val = options?.find((e) => e.id === _value);

//   return (
//     <Decorate
//       {...props}
//       //ignoreInClick collapseTrigger="chevron-down"
//       clear={clear && changed}
//       append="chevron-down"
//       dropdown={
//         canEdit &&
//         _.map(options, (o) => (
//           <span key={o.id} data-value={o.id}>
//             {o.name}
//           </span>
//         ))
//       }
//       closeOnClickIn
//       onDropdownClose={clicked}>
//       <input
//         value={val?.name || ''}
//         disabled
//         className="no-border infoboard"
//       />
//     </Decorate>
//   );
// }

MultiSelect.propTypes = {
  value: PropTypes.array,
  options: PropTypes.array,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  clear: PropTypes.bool,
};
export function MultiSelect(props) {
  const { value, options, disabled, readonly } = props,
    [_value, changed] = useChangeReporter(value || [], props),
    dropdown = useRef(),
    clicked = (ev) => {
      ev.target?.classList.toggle('option-check');
    },
    onClose = (target) => {
      if (dropdown.current) {
        const checked = [...dropdown.current.childNodes]
          .map(
            (e) =>
              e.classList.contains('option-check') && e.dataset.value
          )
          .filter(Boolean);
        changed(checked);
      } else dropdown.current = target;
    },
    changing = (v) => {
      const _vals = v && v.map((e) => e.id),
        n_val = _vals?.length ? _vals : undefined;
      changed(n_val);
    },
    canEdit = !(disabled || readonly),
    val = _.filter(options, (e) => _value?.includes(e.id));

  return (
    <TagInput
      {...props}
      value={val}
      noAdding
      onChange={changing}
      append="chevron-down"
      dropdown={
        canEdit &&
        _.map(options, (o) => (
          <span
            key={o.id}
            data-value={o.id}
            className={classNames([], {
              ['option-check']: _value?.includes(o.id),
            })}>
            {o.name}
          </span>
        ))
      }
      onDropdownClick={clicked}
      onDropdownClose={onClose}
      ignoreInClick
      uncontrolled={false}
    />
  );
}

function setCaret(el, pos = 0) {
  el.setSelectionRange(pos, pos);
}
const delKeys = ['Backspace', 'Delete'];
MaskInput.propTypes = {
  spec: PropTypes.object,
  value: PropTypes.string,
  options: PropTypes.array,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  onChange: PropTypes.func,
  dropdown: PropTypes.any,
};
//This one is CONTROLLED - never use directly,
//Parent will pass a value as a string formatted accordingly
//so it'll be responsible for decoding result into proper value
export function MaskInput(props) {
  const {
      spec,
      value,
      // disabled,
      // readonly,
      // dropdown,
      onChange,
    } = props,
    [val, setVal] = useState(value || ''),
    inp = useRef(),
    pos = useRef(0),
    keyInfo = useRef({}),
    // clicked = (ev) => {
    //   const { clear, value } = ev.target.dataset;
    //   if (clear) return true;
    //   if (value) onChange(value);
    // },
    changing = () => {
      const { key, loc } = keyInfo.current;
      keyInfo.current = {};
      if (key) {
        const n_v = _.replaceCharAt(val, loc, key),
          toks = n_v
            .split(spec.sep)
            .map((e, i) => spec[spec.seq[i]].change(e))
            .flat();
        pos.current = loc + 1;
        if (n_v[pos.current] === spec.sep) pos.current++;
        console.log(toks);
        setVal(n_v);
      }
    },
    onKey = (ev) => {
      const { key, target, altKey, ctrlKey, shiftKey } = ev;
      if (key === 'Enter') return report();
      const { value, selectionStart: loc } = target,
        length = value.length,
        m_length = spec.mask.length,
        status = Number(key) > -1 ? 3 : delKeys.indexOf(key) + 1;

      let info =
        !status ||
        altKey ||
        ctrlKey ||
        shiftKey ||
        Math.abs(length - m_length) > 1
          ? {}
          : { key, loc };
      if (status > 0) {
        if (status === 1) info.loc--;
        const char = val[info.loc];
        if (char) {
          if (char === spec.sep) {
            if (status > 1) {
              info.loc++;
            } else info.loc--;
          }
          if (status < 3) {
            info.key = spec.mask[info.loc];
          }
        } else info = {};
      }

      keyInfo.current = info;
    },
    onMouseUp = () => {
      if (!val) {
        setVal(spec.mask);
        pos.current = 0;
      }
    },
    report = () => {
      onChange?.(val);
    };
  // canEdit = !(disabled || readonly);

  useLayoutEffect(() => {
    setCaret(inp.current, pos.current);
  }, [val]);

  return (
    <Decorate
      {...props}
      append="calendar"
      // onReset={clear ? changed : undefined}
    >
      <input
        ref={inp}
        value={val}
        onChange={changing}
        onMouseUp={onMouseUp}
        onKeyDown={onKey}
        onBlur={report}
        className="no-border entry"
      />
    </Decorate>
  );
}
// spec.defaultSlotsString()
// maskSpecs.date.valueToSlots(new Date()),
// maskSpecs.date.valueToSlotsString(new Date())
DateInput.propTypes = {
  value: PropTypes.instanceOf(Date),
  type: PropTypes.string,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
};
const _type = 'date';
export function DateInput({ value, disabled, readonly, ...props }) {
  const spec = getSpec(_type, 'en-CA'),
    [_value, changed] = useChangeReporter(
      spec.toString(value),
      props
    ),
    canEdit = !(disabled || readonly);

  return (
    <MaskInput
      {...props}
      spec={spec}
      value={_value}
      onChange={changed}
      dropdown={canEdit && <div>Calendar</div>}
      // onDropdownClick={clicked}
      // onDropdownClose={onClose}
    />
  );
}

const controls = { Select, MultiSelect };
FormControl.propTypes = {
  dataid: PropTypes.string,
  id: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.string,
  intent: PropTypes.string,
};
export function FormControl({
  dataid,
  id,
  message,
  type,
  intent,
  ...props
}) {
  const Ctrl = controls[type],
    //dataid is for Form only, outside, just use id
    _id = dataid || id;
  return (
    <div className="form-ctrl">
      <Ctrl {...props} id={_id} intent={intent} />
      <div className={classNames(['msg', intent])}>{message}</div>
    </div>
  );
}

Fieldset.propTypes = {
  label: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  children: PropTypes.any,
};
export function Fieldset({ label, disabled, style, children }) {
  return (
    <fieldset className="form-ctrl" style={style} disabled={disabled}>
      <legend>{label}</legend>
      {children}
      <br />
    </fieldset>
  );
}
