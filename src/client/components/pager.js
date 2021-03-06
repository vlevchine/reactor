import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from './core';
import './styles.css';

export default function Pager({
  page = 1,
  size = 25,
  max,
  onChange,
  style,
  //className
}) {
  const [numPg, setNumPg] = useState(() => Math.ceil(max / size)),
    [val, setVal] = useState(page),
    changed = (ev) => {
      setVal(Number(ev.target.value));
    },
    after = () => {
      onChange({ page: val, size });
    },
    goTo = (page) => {
      if (page === val) return;
      setVal(page);
      onChange({ page, size });
    },
    jump = (ev, id) => {
      goTo(Math.min(Math.max(parseInt(id) + val, 1), numPg));
    },
    ff = (ev, id) => {
      goTo(id === 'max' ? numPg : 1);
    },
    isMin = val < 2,
    isMax = val >= numPg,
    many = max > size;

  useEffect(() => {
    setNumPg(Math.ceil(max / size));
  }, [max, size]);
  useEffect(() => {
    setVal(Number(page));
  }, [page]);

  return max ? (
    <div className="pager">
      <span className="pager-text">{`Page #${val}: ${(
        (val - 1) * size +
        1
      ).toLocaleString()}-${Math.min(
        val * size,
        max
      ).toLocaleString()} of ${max.toLocaleString()}`}</span>
      {many && (
        <div className="pager-content" style={style}>
          <Button
            prepend="chevron-double-left"
            minimal
            id="min"
            disabled={isMin}
            onClick={ff}
          />
          <Button
            prepend="chevron-left"
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
            onMouseUp={after}
          />
          <Button
            prepend="chevron-left"
            minimal
            id="1"
            rotate={180}
            disabled={isMax}
            onClick={jump}
          />
          <Button
            prepend="chevron-double-left"
            id="max"
            minimal
            rotate={180}
            disabled={isMax}
            onClick={ff}
          />
        </div>
      )}
    </div>
  ) : null;
}

Pager.propTypes = {
  page: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  max: PropTypes.number,
  size: PropTypes.number,
  style: PropTypes.object,
  onChange: PropTypes.func,
  className: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
};
