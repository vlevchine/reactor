/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { useCollapsible } from './helpers';
import { I, getIcon } from '.';
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
  readonly: PropTypes.bool,
  prepend: PropTypes.string,
  append: PropTypes.string,
  dropdown: PropTypes.any,
  intent: PropTypes.string,
  collapseTrigger: PropTypes.string,
  className: PropTypes.string,
  uncontrolled: PropTypes.bool,
  style: PropTypes.object,
  clear: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  onDropdownClick: PropTypes.func,
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
      readonly,
      disabled,
      minimal,
      underline,
      intent,
      style,
      clear,
      onDropdownClick,
      //setHidenInputValue,
    } = props,
    clearUp = (ev) => {
      ev.target.blur();
      ev.stopImmediatePropagation?.();
      clear();
    },
    noEdit = disabled || readonly,
    // setHiddenValue = (val) => {
    //   const input = ref.current.querySelector('input');
    //   if (setHidenInputValue && input?.classList.contains('hide'))
    //     input.value = setHidenInputValue(val) || '';
    // },
    //if animate is in props, collapsible is initiated
    ref = dropdown ? useCollapsible(props) : useRef();
  useLayoutEffect(() => {
    const input = ref.current.querySelector('input');
    if (input) {
      input.setAttribute('id', id);
      input.setAttribute('spellcheck', false);
      input.setAttribute('placeholder', ' ');
      input.classList.add('trigger', 'no-border');
    }
  });
  //console.log(input?.value)
  return (
    <div
      ref={ref}
      data-prepend={readonly ? undefined : getIcon(prepend)}
      data-append={getIcon(append)}
      className={classNames(['decor border', intent, className], {
        minimal: minimal || readonly,
        underline,
      })}
      style={style}>
      {dropdown && (
        <div data-collapse>
          <div
            className="options"
            role="button"
            tabIndex="0"
            onClick={onDropdownClick}>
            {dropdown}
          </div>
        </div>
      )}
      {children}
      <label htmlFor={id} className="lbl">
        {label}
      </label>
      {clear && !noEdit && (
        <button data-clear className="btn minimal" onClick={clearUp}>
          &#x2716;
        </button>
      )}
      {collapseTrigger && (
        <button
          data-collapse-trigger
          className="btn minimal"
          disabled={noEdit}>
          <I name={collapseTrigger} />
        </button>
      )}
    </div>
  );
}
