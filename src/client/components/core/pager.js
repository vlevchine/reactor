import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useInputHandlers } from '@app/utils/hooks';
import { Button } from '.';
import './styles.css';

const Pager = ({
  value = 1,
  max,
  pageSize = 25,
  onChange,
  style,
  //className
}) => {
  const [numPg, setNumPg] = useState(() => Math.ceil(max / pageSize)),
    [val, changed, , , , setVal] = useInputHandlers({
      value: value,
      debounce: 300,
      onChange,
    }),
    goTo = (page) => {
      if (page === val) return;
      setVal(page);
      onChange(page);
    },
    jump = (ev, id) => {
      goTo(Math.min(Math.max(parseInt(id) + val, 1), numPg));
    },
    ff = (ev, id) => {
      goTo(id === 'max' ? numPg : 1);
    },
    isMin = val < 2,
    isMax = val >= numPg;
  useEffect(() => {
    setNumPg(Math.ceil(max / pageSize));
  }, [max, pageSize]);

  return (
    <div className="pager" style={style}>
      <h6 className="pager-text">{`${
        (val - 1) * pageSize + 1
      }-${Math.min(val * pageSize, max)} of ${max}`}</h6>
      <Button
        icon="chevron-double-left"
        minimal
        id="min"
        disabled={isMin}
        onClick={ff}
      />
      <Button
        icon="chevron-left"
        minimal
        id="-1"
        disabled={isMin}
        onClick={jump}
      />
      <input
        type="range"
        min="1"
        max={numPg}
        value={val}
        className="range-slider"
        onChange={changed}
      />
      <Button
        icon="chevron-right"
        minimal
        id="1"
        disabled={isMax}
        onClick={jump}
      />
      <Button
        icon="chevron-double-right"
        id="max"
        minimal
        disabled={isMax}
        onClick={ff}
      />
    </div>
  );
};

Pager.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  max: PropTypes.number,
  pageSize: PropTypes.number,
  style: PropTypes.object,
  onChange: PropTypes.func,
  className: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
};

export default Pager;
