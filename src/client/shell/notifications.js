import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
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
        data.id = nanoid(4);
        data.ttl = setTimeout(onRemove, ttl, data.id);
        toasts.current.push(data);
        setSignal(toasts.current.length);
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
              [`bg-${type}`]: type,
            })}>
            <Icon name={icon(type)} size="lg" fa />
            <span>{text}</span>
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
  report: PropTypes.func,
  closeOnBlur: PropTypes.bool,
};
export function Dialog({
  title,
  text,
  okText,
  cancelText = 'Close',
  report,
  closeOnBlur,
}) {
  const [result, setResult] = useState(0),
    accept = () => setResult(1),
    decline = () => setResult(-1),
    hidden = (ev) => {
      if (ev.animationName === 'modalout') {
        report?.(result);
      }
    },
    el = useRef(null),
    onBlur = () => {
      closeOnBlur && decline();
    };

  useEffect(() => {
    el.current?.focus();
  });

  return text ? (
    <div className="modal-root">
      <div
        ref={el}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex="0"
        onBlur={onBlur}
        onAnimationEnd={hidden}
        className={classNames([
          'modal',
          result ? 'modal-hide' : 'modal-show',
        ])}>
        <div className="modal-header">
          <h3>{title}</h3>
          <Button icon="times" minimal onClick={decline} />
        </div>
        <div className="modal-content lg">
          <p>{text}</p>
        </div>
        <div className="modal-footer">
          {okText && (
            <Button text={okText} icon="check" onClick={accept} />
          )}
          &nbsp;&nbsp;
          <Button text={cancelText} icon="times" onClick={decline} />
        </div>
      </div>
    </div>
  ) : null;
}
