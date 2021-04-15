import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Button, Portal } from '@app/components/core';

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
  cancelText = 'Cancel',
  report,
  closeOnBlur,
}) {
  const [result, setResult] = useState(0),
    accept = () => setResult(1),
    decline = () => setResult(-1),
    hidden = (ev) => {
      if (ev.animationName === 'modalout') {
        report?.(result > 0);
        setResult(0);
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
    <Portal className="modal-root">
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
          <Button prepend="times" minimal onClick={decline} />
        </div>
        <div className="modal-content lg">
          <p>{text}</p>
        </div>
        <div className="modal-footer">
          {okText && (
            <Button text={okText} prepend="check" onClick={accept} />
          )}
          &nbsp;&nbsp;
          <Button
            text={cancelText}
            prepend="times"
            onClick={decline}
          />
        </div>
      </div>
    </Portal>
  ) : null;
}
