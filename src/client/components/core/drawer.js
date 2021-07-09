import { useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { IconSymbol, Button, Portal } from '.';
import { classNames } from '@app/helpers';
import './styles.css';

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
function reducer(state, msg) {
  return { ...state, ...msg };
}

export default function Drawer({
  cmd,
  children,
  title,
  okText = 'OK',
  cancelText = 'Cancel',
  ratio = 50,
  onClose,
}) {
  const [state, dispatch] = useReducer(reducer, {
      result: 0,
    }),
    accept = () => dispatch({ result: 1 }),
    reject = () => dispatch({ result: -1 }),
    endAnimate = (ev) => {
      if (ev.animationName === 'drawerout') {
        onClose?.(result > 0);
        dispatch({ open: false, result: 0 });
      } else if (ev.animationName === 'drawerin') el.current?.focus();
    },
    { result, open } = state,
    el = useRef(null),
    onBlur = (ev) => {
      if (
        !ev.relatedTarget &&
        ev.target?.getAttribute('role') !== 'deletion'
      ) {
        // console.log(reject);
      }
    };

  useEffect(() => {
    if (open === undefined) {
      dispatch({ open: false, result: 0 });
    } else dispatch({ open: true, result: 0 });
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
          <h5>{title}</h5>
          <Button onClick={reject} minimal>
            <IconSymbol name="times" size="md" />
          </Button>
        </div>
        <div className="modal-content">{children}</div>
        <div className="modal-footer">
          <Button onClick={reject} className="muted invert">
            <IconSymbol name="times" size="md" />
            <span>{cancelText}</span>
          </Button>
          &nbsp;&nbsp;
          {okText && (
            <Button onClick={accept} className="info invert">
              <IconSymbol name="checkmark" size="md" />
              <span>{okText}</span>
            </Button>
          )}
        </div>
      </div>
    </Portal>
  ) : null;
}
