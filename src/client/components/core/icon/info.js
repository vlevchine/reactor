import PropTypes from 'prop-types';
import Icon from './icon_svg';
import './icon.css';

const Info = ({ text, name = 'info-circle', ...rest }) => {
  return (
    <span data-tip={text} className="container-relative">
      <Icon {...rest} name={name} />
    </span>
  );
};

Info.propTypes = { name: PropTypes.string, text: PropTypes.string };

export default Info;
