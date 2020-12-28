import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Overlay from './overlay';
import Icon from './icon';
import Button from './button';
import { classNames } from '@app/helpers';
import classes from './styles.css';

const drawer = classes['drawer'],
  drawerShow = classes['drawer-show'],
  header = classes['drawer-header'],
  content = classes['drawer-content'],
  btn = classes['drawer-btn'];

const Drawer = ({
  open,
  width = '50%',
  title,
  onAction,
  children,
}) => {
  useEffect(() => {
    const onClick = ({ target }) => {
      if (target.id === 'overlay') onAction(true);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  return (
    <>
      <section
        style={{ width }}
        className={classNames([drawer], { [drawerShow]: open })}>
        <div className={header}>
          <h3>
            <Icon name="presentation" />
            &nbsp;&nbsp;{title}
          </h3>
          <span className={btn}>
            {/* <Button icon="check" onClick={() => onAction(true)} /> */}
            <Button icon="times" onClick={onAction} />
          </span>
        </div>
        {open && <div className={content}>{children}</div>}
      </section>
      <Overlay show={open} />
    </>
  );
};

Drawer.propTypes = {
  open: PropTypes.bool,
  width: PropTypes.string,
  title: PropTypes.string,
  onAction: PropTypes.func,
  children: PropTypes.any,
};

export default Drawer;
