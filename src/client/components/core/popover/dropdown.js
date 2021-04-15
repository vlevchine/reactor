import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useCommand } from '../helpers';
import OptionsPanel from './optionsPanel';
import { Icon, Decorator } from '..';
import Popover from './popover';
import './styles.css';

//items expected as {text, icon, action}
const renderOption = ({ icon, title, id }) => (
  <>
    <Icon name={icon} styled="r" />
    <span>{title || id}</span>
  </>
);

Dropdown.propTypes = {
  className: PropTypes.string,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  options: PropTypes.array,
  horizontal: PropTypes.bool,
  prepend: PropTypes.string,
  minimal: PropTypes.bool,
  arrow: PropTypes.bool,
  action: PropTypes.func,
  disableOptions: PropTypes.array,
};
export default function Dropdown(props) {
  const {
      text,
      options,
      action,
      prepend,
      horizontal,
      minimal,
      arrow,
      disableOptions,
      ...rest
    } = props,
    [cmdClose, setClose] = useCommand(),
    opts = useMemo(() => options.map((o, id) => ({ id, ...o })), []),
    onOption = (v) => {
      setClose();
      const ind = options.findIndex((e) => e.id === v),
        opt = options[ind];
      if (opt && !disableOptions[ind]) (opt.action || action)?.(v);
    };

  return (
    <Popover
      {...rest}
      cmdClose={cmdClose}
      target={
        <Decorator
          prepend={prepend}
          append={arrow ? 'chevron-down' : undefined}
          appendType="clip"
          minimal={minimal}
          blend>
          {text && <span className="dropdown-text">{text}</span>}
        </Decorator>
      }
      content={
        <OptionsPanel
          options={opts}
          render={renderOption}
          disableOptions={disableOptions}
          onChange={onOption}
          horizontal={horizontal}
        />
      }
    />
  );
}
