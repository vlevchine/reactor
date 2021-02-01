import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useCommand } from '../helpers';
import OptionsPanel from './optionsPanel';
import { Icon, Decorator } from '..';
import Popover from './popover';
import './styles.css';

//items expected as {text, icon, action}
const renderOption = ({ icon, title }) => (
  <>
    <Icon name={icon} styled="r" />
    <span>{title}</span>
  </>
);

Dropdown.propTypes = {
  className: PropTypes.string,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  options: PropTypes.array,
  horizontal: PropTypes.bool,
  icon: PropTypes.string,
  minimal: PropTypes.bool,
  arrow: PropTypes.bool,
  onChange: PropTypes.func,
};
export default function Dropdown(props) {
  const {
      text,
      options,
      icon,
      horizontal,
      minimal,
      arrow,
      ...rest
    } = props,
    [cmdClose, setClose] = useCommand(),
    opts = useMemo(() => options.map((o, id) => ({ id, ...o })), []),
    onOption = (v) => {
      setClose();
      options[v]?.action();
    };

  return (
    <Popover
      {...rest}
      cmdClose={cmdClose}
      target={
        <Decorator
          icon={icon}
          info={arrow ? 'chevron-down' : undefined}
          minimal={minimal}
          blend>
          {text && <span className="dropdown-text">{text}</span>}
        </Decorator>
      }
      content={
        <OptionsPanel
          options={opts}
          render={renderOption}
          onChange={onOption}
          horizontal={horizontal}
        />
      }
    />
  );
}
