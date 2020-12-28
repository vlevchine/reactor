import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import Overlay from './overlay';
import Button from './button';
import classes from './styles.css';

const modal = classes['modal'],
  modalShow = classes['modal-show'],
  header = classes['modal-header'],
  footer = classes['modal-footer'];

const Modal = ({
  show,
  title,
  text,
  okText = 'OK',
  cancelText = 'Cancel',
  cancel,
  onAction,
}) => {
  const [open, setOpen] = useState(show),
    onCancel = () => {
      setOpen(false);
      onAction?.(false);
    },
    onOK = () => {
      setOpen(false);
      onAction?.(true);
    };
  useEffect(() => {
    setOpen(show);
  }, [show]);

  return (
    <>
      <div
        className={classNames([modal], {
          [modalShow]: open,
        })}>
        <div className={header}>
          <h3>{title}</h3>
          {cancel && (
            <Button icon="times" minimal onClick={onCancel} />
          )}
        </div>
        <div
          className={classNames([classes.modalContent, classes.lg])}>
          <p>{text}</p>

          <div className={footer}>
            {onAction && (
              <Button
                text={okText}
                icon="check"
                minimal
                onClick={onOK}
              />
            )}
            &nbsp;&nbsp;
            {cancel && (
              <Button
                text={cancelText}
                icon="times"
                minimal
                onClick={onCancel}
              />
            )}
          </div>
        </div>
      </div>
      <Overlay show={open} />
    </>
  );
};

Modal.propTypes = {
  show: PropTypes.bool,
  text: PropTypes.string,
  title: PropTypes.string,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  cancel: PropTypes.bool,
  onAction: PropTypes.func,
};
export default Modal;
