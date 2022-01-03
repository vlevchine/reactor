/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
//import { useRef } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { Button, ConfirmDeleteBtn, EditableText } from '..';

//const countStyle = { width: '4rem', flexGrow: 0 };
// function render(f, value, conf) {
//   const {
//       className,
//       style,
//       selecting,
//       changing,
//       allowedOptions,
//       readonly,
//       path,
//     } = conf,
//     id = f.name || f;

//   return f.options ? (
//     <Select
//       key={id}
//       dataid={_.dotMerge(path, id)}
//       minimal
//       value={value?.[id]}
//       {...f}
//       readonly={readonly}
//       allowedOptions={allowedOptions}
//       style={readonly ? { maxWidth: '30%' } : style}
//       onChange={changing}
//       placeholder={f.placeholder || id}
//     />
//   ) : f.type === 'int' ? (
//     <Count
//       key={id}
//       dataid={_.dotMerge(path, id)}
//       minimal
//       value={value?.[id]}
//       {...f}
//       readonly={readonly}
//       style={countStyle}
//       onChange={selecting}
//     />
//   ) : (
//     <EditableText
//       key={id}
//       className={className}
//       style={f.type === 'float' ? { width: '1.5rem' } : style}
//       value={value?.[id]}
//       id={f.name || f}
//       dataid={path}
//       minimal
//       readonly={readonly}
//       onChange={changing}
//       resetOnDone
//       blurOnEnter
//       placeholder={id} //typeHint(isGroup ? groupTitle : itemTitle)
//     />
//   );
// }
// ListItem0.propTypes = {
//   id: PropTypes.string,
//   path: PropTypes.string,
//   value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
//   fields: PropTypes.array,
//   icon: PropTypes.string,
//   config: PropTypes.object,
//   onItemChange: PropTypes.func,
//   onSelect: PropTypes.func,
//   isGroup: PropTypes.bool,
//   isSelected: PropTypes.bool,
//   onDelete: PropTypes.func,
//   onAddGroup: PropTypes.func,
//   allowDrag: PropTypes.bool,
//   toastDelete: PropTypes.bool,
//   className: PropTypes.string,
//   readonly: PropTypes.bool,
// };
// export function ListItem0({
//   path,
//   config,
//   value,
//   fields,
//   onItemChange,
//   onSelect,
//   isSelected,
//   isGroup,
//   onDelete,
//   //onAddGroup,
//   allowDrag,
//   toastDelete,
//   className,
//   readonly,
// }) {
//   const lid = value?.id,
//     {
//       icon,
//       groupIcon,
//       itemTitle,
//       itemClass,
//       //  selection = true,
//       allowedOptions,
//     } = config,
//     changing = (v, _id, done) => {
//       let pld;
//       if (_.isNil(done)) {
//         const __id = lid ? _id.substring(lid.length + 1) : _id,
//           floats = fields.filter((f) => f.type === 'float');
//         pld = { [__id]: v };
//         if (!lid) floats.forEach((f) => (pld[f.name] = f.max));
//       }
//       if (done?.accept) {
//         const f = fields.find((e) => e.name === _id),
//           isNum = f?.type === 'float',
//           _v = isNum ? Number(v).toFixed(1) || f.max : v;
//         pld = { [_id]: _v };
//       }

//       if (pld) onItemChange(pld, path, value);
//     },
//     selecting = (v, _id) => {
//       // if (!selection) return;
//       const [, f] = _id.split('.'),
//         field = fields.find((e) => e.name === f),
//         val =
//           field?.max || field?.min ? { [f]: Number(v) } : { [f]: v };
//       onItemChange(val, lid, true, value);
//     },
//     options = {
//       changing,
//       selecting,
//       className,
//       allowedOptions,
//       readonly,
//       path,
//     };

//   return (
//     <span
//       data-draggable={(allowDrag && !isGroup) || undefined}
//       data-drag-element={(allowDrag && isGroup) || undefined}
//       className={classNames(['item-header', itemClass], {
//         ['group']: isGroup,
//         ['selected']: isSelected,
//       })}>
//       {allowDrag && (
//         <span className="item-grip" data-drag-handle={allowDrag} />
//       )}
//       <span data-collapse-source={isGroup || undefined}></span>
//       {/* <Icon name="grip-vertical" styled="r" /> */}
//       {(icon || groupIcon) && (
//         <Button
//           id={path}
//           prepend={isGroup ? groupIcon : icon}
//           minimal
//           size="xs"
//           iconStyle="l"
//           onClick={onSelect}
//         />
//       )}
//       {value?.id
//         ? fields.map((f) => {
//             return render(f, value, options);
//           })
//         : render(fields[0], value, options)}
//       <ButtonGroup minimal>
//         {/* {selection && value?.id && (
//           <Button
//             id={path}
//             prepend="search"
//             iconStyle="r"
//             onClick={onSelect}
//           />
//         )}
//         {isGroup && onAddGroup && (
//           <Button
//             id={lid}
//             prepend="plus"
//             iconStyle="r"
//             onClick={() => console.log(value)}
//           />
//         )} */}
//         {!readonly && onDelete && value?.id && (
//           <ConfirmDeleteBtn
//             id={path}
//             disabled={!value?.id}
//             message={`delete this ${itemTitle}${
//               isGroup ? ' group' : ''
//             }`}
//             toastText={
//               toastDelete
//                 ? `${itemTitle}${isGroup ? ' group' : ''}`
//                 : undefined
//             }
//             onDelete={onDelete}
//           />
//         )}
//       </ButtonGroup>
//     </span>
//   );
// }

ListItem.propTypes = {
  id: PropTypes.string,
  path: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
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
  style: PropTypes.object,
};
export default function ListItem({
  path,
  config,
  value,
  onItemChange,
  onSelect,
  isSelected,
  isGroup,
  onDelete,
  style,
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
      //  selection = true,
      //allowedOptions,
    } = config,
    changing = (v, _id, done) => {
      let pld;
      if (_.isNil(done)) {
        const __id = lid ? _id.substring(lid.length + 1) : _id;
        pld = { [__id]: v };
      } else if (done?.accept) pld = { [_id]: v };

      if (pld) onItemChange(pld, path, value);
    };

  return (
    <span
      data-draggable={(allowDrag && !isGroup) || undefined}
      data-drag-element={(allowDrag && isGroup) || undefined}
      className={classNames(['item-header', itemClass], {
        ['group']: isGroup,
        ['selected']: isSelected,
      })}>
      {allowDrag && (
        <span className="item-grip" data-drag-handle={allowDrag} />
      )}
      <span data-collapse-source={isGroup || undefined}></span>
      {/* <Icon name="grip-vertical" styled="r" /> */}
      {(icon || groupIcon) && (
        <Button
          id={path}
          prepend={isGroup ? groupIcon : icon}
          minimal
          size="xs"
          iconStyle="l"
          onClick={onSelect}
        />
      )}
      <EditableText
        key={value?.id}
        className={className}
        style={style}
        value={value?.name}
        dataid={path}
        minimal
        readonly={readonly}
        onChange={changing}
        resetOnDone
        blurOnEnter
      />

      {!readonly && onDelete && value?.id && (
        <ConfirmDeleteBtn
          id={path}
          minimal
          size="sm"
          className="btn-hover"
          style={{ padding: '0.125rem' }}
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
    </span>
  );
}
