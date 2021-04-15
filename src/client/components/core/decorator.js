import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Icon } from '.';
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
  blend: PropTypes.bool,
  minimal: PropTypes.bool,
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
  blend,
  minimal,
  // disabled,
  hasValue,
  children,
}) {
  return (
    <span
      className={classNames(['adorn', className], {
        minimal,
        blend,
        ['has-value']: hasValue,
      })}
      style={style}>
      {prepend && (
        <span className="adorn-left">
          <Icon name={prepend} />
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
              <Icon name={append} />
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
