import { useState } from 'react';
import PropTypes from 'prop-types';
import { useToaster, useDialog } from '@app/services';
import { Icon, Button, ButtonGroup } from '..';
import './button.css';

const sure = 'Are you sure?',
  title = 'Please, confirm',
  getText = (txt = 'item') =>
    `Are you sure you want to delete ${txt}`,
  okText = 'Confirm',
  cancelText = 'Cancel';

const ConfirmButton = ({
  dataid,
  onClick,
  message = sure,
  ...rest
}) => {
  const [open, setOpen] = useState(),
    clicked = () => {
      setOpen((s) => !s);
    },
    confirmed = () => {
      clicked();
      onClick && onClick(dataid);
    };
  return (
    <div className="container-relative">
      {open && (
        <div className="popover-content">
          <Icon name="question-circle" />
          <span>{message}</span>
          <ButtonGroup minimal>
            <Button append="check-circle" onClick={confirmed} />
            <Button prepend="times" onClick={clicked} />
          </ButtonGroup>
        </div>
      )}
      <Button {...rest} onClick={clicked} />
    </div>
  );
};

ConfirmButton.propTypes = {
  dataid: PropTypes.string,
  onClick: PropTypes.any,
  message: PropTypes.string,
};

export default ConfirmButton;

ConfirmDeleteBtn.propTypes = {
  id: PropTypes.string,
  text: PropTypes.string,
  toastText: PropTypes.string,
  onDelete: PropTypes.func,
};
export function ConfirmDeleteBtn({ id, text, toastText, onDelete }) {
  const dialog = useDialog(),
    toaster = useToaster(),
    onClick = async (ev) => {
      ev.stopPropagation();
      const res = await dialog({
        title,
        okText,
        cancelText,
        text: getText(text),
      });
      if (res) {
        onDelete?.(id);
        toastText && toaster.info(`${toastText} deleted`);
      }
    };
  return (
    <Button
      minimal
      onClick={onClick}
      // tooltip="Delete row"
      className="clip-icon close"></Button>
  );
}

EditorButtonGroup.propTypes = {
  editing: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onEditEnd: PropTypes.func,
  delText: PropTypes.string,
  saveDisabled: PropTypes.bool,
};
export function EditorButtonGroup({
  editing,
  onEdit,
  onEditEnd,
  onDelete,
  delText,
  saveDisabled,
  ...rest
}) {
  const dialog = useDialog(),
    onDel = async (ev) => {
      ev.stopPropagation();
      const res = await dialog({
        title,
        okText,
        cancelText,
        text: getText(delText),
      });
      if (res) onDelete();
    },
    onOK = () => onEditEnd(true),
    onCancel = () => onEditEnd();

  return (
    <div className="btn-group">
      {editing ? (
        <>
          <Button
            {...rest}
            prepend="times"
            text="Cancel"
            className="invert muted"
            onClick={onCancel}
          />
          <Button
            {...rest}
            prepend="save"
            className="invert normal"
            text="Save"
            disabled={saveDisabled}
            onClick={onOK}
          />
        </>
      ) : (
        <>
          <Button
            {...rest}
            prepend="edit"
            text="Edit"
            className="invert normal"
            onClick={onEdit}
          />
          <Button
            {...rest}
            prepend="trash-alt"
            className="invert danger"
            text="Remove"
            onClick={onDel}
          />
        </>
      )}
    </div>
  );
}
