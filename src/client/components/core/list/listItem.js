/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import {
  ButtonGroup,
  Button,
  ConfirmDeleteBtn,
  IconSymbol,
  EditableText,
} from '..';

//const typeHint = (str) => `${str || ''} name...`;
const styleIt = (num = 1) => ({
  width: `${Math.min(Math.floor(95 / num), 50)}%`,
});

ListItem.propTypes = {
  id: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  fields: PropTypes.array,
  icon: PropTypes.string,
  config: PropTypes.object,
  onItemChange: PropTypes.func,
  onSelect: PropTypes.func,
  isGroup: PropTypes.bool,
  isSelected: PropTypes.bool,
  onDelete: PropTypes.func,
  allowDrag: PropTypes.bool,
  toastDelete: PropTypes.bool,
  className: PropTypes.string,
};
export default function ListItem({
  id,
  config,
  value,
  fields,
  icon,
  onItemChange,
  onSelect,
  isSelected,
  isGroup,
  onDelete,
  allowDrag,
  toastDelete,
  className,
}) {
  const lid = id || value?.id, //{ groupTitle, itemTitle } = config,
    changing = (v, _id, done) => {
      onItemChange({ [_id]: v }, lid, done);
    },
    styl = styleIt(fields?.length);

  return (
    <div
      data-draggable={(allowDrag && !isGroup) || undefined}
      data-collapse-source={isGroup || undefined}
      className={classNames(['item-header'], {
        ['list-item']: !isGroup,
        ['selected']: isSelected,
      })}>
      <span
        className="item-icon"
        data-drag-handle={allowDrag || undefined}>
        <IconSymbol
          name={icon}
          styled="r"
          // style={isGroup ? { fontSize: '1.1em' } : undefined}
        />
      </span>
      {onItemChange
        ? fields.map((f) => (
            <EditableText
              key={f}
              className={className}
              style={styl}
              value={value[f]}
              id={f}
              onChange={changing}
              resetOnDone
              placeholder={f} //typeHint(isGroup ? groupTitle : itemTitle)
            />
          ))
        : fields.map((f) => (
            <span key={f} className={className} style={styl}>
              {value[f]}
            </span>
          ))}
      <ButtonGroup minimal>
        {onSelect && (
          <Button
            id={lid}
            prepend="search"
            iconStyle="r"
            onClick={onSelect}
          />
        )}
        {onDelete && (
          <ConfirmDeleteBtn
            id={lid}
            text={`this ${config.itemTitle}${
              isGroup ? ' group' : ''
            }`}
            toastText={
              toastDelete
                ? `${config.itemTitle}${isGroup ? ' group' : ''}`
                : undefined
            }
            onDelete={onDelete}
          />
        )}
      </ButtonGroup>
    </div>
  );
}
