import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Portal } from '.';
import { classNames } from '@app/helpers';
import './styles.css';

// const drawer = classes['drawer'],
//   drawerShow = classes['drawer-show'],
//   header = classes['drawer-header'],
//   content = classes['drawer-content'],
//   btn = classes['drawer-btn'];

Drawer.propTypes = {
  cmd: PropTypes.symbol,
  width: PropTypes.string,
  title: PropTypes.string,
  ratio: PropTypes.number,
  onClose: PropTypes.func,
  children: PropTypes.any,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  report: PropTypes.func,
};

export default function Drawer({
  cmd,
  children,
  title,
  okText = 'OK',
  cancelText = 'Close',
  ratio = 50,
  onClose,
}) {
  const [result, setResult] = useState(0),
    [open, setOpen] = useState(!!cmd),
    accept = () => setResult(1),
    reject = () => setResult(-1),
    endAnimate = (ev) => {
      if (ev.animationName === 'drawerout') {
        setOpen(false);
        onClose?.(result > 0);
      } else if (ev.animationName === 'drawerin') el.current?.focus();
    },
    el = useRef(null),
    onBlur = () => {
      console.log('close');
      reject();
    };

  useEffect(() => {
    setOpen(!!cmd);
    setResult(0);
  }, [cmd]);

  return open ? (
    <Portal className="modal-root">
      <div
        ref={el}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex="0"
        onBlur={onBlur}
        onAnimationEnd={endAnimate}
        style={{
          width: open ? `${ratio}vw` : 0,
          marginLeft: `${100 - ratio}vw`,
        }}
        className={classNames(['drawer'], {
          ['drawer-show']: result === 0,
          ['drawer-hide']: result !== 0,
        })}>
        <div className="modal-header">
          <h3>{title}</h3>
          <Button icon="times" minimal onClick={reject} />
        </div>
        <div className="modal-content lg">{children}</div>
        <div className="modal-footer">
          <Button text={cancelText} icon="times" onClick={reject} />
          &nbsp;&nbsp;
          {okText && (
            <Button text={okText} icon="check" onClick={accept} />
          )}
        </div>
      </div>
    </Portal>
  ) : null;
}
