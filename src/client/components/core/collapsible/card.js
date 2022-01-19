import { Children, useMemo } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { I } from '..';
import { useCollapsible } from '../helpers';
import { classNames } from '@app/helpers';
import './styles.css';

Card.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.any,
  open: PropTypes.bool,
  noBorder: PropTypes.bool,
  titleUnderline: PropTypes.bool,
  style: PropTypes.object,
};
const animate = { duration: 200 };
export default function Card(props) {
  const {
      id,
      title,
      children,
      open,
      titleUnderline,
      noBorder,
      style,
    } = props,
    _id = useMemo(() => id || nanoid(4)),
    ref = useCollapsible({ animate }, _id, open);
  return (
    <section
      ref={ref}
      className={classNames(['card expand-inline flex-column'], {
        border: !noBorder,
        ['title-underline']: titleUnderline,
      })}
      style={style}>
      <div className="justaposed full-width">
        <h6 className="uppercase">{title}</h6>
        <I
          name="caret-right"
          data-collapse-trigger
          size="lg"
          styled="s"
          className="align-center rotate"></I>
      </div>
      <div data-collapse>
        <div className="card-content">{children}</div>
      </div>
    </section>
  );
}

CardStack.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  open: PropTypes.bool,
  titleUnderline: PropTypes.bool,
  style: PropTypes.object,
};
export function CardStack({ title, children }) {
  return (
    <div className="card-stack border">
      <h5>{title}</h5>
      {Children.map(children, (child) => {
        return (
          <Card {...child.props} titleUnderline={false} noBorder />
        );
      })}
    </div>
  );
}
CardStack.Card = Card;
