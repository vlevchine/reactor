import { useReducer, useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Observable } from '@app/utils/observable';
import { Button, Portal } from '@app/components/core';
import Form, { Validator } from '@app/formit';

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
  text: PropTypes.string,
  title: PropTypes.string,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  report: PropTypes.func,
  closeOnBlur: PropTypes.bool,
};
function Dialog({ okText = 'Ok', closeOnBlur }) {
  const accept = () => dispatch({ result: 1 }),
    decline = () => dispatch({ result: -1 }),
    [state, dispatch] = useReducer(reducer, {
      result: 0,
      invalid: true,
    }),
    { result, data, invalid } = state,
    validator = useRef(new Validator()),
    hidden = (ev) => {
      if (ev.animationName === 'modalout') {
        const res = data.form
          ? { ok: result > 0, data: state.formData }
          : result > 0;
        resolver?.(res);
        resolver = undefined;
        dispatch({
          result: 0,
          data: undefined,
          invalid: true,
          formData: undefined,
        });
      }
    },
    el = useRef(null),
    onBlur = () => {
      closeOnBlur && decline();
    },
    onChange = (formData) => {
      validator.current.validate(data.form.items, formData);
      dispatch({ formData });
    },
    onValidate = () => {
      dispatch({ invalid: !validator.current.isValid() });
    };

  useEffect(() => {
    const key = notifier.subscribe({
        next(data) {
          dispatch({ data });
        },
      }),
      subscription = validator.current.subscribe(onValidate);

    return () => {
      notifier.unsubscribe(key);
      validator.current.unsubscribe(subscription);
    };
  }, []);

  useEffect(() => {
    //!!!!!!
    //Now, form starts as invalid, i.e at least one field is required
    //to allow OK button enabled on start, can set invalid to false
    //when new data comes -> below
    //   data && dispatch({invalid: data.okByDefault})
    el.current?.focus();
  }, [data]);

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
        <div className="modal-content">
          <h6>{data.text}</h6>
          {data.form ? (
            <Form
              def={data.form}
              onChange={onChange}
              validator={validator.current}
            />
          ) : (
            data.content
          )}
        </div>
        <div className="modal-footer">
          <Button
            text={data.okText || okText}
            prepend="check"
            disabled={data.form && invalid}
            onClick={accept}
          />
          &nbsp;&nbsp;
          {data.cancelText && (
            <Button
              text={data.cancelText}
              prepend="times"
              onClick={decline}
            />
          )}
        </div>
      </div>
    </Portal>
  ) : null;
}
export default memo(Dialog);

export function useDialog() {
  return (msg) => {
    notifier.onSuccess(msg);
    return new Promise((resolve) => {
      resolver = resolve;
    });
  };
}
