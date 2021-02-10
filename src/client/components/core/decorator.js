import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Icon, Button, IconSymbol } from '.';
import './styles.css';

// DelBtnWrapper.propTypes = {
//   content: PropTypes.any,
//   id: PropTypes.string,
//   className: PropTypes.string,
//   style: PropTypes.object,
//   fill: PropTypes.bool,
//   onChange: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
// };
// export function DelBtnWrapper({
//   content,
//   id,
//   onChange,
//   className,
//   style,
//   fill,
// }) {
//   const onDelBtn = (ev) => {
//     if (ev.target.dataset.id !== 'title') {
//       ev.preventDefault();
//       onChange?.(undefined, id);
//     }
//   };

//   return (
//     <span
//       role="button"
//       tabIndex="0"
//       className={classNames([className], {
//         fill,
//         ['del-btn-wrapper']: !!onChange,
//       })}
//       style={style}
//       onKeyDown={_.noop}
//       onClick={onDelBtn}>
//       <span data-id="title" className="del-btn-title">
//         {content}
//       </span>
//     </span>
//   );
// }

Decorator.propTypes = {
  id: PropTypes.string,
  clear: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.bool,
    PropTypes.number,
  ]),
  infoText: PropTypes.bool,
  children: PropTypes.any,
  info: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.string,
  intent: PropTypes.string,
  style: PropTypes.object,
  blend: PropTypes.bool,
  minimal: PropTypes.bool,
  onChange: PropTypes.func,
  hasValue: PropTypes.bool,
};

export default function Decorator({
  id,
  clear,
  info,
  infoText,
  icon,
  intent,
  className,
  style,
  blend,
  minimal,
  hasValue,
  children,
  onChange,
}) {
  const onClear = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    onChange?.(undefined, id);
  };

  return (
    <span
      className={classNames(['adorn', className], {
        minimal,
        blend,
        ['has-value']: hasValue,
        [intent]: intent,
      })}
      style={style}>
      {icon && (
        <span className="adorn-left">
          <Icon name={icon} />
        </span>
      )}
      {children}
      {clear && (
        <Button minimal onClick={onClear} role="deletion">
          <IconSymbol name="times-s" />
        </Button>
      )}
      {info && (
        <span className="adorn-right">
          {infoText ? info : <Icon name={info} />}
        </span>
      )}
    </span>
  );
}
