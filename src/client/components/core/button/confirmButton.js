import { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../index';
import { Button, ButtonGroup } from './button';
import '../styles.css';
import './button.css';

const sure = 'Are you sure?';

const ConfirmButton = ({
  dataid,
  onClick,
  message = sure,
  ...rest
}) => {
  const [open, setOpen] = useState(),
    clicked = () => {
      setOpen((s) => !s);
    },
    confirmed = () => {
      clicked();
      onClick && onClick(dataid);
    };
  return (
    <div className="container-relative">
      {open && (
        <div className="popover-content">
          <Icon name="question-circle" />
          <span>{message}</span>
          <ButtonGroup minimal>
            <Button info="check-circle" onClick={confirmed} />
            <Button icon="times" onClick={clicked} />
          </ButtonGroup>
        </div>
      )}
      <Button {...rest} onClick={clicked} />
    </div>
  );
};

ConfirmButton.propTypes = {
  dataid: PropTypes.string,
  onClick: PropTypes.any,
  message: PropTypes.string,
};

export default ConfirmButton;
