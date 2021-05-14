import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { classNames } from '@app/helpers';
import { Observable } from '@app/utils/observable';
import { Icon, IconSymbol, Button } from '@app/components/core';

// usage:
//const toaster = useToaster();
//toaster.info('Hello',true) - second params used  to show clear btn

const notifier = new Observable();
const toast = (msg) => {
    notifier.onSuccess(msg);
  },
  types = ['info', 'danger', 'warning', 'success'],
  getToaster = () =>
    types.reduce(
      (acc, e) => ({
        ...acc,
        [e]: (text, clear) => toast({ type: e, text, clear }),
      }),
      Object.create(null)
    ),
  icons = {
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
export default function Toaster({ ttl }) {
  const [toasts, setToasts] = useState([]),
    onRemove = (id) => {
      setToasts(toasts.filter((t) => t.id !== id));
    },
    clearUp = (_, id) => {
      clearTimeout(id);
      onRemove(id);
    };

  useEffect(() => {
    const key = notifier.subscribe({
      next(data) {
        data.id = nanoid(4);
        data.ttl = setTimeout(onRemove, ttl, data.id);
        setToasts((t) => [...t, data]);
      },
    });

    return () => notifier.unsubscribe(key);
  }, []);

  return (
    <div className="toasts">
      <div className="toast-container">
        {toasts.map(({ id, type, text, clear }) => (
          <div
            key={id}
            className={classNames(['toast'], {
              [`${type}-invert`]: type,
            })}>
            <Icon name={icon(type)} size="lg" />
            <span>{text}</span>
            {clear && (
              <Button minimal id={id} onClick={clearUp}>
                <IconSymbol name="times" size="l-1" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function useToaster() {
  return getToaster();
}
