import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
    [val, setVal] = useState(value),
    changed = (ev) => {
      setVal(Number(ev.target.value));
    },
    after = () => {
      onChange(val);
    },
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
  useEffect(() => {
    setVal(value);
  }, [value]);

  return (
    <div className="pager">
      <span className="pager-text">{`Page: ${val}: ${(
        (val - 1) * pageSize +
        1
      ).toLocaleString()}-${Math.min(
        val * pageSize,
        max
      ).toLocaleString()} of ${max.toLocaleString()}`}</span>
      <div className="pager-content" style={style}>
        <Button
          icon="chevron-double-left"
          minimal
          style={{ padding: 0 }}
          id="min"
          disabled={isMin}
          onClick={ff}
        />
        <Button
          icon="chevron-left"
          minimal
          style={{ padding: 0 }}
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
          onMouseUp={after}
        />
        <Button
          icon="chevron-right"
          minimal
          style={{ padding: 0 }}
          id="1"
          disabled={isMax}
          onClick={jump}
        />
        <Button
          icon="chevron-double-right"
          id="max"
          style={{ padding: 0 }}
          minimal
          disabled={isMax}
          onClick={ff}
        />
      </div>
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
