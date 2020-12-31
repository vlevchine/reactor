import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { TOAST } from '@app/constants';
import { classNames } from '@app/helpers';
import { Portal } from '@app/components';
import { Toast, Button } from '@app/components/core';

ToasterService.propTypes = {
  store: PropTypes.object,
  ttl: PropTypes.number,
};
export function ToasterService({ store }) {
  const toasts = useRef([]),
    [, setSignal] = useState(),
    onRemove = (id) => {
      const ind = toasts.current.findIndex((t) => t.id === id);
      toasts.current.splice(ind, 1);
      setSignal(toasts.current.length);
    },
    clear = (_, id) => {
      onRemove(id);
    };

  useEffect(() => {
    const id = store.on(TOAST, (data) => {
      data.id = nanoid(4);
      toasts.current.unshift(data);
      setSignal(toasts.current.length);
      //setTimeout(onRemove, ttl, data.id);
    });

    return () => {
      store.off(TOAST, id);
    };
  }, []);

  return (
    <Portal className="toasts">
      <div className="toast-container">
        {toasts.current.map((t) => (
          <Toast key={t.id} {...t} clear={clear} />
        ))}
      </div>
    </Portal>
  );
}

Dialog.propTypes = {
  store: PropTypes.object,
  onClose: PropTypes.func,
  text: PropTypes.string,
  title: PropTypes.string,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  onOK: PropTypes.func,
};
export function Dialog({
  title,
  text,
  okText = 'OK',
  cancelText = 'Cancel',
  onClose,
  onOK,
}) {
  const [hide, setHide] = useState(),
    closing = () => {
      setHide(true);
    },
    hidden = (ev) => {
      if (ev.animationName === 'modalout') {
        setHide(false);
        onClose?.('yes');
      }
    };
  //{...data}
  return (
    <div id="modal-root">
      {text ? (
        <div className="modal-root">
          <div
            onAnimationEnd={hidden}
            className={classNames([
              'modal',
              hide ? 'modal-hide' : 'modal-show',
            ])}>
            <div className="modal-header">
              <h3>{title}</h3>
              <Button icon="times" minimal onClick={onClose} />
            </div>
            <div className="modal-content lg">
              <p>{text}</p>
            </div>
            <div className="modal-footer">
              {onOK && (
                <Button
                  text={okText}
                  icon="check"
                  minimal
                  onClick={onOK}
                />
              )}
              &nbsp;&nbsp;
              {onClose && (
                <Button
                  text={cancelText}
                  icon="times"
                  // minimal
                  onClick={closing}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
