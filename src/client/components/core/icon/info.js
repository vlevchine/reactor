import PropTypes from 'prop-types';
import I from './icon_svg';
import './icon.css';

const Info = ({ text, name = 'question-circle', ...rest }) => {
  return (
    <span data-tip={text} className="info-message">
      <I {...rest} name={name} />
    </span>
  );
};

Info.propTypes = { name: PropTypes.string, text: PropTypes.string };

export default Info;
