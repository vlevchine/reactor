import React from 'react';
import PropTypes from 'prop-types';
import 'T_depth/styles.css';

//Display/edit item details - <T_Page>
const T_Page = ({ def, className = '' }) => {
  return (
    <div className={className}>
      <h4>T_Page</h4>
    </div>
  );
};

T_Page.propTypes = {
  def: PropTypes.object,
  className: PropTypes.string,
};

export default T_Page;
