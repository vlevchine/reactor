import { useState } from 'react';
import PropTypes from 'prop-types';
//import { _ } from '@app/helpers'; //, classNames, useMemo, useRef, useEffect
import { Button, Drawer } from '..';
import './styles.css';

Filters.propTypes = {
  disabled: PropTypes.bool,
};

export default function Filters({ disabled }) {
  const [open, setOpen] = useState(),
    onClose = (res) => {
      console.log(res);
      //setOpen(true);
    };

  return (
    <>
      <Button
        text="Filter"
        icon="filter"
        iconStyle="r"
        minimal
        onClick={() => setOpen(Symbol())}
        disabled={disabled}
      />
      <Drawer
        cmd={open}
        ratio={40}
        title="Filter table"
        onClose={onClose}>
        <div>Contents</div>
      </Drawer>
    </>
  );
}
