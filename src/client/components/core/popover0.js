/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import { getIcon, ClearButton } from './helpers';
import { Portal } from '../index';
import classes from './styles.css';

const Popover = forwardRef((props, ref) => {
  const {
      id,
      header,
      place = 'bottom',
      toggleIcon,
      icon,
      light,
      minimal,
      clear,
      fill,
      disabled,
      style,
      contentClass,
      onOpen,
      onClose,
      children,
    } = props,
    coords = useRef(),
    lbl = useRef(),
    pop = useRef(),
    scrollPos = useRef(),
    main = document.getElementById('appMain'),
    [on, setOn] = useState(false),
    rightIcon =
      toggleIcon &&
      (_.isString(toggleIcon) ? toggleIcon : 'chevron-down'),
    klass = classNames([classes.popoverTarget], {
      [classes.iconBefore]: icon,
      [classes.minimal]: minimal,
      [classes.fill]: fill,
      [classes.light]: light,
      [classes.withClearBtn]: clear,
      [classes.disabled]: disabled,
    }),
    hide = (ev) => {
      scrollPos.current = main.scrollTop;
      if (pop.current && !pop.current.contains(ev?.relatedTarget))
        pop.current.classList.add(classes.fadeOut);
    },
    animated = (ev) => {
      if (ev.animationName === classes.reveal) {
        pop.current.focus();
        pop.current.classList.remove(classes.fadeIn);
        onOpen?.();
      } else {
        pop.current.classList.remove(classes.fadeOut);
        setOn(false);
        onClose?.();
      }
      main.scrollTop = scrollPos.current;
    },
    onClick = () => {
      const tgt = lbl.current,
        { x, y, bottom, height, width } = tgt.getBoundingClientRect(),
        rec = main.getBoundingClientRect();
      if (place === 'top')
        coords.current = {
          left: x - rec.x + width / 2,
          bottom: rec.bottom - bottom - main.scrollTop + height,
        };
      if (place === 'bottom')
        coords.current = {
          left: x - rec.x,
          top: y - rec.y + main.scrollTop + height,
        };
      if (place === 'right')
        coords.current = {
          left: x - rec.x + tgt.offsetWidth + 2, //1rem
          top: y - rec.y + main.scrollTop,
        };
      coords.current.minWidth = width;
      if (on) {
        //blur();
      } else {
        setOn(true);
      }
      scrollPos.current = main.scrollTop;
    };
  if (ref) ref.current = { hide };

  return (
    <>
      <div
        ref={lbl}
        htmlFor={id}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
        role="button"
        tabIndex="0"
        onClick={onClick}
        data-before={getIcon(icon)}
        style={style}
        className={klass}>
        {header}
        {toggleIcon && (
          <span
            className={classes.iconAfter}
            data-after={getIcon(rightIcon)}
          />
        )}
        {clear && <ClearButton onClick={clear} disabled={disabled} />}
      </div>
      <Portal id="dropdown" type="main">
        {on && (
          <div
            ref={pop}
            role="button"
            tabIndex="0"
            onBlur={hide}
            onAnimationEnd={animated}
            className={classNames([
              contentClass,
              classes.popoverContent,
              classes.fadeIn,
            ])}
            style={coords.current}>
            {children}
          </div>
        )}
      </Portal>
    </>
  );
});
/* eslint-disable jsx-a11y/click-events-have-key-events */
// import React, {
//   useRef,
//   useState,
//   forwardRef,
//   useImperativeHandle,
// } from 'react';
// import PropTypes from 'prop-types';
// import { classNames, _ } from '@app/helpers';
// import { getIcon, ClearButton } from './helpers';
// import classes from './styles.css';

// const { isString } = _;
// const placement = (name) => classes[`place-${name}`];
// const Popover = forwardRef(
//   (
//     {
//       id,
//       icon,
//       header,
//       toggleIcon,
//       content,
//       place = 'bottom',
//       clear,
//       disabled,
//       minimal,
//       hover,
//       style = {},
//       className,
//       contentClass,
//       onOpen,
//       onClose,
//     },
//     ref
//   ) => {
//     const cntPanel = useRef(),
//       hdrPanel = useRef(),
//       container = useRef(),
//       rightIcon =
//         toggleIcon &&
//         (isString(toggleIcon) ? toggleIcon : 'chevron-down'),
//       [open, setOpen] = useState(false),
//       classAfter = toggleIcon && classes.iconAfter,
//       klass = classNames([classes.popoverTarget, classAfter], {
//         [classes.iconBefore]: icon,
//         [classes.minimal]: minimal,
//         [classes.withClearBtn]: clear,
//         [classes.disabled]: disabled,
//       }),
//       onClick = (ev) => {
//         //ev.stopPropagation();
//         //ev.preventDefault();
//         if (disabled) return;
//         setOpen(!open);
//         if (open) {
//           onClose?.();
//         } else {
//           onOpen?.();
//           cntPanel.current?.focus();
//         }
//       },
//       onContent = (ev) => {
//         ev.preventDefault();
//       },
//       blurred = (ev) => {
//         if (!open) return;
//         const onHeader = hdrPanel.current.contains(ev.relatedTarget),
//           onContainer = container.current.contains(ev.relatedTarget);

//         if (!onContainer || (onContainer && !onHeader)) {
//           setOpen(false);
//           onClose?.();
//         }
//       },
//       onEnter = hover ? () => setOpen(true) : undefined,
//       onLeave = hover ? () => setOpen(false) : undefined;

//     useImperativeHandle(ref, () => ({
//       hide() {
//         setOpen(false);
//       },
//     }));

//     return (
//       <div
//         tabIndex="-1"
//         ref={container}
//         onMouseEnter={onEnter}
//         onMouseLeave={onLeave}
//         className={classNames([className, classes.popover], {
//           [classes.minimal]: minimal,
//         })}>
//         <input
//           id={id}
//           type="checkbox"
//           autoComplete="off"
//           checked={open}
//           onChange={onClick}
//         />
//         <label
//           htmlFor={id}
//           ref={hdrPanel}
//           // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
//           role="button"
//           tabIndex="0"
//           data-before={getIcon(icon)}
//           data-after={getIcon(rightIcon)}
//           style={style}
//           className={klass}>
//           {header}
//           {clear && (
//             <ClearButton onClick={clear} disabled={disabled} />
//           )}
//           <div
//             id="content"
//             ref={cntPanel}
//             onBlur={blurred}
//             role="button"
//             onClick={onContent}
//             tabIndex="0"
//             className={classNames([
//               classes.popoverContent,
//               placement(place),
//               contentClass,
//             ])}>
//             {content}
//           </div>
//         </label>
//       </div>
//     );
//   }
// );

Popover.propTypes = {
  id: PropTypes.string,
  icon: PropTypes.string,
  isOpen: PropTypes.bool,
  children: PropTypes.any,
  header: PropTypes.object,
  fill: PropTypes.bool,
  place: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  contentClass: PropTypes.string,
  clear: PropTypes.func,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  hover: PropTypes.bool,
  disabled: PropTypes.bool,
  minimal: PropTypes.bool,
  light: PropTypes.bool,
  optionsLight: PropTypes.bool,
  toggleIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

export default Popover;
