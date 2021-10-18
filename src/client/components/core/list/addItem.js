import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { EditableText, Icon } from '@app/components/core';

AddItem.propTypes = {
  onAdd: PropTypes.func,
  toolbar: PropTypes.array,
};
export default function AddItem({ onAdd }) {
  const val = useRef(),
    [edit, setEdit] = useState(false),
    changing = (v, b, done) => {
      val.current = v;
      if (done?.accept) {
        val.current = '';
        onAdd(v);
      }
    };

  return (
    <span className="add">
      <Icon
        name="plus"
        styled="r"
        className={edit ? undefined : 'disabled'}
      />
      <EditableText
        onChange={changing}
        resetOnDone
        style={{ marginBottom: '0.25rem' }}
        onFocus={() => setEdit(true)}
        onBlur={setEdit}
        placeholder={`Add new ...`}
      />
    </span>
  );
}
