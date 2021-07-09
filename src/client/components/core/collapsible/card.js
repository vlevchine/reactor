//import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

Card.propTypes = {
  title: PropTypes.string,
};

export default function Card({ title }) {
  return (
    <div className="card">
      <div className="card-header">
        <h5>{title}</h5>
      </div>
      <div className="card-body"></div>
    </div>
  );
}
