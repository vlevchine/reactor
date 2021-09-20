/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
//import { useRef } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import {
  ButtonGroup,
  Button,
  ConfirmDeleteBtn,
  Icon,
  EditableText,
  Select,
  Count,
} from '..';

//const typeHint = (str) => `${str || ''} name...`;     num = 1
// const styleIt = () => ({
//   // margin: '0 0.5rem',
//   //width: num > 1 ? `${Math.min(Math.floor(95 / num), 50)}%` : '90%',
// });
const countStyle = { width: '4rem', flexGrow: 0 };
function render(f, value, conf) {
  const {
      className,
      style,
      selecting,
      changing,
      allowedOptions,
      readonly,
    } = conf,
    id = f.name || f,
    dataid = _.dotMerge(value?.id, id);
  return f.options ? (
    <Select
      key={id}
      dataid={dataid}
      minimal
      value={value?.[id]}
      {...f}
      readonly={readonly}
      allowedOptions={allowedOptions}
      style={readonly ? { maxWidth: '30%' } : style}
      onChange={changing}
      placeholder={f.placeholder || id}
    />
  ) : f.max ? (
    <Count
      key={id}
      dataid={dataid}
      minimal
      value={value?.[id]}
      {...f}
      readonly={readonly}
      style={countStyle}
      onChange={selecting}
    />
  ) : (
    <EditableText
      key={id}
      className={className}
      style={style}
      value={value?.[id]}
      id={f}
      minimal
      readonly={readonly}
      onChange={changing}
      resetOnDone
      placeholder={id} //typeHint(isGroup ? groupTitle : itemTitle)
    />
  );
}
ListItem.propTypes = {
  id: PropTypes.string,
  path: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  fields: PropTypes.array,
  icon: PropTypes.string,
  config: PropTypes.object,
  onItemChange: PropTypes.func,
  onSelect: PropTypes.func,
  isGroup: PropTypes.bool,
  isSelected: PropTypes.bool,
  onDelete: PropTypes.func,
  onAddGroup: PropTypes.func,
  allowDrag: PropTypes.bool,
  toastDelete: PropTypes.bool,
  className: PropTypes.string,
  readonly: PropTypes.bool,
};
export default function ListItem({
  path,
  config,
  value,
  fields,
  onItemChange,
  onSelect,
  isSelected,
  isGroup,
  onDelete,
  onAddGroup,
  allowDrag,
  toastDelete,
  className,
  readonly,
}) {
  const lid = value?.id,
    {
      icon,
      groupIcon,
      itemTitle,
      itemClass,
      selection = true,
      allowedOptions,
    } = config,
    changing = (v, _id, done) => {
      let pld;
      if (_.isNil(done)) pld = { [_id.substring(lid.length + 1)]: v };
      if (done?.accept) pld = { [_id]: v };
      if (pld) onItemChange(pld, lid, value);
    },
    selecting = (v, _id) => {
      if (!selection) return;
      const [, f] = _id.split('.'),
        field = fields.find((e) => e.name === f),
        val =
          field?.max || field?.min ? { [f]: Number(v) } : { [f]: v };
      onItemChange(val, lid, true, value);
    },
    // styl = styleIt(lid ? fields?.length : 1),
    options = {
      changing,
      selecting,
      className,
      allowedOptions,
      readonly,
    };

  return (
    <span
      data-draggable={(allowDrag && !isGroup) || undefined}
      data-collapse-source={isGroup || undefined}
      className={classNames(['item-header', itemClass], {
        ['group']: isGroup,
        ['selected']: isSelected,
      })}>
      {(icon || groupIcon) && (
        <span
          className="item-icon"
          data-drag-handle={allowDrag || undefined}>
          <Icon name={isGroup ? groupIcon : icon} styled="l" />
        </span>
      )}
      {value?.id
        ? fields.map((f) => {
            return render(f, value, options);
          })
        : render(fields[0], value, options)}
      <ButtonGroup minimal>
        {selection && value?.id && (
          <Button
            id={path}
            prepend="search"
            iconStyle="r"
            onClick={onSelect}
          />
        )}
        {isGroup && onAddGroup && (
          <Button
            id={lid}
            prepend="plus"
            iconStyle="r"
            onClick={() => console.log(value)}
          />
        )}
        {!readonly && onDelete && value?.id && (
          <ConfirmDeleteBtn
            id={path}
            disabled={!value?.id}
            message={`delete this ${itemTitle}${
              isGroup ? ' group' : ''
            }`}
            toastText={
              toastDelete
                ? `${itemTitle}${isGroup ? ' group' : ''}`
                : undefined
            }
            onDelete={onDelete}
          />
        )}
      </ButtonGroup>
    </span>
  );
}