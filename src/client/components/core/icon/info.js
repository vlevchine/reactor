import PropTypes from 'prop-types';
import Icon from './icon_svg';
import './icon.css';

const Info = ({ text, ...rest }) => {
  return (
    <Icon
      {...rest}
      tooltip={text}
      name="info-circle"
      className="i-fa i-r container-relative hint"
    />
  );
};

Info.propTypes = {
  text: PropTypes.string,
};

export default Info;
