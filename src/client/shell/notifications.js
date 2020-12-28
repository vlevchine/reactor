import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Observable } from '@app/utils/observable';
import { Modal, Toaster } from '@app/components/common';

const toaster = new Observable('toaster'),
  dialog = new Observable('dialog'),
  service = {
    dialog(item) {
      dialog.onSuccess({ ...item, cancel: true });
    },
    confirm(item) {
      dialog.onSuccess({ ...item, cancel: true, cancelText: 'OK' });
    },
    info(item) {
      dialog.onSuccess({ ...item, cancel: false });
    },
    toast(item) {
      toaster.onSuccess(item);
    },
    hide() {
      dialog.onSuccess();
    },
  };

const Notifier = ({ manualCloseToast = false }) => {
  const [toast, setToast] = useState(),
    [modal, setModal] = useState();

  useEffect(() => {
    const t_key = toaster.subscribe(setToast),
      m_key = dialog.subscribe(setModal);

    return () => {
      toaster.unsubscribe(t_key);
      dialog.unsubscribe(m_key);
    };
  }, []);
  return (
    <>
      <Toaster toast={toast} manualOnly={manualCloseToast} />
      <Modal {...modal} show={!!modal}></Modal>
    </>
  );
};
Notifier.propTypes = {
  manualCloseToast: PropTypes.bool,
};
export default service;
export { Notifier };
//toasterService
// show,
// title,
// text,
// okText = 'OK',
// cancelText = 'Cancel',
// cancel = true,
// onAction,
