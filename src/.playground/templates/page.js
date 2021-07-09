import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { appState } from '@app/services';
import { AppContext } from '@app/contextProvider';
import { findInTree } from '@app/helpers';
//import classes from './styles.css';

//Navigatable page
//path=job, navigate, location={hash, search, host, origin, ...}, children
const T_Page = ({ def, uri, className }) => {
  const { config } = useContext(AppContext),
    def1 = findInTree(config.app, uri, { sep: '/', prop: 'k' });
  useEffect(() => {
    appState.nav.dispatch({ path: 'currentPage', value: def.key });
  }, []);

  return (
    <section className={className}>
      <h4>{def.label}</h4>
    </section>
  );
};

T_Page.propTypes = {
  def: PropTypes.object,
  uri: PropTypes.string,
  className: PropTypes.string,
};

export default T_Page;
