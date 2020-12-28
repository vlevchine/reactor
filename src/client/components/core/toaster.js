import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import Icon from './icon';
import Button from './button';
import classes from './styles.css';

const icons = {
    success: 'check-circle',
    info: 'info',
    warning: 'exclamation-triangle',
    danger: 'exclamation-circle',
  },
  icon = (t = 'info') => icons[t],
  ttl = 7500;
const Toaster = ({ toast, canClose = true, manualOnly }) => {
  const vals = useRef([]),
    [, setActive] = useState(0),
    //[toasts, setToasts] = useState([]),
    remove = (id) => {
      const toasts = vals.current,
        ind = toasts.findIndex((e) => e.id === id),
        val = toasts[ind];
      if (!val) return;
      val.timeout && clearTimeout(val.timeout);
      vals.current.splice(ind, 1);
      setActive(vals.current.length);
    },
    clear = (ev, id) => remove(id);

  useEffect(() => {
    if (!toast?.text) return;
    const id = Date.now();
    Object.assign(toast, {
      id,
      timeout: !manualOnly && setTimeout(remove, ttl, id),
    });
    vals.current.unshift(toast);
    setActive(vals.current.length);
  }, [toast]);
  useEffect(() => {
    return () => {
      for (const t in vals.current) {
        clearTimeout(t.timeout);
      }
      vals.current.length = 0;
    };
  }, []);

  return (
    <div className={classes.toastContainer}>
      {vals.current.map(({ id, text, type }) => (
        <div
          key={id}
          className={classNames([classes.toast], {
            [classes[`toast-${type}`]]: type,
            //[classes.toastVisible]: active,
          })}>
          <Icon
            name={icon(type)}
            style={{ padding: '0.6rem' }}
            size="lg"
          />
          <span>{text}</span>
          {canClose && (
            <Button icon="times" minimal id={id} onClick={clear} />
          )}
        </div>
      ))}
    </div>
  );
};

Toaster.propTypes = {
  toast: PropTypes.object,
  canClose: PropTypes.bool,
  manualOnly: PropTypes.bool,
};

export default Toaster;
