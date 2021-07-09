import PropTypes from 'prop-types';
import '@app/content/styles.css';
import { List } from '@app/components/core';
export const config = {};
const values = [
  { id: '1', name: 'First item #1' },
  { id: '2', name: 'Second item #2' },
  { id: '3', name: 'third item #3' },
  { id: '4', name: 'Last item #4' },
];
const First_2 = ({ className = '' }) => {
  return (
    <div className={className}>
      <h4>First_23</h4>
      <List values={values} />
    </div>
  );
};

First_2.propTypes = {
  uri: PropTypes.string,
  def: PropTypes.object,
  className: PropTypes.string,
};

export default First_2;
