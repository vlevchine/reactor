import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import classes from './styles.css';

const overlay = classes['overlay'],
  overlayShow = classes['overlay-show'];

const Overlay = ({ show }) => {
  return (
    <div
      id="overlay"
      className={classNames([overlay], {
        [overlayShow]: show,
      })}></div>
  );
};

Overlay.propTypes = {
  show: PropTypes.bool,
};
export default Overlay;
