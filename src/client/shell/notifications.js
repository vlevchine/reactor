import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { TOAST } from '@app/constants';
import { classNames } from '@app/helpers';
import { Icon, Button } from '@app/components/core';

const icons = {
    success: 'check-circle',
    info: 'info',
    danger: 'exclamation-triangle',
    warning: 'exclamation-circle',
  },
  icon = (t) => icons[t] || icons.info;
Toaster.propTypes = {
  store: PropTypes.object,
  ttl: PropTypes.number,
};
export function Toaster({ store, ttl }) {
  const toasts = useRef([]),
    [, setSignal] = useState(),
    onRemove = (id) => {
      const ind = toasts.current.findIndex((t) => t.id === id);
      toasts.current.splice(ind, 1);
      setSignal(toasts.current.length);
    },
    clear = (_, id) => {
      clearTimeout(id);
      onRemove(id);
    };

  useEffect(() => {
    const id = store.on(
      TOAST,
      (data) => {
        data.id = setTimeout(onRemove, ttl, data.id); //nanoid(4);
        toasts.current.unshift(data);
        setSignal(toasts.current.length);
        console.log(data.id);
      },
      true
    );

    return () => {
      store.off(TOAST, id);
    };
  }, []);

  return (
    <div className="toasts">
      <div className="toast-container">
        {toasts.current.map(({ id, type, text }) => (
          <div
            key={id}
            className={classNames(['toast'], {
              [`toast-${type}`]: type,
            })}>
            <span>
              <Icon name={icon(type)} size="lg" fa />
              <span>{text}</span>
            </span>
            {clear && (
              <Button icon="times" minimal id={id} onClick={clear} />
            )}
          </div>
        ))}
      </div>
    </div>
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
