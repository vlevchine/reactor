import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@app/contextProvider';
import { findInTree } from '@app/helpers';
//import classes './styles.css';

//Container page, displays children, not directly navigatable
const T_Page = ({ uri, path, children, className = '' }) => {
  const { store, config } = useContext(AppContext),
    def = findInTree(config.app, uri, { sep: '/', prop: 'k' });

  return (
    <div className={className}>
      <h3>{def.label}</h3>
      {children}
    </div>
  );
};

T_Page.propTypes = {
  uri: PropTypes.string,
  path: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default T_Page;
