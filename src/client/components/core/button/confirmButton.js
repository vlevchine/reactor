import { useState } from 'react';
import PropTypes from 'prop-types';
import { useToaster, useDialog } from '@app/services';
import { Icon, Button, ButtonGroup } from '..';
import './button.css';

const sure = 'Are you sure?';

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
        title: 'Please, confirm',
        text: `Are you sure you want to delete ${text}`,
        okText: 'Confirm',
        cancelText: 'Cancel',
      });
      if (res) {
        onDelete?.(id);
        toaster.info(`${toastText} deleted`);
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
