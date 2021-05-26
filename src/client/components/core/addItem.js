import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ButtonGroup,
  EditableText,
  Icon,
} from '@app/components/core';

AddItem.propTypes = {
  onAdd: PropTypes.func,
  toolbar: PropTypes.array,
};
export default function AddItem({ toolbar, onAdd }) {
  const //[item, setItem] = useState(''),
    val = useRef(),
    [edit, setEdit] = useState(false),
    adding = (ev, id) => {
      onAdd({ value: val.current, id });
    },
    changing = (v, b, done) => {
      val.current = v;
      if (done?.accept) {
        val.current = '';
        onAdd({ value: v, id: toolbar[0]?.id });
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
      {toolbar && (
        <ButtonGroup minimal>
          {toolbar.map((e) => (
            <Button
              key={e.id}
              id={e.id}
              prepend={e.icon}
              className="lg"
              onClick={adding}
              disabled={!edit}
              tooltip={e.tooltip}
            />
          ))}
        </ButtonGroup>
      )}
    </span>
  );
}
