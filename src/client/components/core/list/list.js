/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { _, classNames } from '@app/helpers';
import { mergeIds } from '../helpers';
import { toaster } from '@app/services';
import {
  Icon,
  ConfirmDeleteBtn,
  TextInput,
  NumberInput,
} from '@app/components/core';
import Switch from '../boxed/switch';
import Select, { Count } from '../popover/select';
import ListItem from './listItem';
import { InputPercent } from '..';
export { ListItem };
export { default as ItemList } from './itemList';

const _new = '_new',
  liClass = 'list-item',
  newItem = { id: _new },
  defFields = ['name'],
  listComponents = {
    Select,
    Count,
    Switch,
    number: NumberInput,
    percent: InputPercent,
    text: TextInput,
  };

function useClickWithin(cb, sel) {
  const ref = useRef();
  useEffect(() => {
    const handler = (ev) => {
      if (!ref.current) return;
      const {
          top,
          bottom,
          left,
          right,
        } = ref.current.getBoundingClientRect(),
        { clientX, clientY } = ev,
        parent = sel && ev.target.closest(sel),
        outside =
          clientY < top ||
          clientY > bottom ||
          clientX < left ||
          clientY > right;

      cb(!outside, parent?.id, ev);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [cb]);
  return [ref];
}
function getStyle(numbered, fields, style) {
  const parts = ['1rem'];
  if (numbered) parts.push(`1.5rem`);
  fields.forEach(({ type, width }) =>
    parts.push(
      width ||
        (!type || type === 'text'
          ? 'minmax(max-content,1fr)'
          : '3rem')
    )
  );
  return {
    ...style,
    gridTemplateColumns: parts.join(' '),
    gap: '0.125rem 0.25rem',
  };
}

LineItemEditor.propTypes = {
  fields: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func,
  isEditing: PropTypes.bool,
  onUnchanged: PropTypes.func,
};
function LineItemEditor({
  fields,
  value,
  onChange,
  onUnchanged,
  isEditing,
}) {
  return fields.map((f) => {
    const id = f.id || f,
      { name, display, type, options, placeholder, props } = f,
      v = value?.[id],
      Comp = listComponents[type] || listComponents.text;

    return (
      <Comp
        key={id}
        dataid={id}
        {...props}
        value={v}
        readonly={!isEditing}
        onChange={onChange}
        placeholder={placeholder || name}
        display={display}
        underlined
        resetOnReport
        options={options}
        onUnchanged={onUnchanged}
      />
    );
  });
}
LineItem.propTypes = {
  id: PropTypes.string,
  fields: PropTypes.array,
  type: PropTypes.string,
  value: PropTypes.any,
  onDelete: PropTypes.func,
  setEdit: PropTypes.func,
  isEditing: PropTypes.bool,
  ind: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  numbered: PropTypes.bool,
  allowDelete: PropTypes.bool,
};
function LineItem({
  id,
  value,
  ind,
  numbered,
  isEditing,
  onDelete,
  allowDelete,
  ...rest
}) {
  const ref = useRef(),
    deleting = () => {
      onDelete(value.id);
    };

  return (
    <div
      ref={ref}
      id={id || value.id}
      className={classNames([liClass], { editing: isEditing })}>
      {allowDelete ? (
        <ConfirmDeleteBtn size="xs" onDelete={deleting} />
      ) : (
        <div />
      )}
      {numbered && (
        <span className={classNames([isEditing && 'mt-2'])}>
          {_.isNumber(ind) ? (
            `${ind}.`
          ) : ind ? (
            <Icon name={ind} className="muted" />
          ) : (
            ''
          )}
        </span>
      )}
      <LineItemEditor {...rest} isEditing={isEditing} value={value} />
    </div>
  );
}

List.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  dataid: PropTypes.string,
  value: PropTypes.array,
  fields: PropTypes.array,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  readonly: PropTypes.bool,
  numbered: PropTypes.bool,
  className: PropTypes.string,
  itemClass: PropTypes.string,
  style: PropTypes.object,
};
export default function List({
  id,
  title,
  dataid,
  value,
  fields = defFields,
  onChange,
  className,
  numbered,
  style,
  readonly,
}) {
  const lid = dataid || id,
    _style = getStyle(numbered, fields, style),
    [editing, _setEditing] = useState(),
    setEditing = (v) => {
      _setEditing(v);
    },
    reportChange = (val) => {
      const first = fields[0].name || 'name';
      if (val[first]) {
        const id = val.id;
        if (id !== _new) {
          const cur = value?.find((v) => v.id === id);
          if (!_.isSame(val, cur))
            onChange(val, mergeIds(lid, val.id), 'update');
        } else {
          val.id = nanoid(6);
          onChange(val, lid, 'add');
          setEditing(newItem);
        }
      } else
        toaster.warning(
          `Can not save - field <${first}> is required.`
        );
      return !!val[first];
    },
    onClick = (inside, _id) => {
      const rid = inside && _id;
      if (readonly || rid === editing?.id) return;
      const val =
        _id === _new ? newItem : value?.find((v) => v.id === _id);

      if (editing?.id) {
        setEditing(
          reportChange(editing) && val ? { ...val } : undefined
        );
      } else setEditing(val ? { ...val } : undefined);
    },
    [ref] = useClickWithin(onClick, `.${liClass}`),
    ignore = (id, key) => {
      if (key) setEditing();
    },
    deleting = (id) => {
      onChange(id, lid, 'remove');
    },
    changing = (v, _id, key) => {
      // if (_.isNil(done)) {
      //   const __id = lid ? _id.substring(lid.length + 1) : _id,
      //     floats = fields.filter((f) => f.type === 'float');
      //   pld = { [__id]: v };
      //   if (!lid) floats.forEach((f) => (pld[f.name] = f.max));
      // }
      console.log('change', v, _id, key);
      const f = fields.find((e) => e.name === _id),
        isNum = f?.type === 'float',
        _v = isNum ? Number(v).toFixed(1) || f.max : v,
        n_val = { ...editing, [_id]: _v };
      if (key) {
        reportChange(n_val);
        setEditing(newItem);
      } else setEditing(n_val);
    };

  useEffect(() => {
    setEditing();
  }, [readonly]);

  return (
    <div
      ref={ref}
      className={classNames(['grid', className])}
      style={_style}>
      {title && <h6>{title}</h6>}
      {fields.length > 1 ? (
        <>
          <div />
          {numbered && <div />}
          {fields.map((f) => (
            <span key={f.id} className="lbl-text">
              {f.name}
            </span>
          ))}
        </>
      ) : null}
      {_.safeMap(value, (e, i) => {
        const isEditing = editing?.id === e.id;
        return (
          <LineItem
            key={e.id}
            id={e.id}
            value={isEditing ? editing : e}
            ind={i + 1}
            fields={fields}
            numbered={numbered}
            isEditing={isEditing}
            allowDelete={!readonly}
            onChange={changing}
            onUnchanged={ignore}
            onDelete={deleting}
          />
        );
      })}
      {!readonly && (
        <LineItem
          value={editing?.id === _new ? editing : undefined}
          id={_new}
          fields={fields}
          numbered={numbered}
          isEditing
          ind="plus"
          onChange={changing}
        />
      )}
    </div>
  );
}
