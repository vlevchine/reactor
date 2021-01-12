import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import { getIcon } from './icon';
import './styles.css';

DelBtnWrapper.propTypes = {
  content: PropTypes.any,
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  fill: PropTypes.bool,
  onChange: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
};
export function DelBtnWrapper({
  content,
  id,
  onChange,
  className,
  style,
  fill,
}) {
  const onDelBtn = (ev) => {
    if (ev.target.dataset.id !== 'title') {
      ev.preventDefault();
      onChange?.(undefined, id);
    }
  };

  return (
    <span
      role="button"
      tabIndex="0"
      className={classNames([className], {
        fill,
        ['del-btn-wrapper']: !!onChange,
      })}
      style={style}
      onKeyDown={_.noop}
      onClick={onDelBtn}>
      <span data-id="title" className="del-btn-title">
        {content}
      </span>
    </span>
  );
}

Decorator.propTypes = {
  id: PropTypes.string,
  clear: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.bool,
    PropTypes.number,
  ]),
  fill: PropTypes.bool,
  children: PropTypes.any,
  info: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.string,
  style: PropTypes.object,
  blend: PropTypes.bool,
  minimal: PropTypes.bool,
  onChange: PropTypes.func,
  hasValue: PropTypes.bool,
};
export default function Decorator({
  id,
  clear,
  fill,
  info,
  icon,
  className,
  style,
  blend,
  minimal,
  children,
  hasValue,
  onChange,
}) {
  const onDelBtn = (ev) => {
      if (ev.target.className.includes('del-btn')) {
        ev.preventDefault();
        onChange?.(undefined, id);
      }
    },
    infoIcon = getIcon(info),
    infoTxt = infoIcon === info;

  return (
    <span
      className={classNames([className], {
        ['with-icons i-fa i-l i-fa']: icon || info,
        ['with-btn']: clear,
        ['i-txt']: infoTxt,
        minimal,
        blend,
        fill,
      })}
      data-before={info ? getIcon(icon) : undefined}
      data-after={infoIcon || undefined}
      style={style}>
      {children}
      {clear && hasValue && (
        <span
          role="button"
          tabIndex="0"
          className={classNames(['with-icons i-fa i-r del-btn'], {
            on: clear > 1,
          })}
          data-before={getIcon('times')}
          onKeyDown={_.noop}
          onClick={onDelBtn}></span>
      )}
    </span>
  );
}
