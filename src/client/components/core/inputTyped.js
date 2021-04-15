import { useState } from 'react';
import PropTypes from 'prop-types';
//import { _ } from '@app/helpers';
import { TextInput, Select } from '.';
import './styles.css';

InputTyped.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  options: PropTypes.array,
  info: PropTypes.string,
  style: PropTypes.object,
  clear: PropTypes.bool,
  tabIndex: PropTypes.number,
  blend: PropTypes.bool,
  intent: PropTypes.string,
  className: PropTypes.string,
};

export default function InputTyped({
  dataid,
  value,
  options = [],
  clear,
  onChange,
}) {
  const [val, setVal] = useState(value || { type: options[0].id }),
    changed = (v, id) => {
      const n_v = { ...val, [id]: v };
      setVal(n_v);
      onChange(n_v, dataid);
    };
  console.log(dataid);
  return (
    <div className="row-composite">
      <Select
        dataid={`${dataid}_type`}
        value={val.type}
        options={options}
        display="name"
        onChange={changed}
      />
      <TextInput
        dataid="value"
        value={val.value}
        throttle={700}
        clear={clear}
        onChange={changed}
      />
    </div>
  );
}
