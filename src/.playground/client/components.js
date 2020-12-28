import React from 'react';
import PropTypes from 'prop-types';
import Browser from './browser';
import { componentsRoot } from './storyConfig';

const Components = ({ def, className }) => {
  return (
    <div className={className}>
      <Browser root={componentsRoot} KEY={def.id} topic={def.topic} />
    </div>
  );
};

Components.propTypes = {
  def: PropTypes.object,
  className: PropTypes.string,
};

export default Components;
