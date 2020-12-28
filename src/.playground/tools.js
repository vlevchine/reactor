import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
//import { NavbarGroup } from '@blueprintjs/core';
import PopupMenu from '../client/components/popupMenu';
import { items } from './_config';

const Tools = () => {
  return (
    // <NavbarGroup>
    <PopupMenu
      items={items}
      icon="build"
      intent="danger"
      text="Tools"
    />
    // </NavbarGroup>
  );
};

Tools.propTypes = {
  className: PropTypes.string,
};
export default Tools;
