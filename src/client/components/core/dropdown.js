import React, { useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { OptionsPanel } from './helpers';
import { Popover, Icon, Button, ButtonGroup } from '../index';
import './styles.css';

//items expected as {text, icon, action}
// eslint-disable-next-line react/prop-types
const renderOption = ({ icon, title }) => (
    <>
      <Icon name={icon} styled="s" />
      <span>{title}</span>
    </>
  ),
  Dropdown = ({
    id,
    title,
    placeRight,
    horizontal,
    minimal,
    light,
    options = [],
    ...rest
  }) => {
    const pop = useRef(),
      opts = useMemo(
        () => options.map((o, id) => ({ id, ...o })),
        []
      ),
      onOption = (v) => {
        options[v]?.action();
        pop.current.hide();
      };

    return (
      <Popover
        {...rest}
        ref={pop}
        id={id}
        minimal={minimal}
        place={placeRight ? 'right' : 'bottom'}
        header={<span className="dropdown-title">{title}</span>}>
        <OptionsPanel
          options={opts}
          render={renderOption}
          onChange={onOption}
          horizontal={horizontal}
          minimal={minimal}
          optionClass="icon-option"
          className={light ? 'light' : undefined}
        />
      </Popover>
    );
  };

Dropdown.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  options: PropTypes.array,
  horizontal: PropTypes.bool,
  minimal: PropTypes.bool,
  placeRight: PropTypes.bool,
  light: PropTypes.bool,
  onChange: PropTypes.func,
};

const Confirm = ({ title, text, action, id, ...rest }) => {
  const pop = useRef(),
    confirmed = (_, _id) => {
      pop.current.hide();
      if (_id && action) action(id);
    };

  return (
    <Popover
      id={id}
      ref={pop}
      place="top"
      header={<span className="dropdown-title">{title}</span>}
      contentClass="confirm-popover"
      {...rest}>
      <Icon name="question-circle" />
      <strong>{text}</strong>
      <ButtonGroup minimal>
        <Button
          info="check-circle"
          id={id || 'ok'}
          onClick={confirmed}
        />
        <Button icon="times" onClick={confirmed} />
      </ButtonGroup>
    </Popover>
  );
};
Confirm.propTypes = {
  id: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string,
  action: PropTypes.func,
};

export default Dropdown;
export { Confirm };
