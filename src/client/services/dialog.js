import { useReducer, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Observable } from '@app/utils/observable';
import { Button, Portal } from '@app/components/core';

// usage:
//const dialog = useDialog();
// var res = await dialog({
//   title: 'Please, confirm',
//   text: 'Are you sure you want to delete selected row',
//   okText: 'Confirm',
//   cancelText: 'Cancel',
// });
//if cancelText not defined, one button 'OK' is displayed
const notifier = new Observable();
let resolver;
function reducer(state, msg) {
  return { ...state, ...msg };
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
export default function Dialog({ okText = 'Ok', closeOnBlur }) {
  const accept = () => dispatch({ result: 1 }),
    decline = () => dispatch({ result: -1 }),
    [state, dispatch] = useReducer(reducer, { result: 0 }),
    { result, data } = state,
    hidden = (ev) => {
      if (ev.animationName === 'modalout') {
        resolver?.(result > 0);
        resolver = undefined;
        dispatch({ result: 0, data: undefined });
      }
    },
    el = useRef(null),
    onBlur = () => {
      closeOnBlur && decline();
    };

  useEffect(() => {
    const key = notifier.subscribe({
      next(data) {
        dispatch({ data });
      },
    });
    return () => notifier.unsubscribe(key);
  }, []);

  useEffect(() => {
    el.current?.focus();
  });

  return data ? (
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
          <h3>{data.title}</h3>
          <Button prepend="times" minimal onClick={decline} />
        </div>
        <div className="modal-content lg">
          <p>{data.text}</p>
        </div>
        <div className="modal-footer">
          <Button
            text={data.okText || okText}
            prepend="check"
            className="lg-1"
            onClick={accept}
          />
          &nbsp;&nbsp;
          {data.cancelText && (
            <Button
              text={data.cancelText}
              prepend="times"
              className="lg-1"
              onClick={decline}
            />
          )}
        </div>
      </div>
    </Portal>
  ) : null;
}

export function useDialog() {
  return (msg) => {
    notifier.onSuccess(msg);
    return new Promise((resolve) => {
      resolver = resolve;
    });
  };
}
