import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';

//Add new item - <T_Page>
const T_Page = ({ uri, path, className = '' }) => {
  return (
    <div className={className}>
      <h4>T_Page</h4>
    </div>
  );
};

T_Page.propTypes = {
  uri: PropTypes.string,
  path: PropTypes.string,
  className: PropTypes.string,
};

export default T_Page;
