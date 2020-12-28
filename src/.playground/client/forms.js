import React from 'react';
import PropTypes from 'prop-types';
import Browser from './browser';
import { formsRoot } from './storyConfig';

const Forms = ({ className, def }) => {
  return (
    <div className={className}>
      <Browser root={formsRoot} KEY={def.id} topic={def.topic} />
    </div>
  );
};

Forms.propTypes = {
  def: PropTypes.object,
  className: PropTypes.string,
};

export default Forms;
