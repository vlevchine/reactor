/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { useCollapsible, dropdownCloseRequest } from './helpers';
import { I, Info, getIcon } from '.';
import './styles.css';

Decorator.propTypes = {
  id: PropTypes.string,
  clear: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.bool,
    PropTypes.number,
  ]),
  appendType: PropTypes.string,
  children: PropTypes.any,
  append: PropTypes.string,
  className: PropTypes.string,
  prepend: PropTypes.string,
  intent: PropTypes.string,
  style: PropTypes.object,
  minimal: PropTypes.bool,
  underlined: PropTypes.bool,
  small: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  hasValue: PropTypes.bool,
};
export default function Decorator({
  append,
  appendType,
  prepend,
  className,
  style,
  intent,
  minimal,
  underlined,
  small,
  disabled,
  children,
}) {
  const klass = classNames(['adorn', className, intent], {
    prepend,
    minimal,
    underlined,
    small,
    disabled,
  });

  return (
    <span className={klass} style={style}>
      {prepend && (
        <span className="prepend">
          <I name={prepend} styled="l" />
        </span>
      )}
      {children}
      {append && (
        <Wrapper
          condition={!minimal}
          wrap={(c) => <span className="adorn-right">{c}</span>}>
          <>
            {appendType === 'text' ? (
              <span>{append}</span>
            ) : appendType === 'clip' ? (
              <i className={`clip-icon ${append}`} />
            ) : (
              <I name={append} />
            )}
          </>
        </Wrapper>
      )}
    </span>
  );
}

Wrapper.propTypes = {
  condition: PropTypes.bool,
  wrap: PropTypes.func,
  children: PropTypes.any,
};
function Wrapper({ condition, wrap, children }) {
  return condition ? wrap(children) : children;
}

Decorate.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  minimal: PropTypes.bool,
  underline: PropTypes.bool,
  disabled: PropTypes.bool,
  prepend: PropTypes.string,
  append: PropTypes.string,
  dropdown: PropTypes.any,
  intent: PropTypes.string,
  hint: PropTypes.string,
  collapseTrigger: PropTypes.string,
  className: PropTypes.string,
  uncontrolled: PropTypes.bool,
  style: PropTypes.object,
  clear: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  setHidenInputValue: PropTypes.func,
  children: PropTypes.any,
  animate: PropTypes.object,
};
//1) enanbles prepend and append icons;
//2) adds clear button;
//3) adds a movable label, assuming children supply input
//4) calls useCollapsible which provides dropdown,
//if dropdown bool property is set in props and an element with data-collapse is in children
//provide animate prop to change default animation
//collapseTrigger - button icon name -if a button will only triggers dropdown
export function Decorate(props) {
  const {
      children,
      label,
      id,
      prepend, //icon name - places icon on the left
      append, //icon name - places icon on the right
      dropdown,
      collapseTrigger, //icon name - places <button data-collapse-trigger/> as the last element
      className,
      disabled,
      minimal,
      underline,
      intent,
      hint,
      style,
      clear,
    } = props,
    clearUp = (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      if (dropdown) dropdownCloseRequest(id);
      clear();
    },
    //if animate is in props, collapsible is initiated
    ref = dropdown ? useCollapsible(dropdown, id) : useRef();
  useLayoutEffect(() => {
    const input = ref.current.querySelector('input');
    if (input) {
      input.setAttribute('id', id);
      input.setAttribute('spellcheck', false);
      input.setAttribute('placeholder', ' ');
      input.classList.add('trigger', 'no-border');
    }
  });

  return (
    <div
      ref={ref}
      data-prepend={getIcon(prepend)}
      data-append={getIcon(append)}
      className={classNames(['decor border', intent, className], {
        minimal,
        underline,
        disabled,
      })}
      style={style}>
      {dropdown && (
        <div
          data-collapse
          role="button"
          tabIndex="0"
          className={dropdown.className}>
          {dropdown.component}
        </div>
      )}
      {children}
      {label && (
        <label htmlFor={id} className="lbl">
          {label}
          {hint && <Info text={hint} />}
        </label>
      )}
      {clear && !disabled && (
        <button
          data-clear
          className="btn minimal"
          onClickCapture={clearUp}>
          &#x2716;
        </button>
      )}
      {collapseTrigger && (
        <button
          tabIndex="-1"
          data-collapse-trigger
          className="btn minimal cursor-pointer"
          disabled={disabled}>
          <I name={collapseTrigger} />
        </button>
      )}
    </div>
  );
}
