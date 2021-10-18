import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useData } from '@app/services'; // useDialog, useToaster
import { getItemHistory } from '@app/services/changeHistory';
import { CancelButton, SaveButton } from '@app/components/core';

export const config = {};
const type = 'F_Template';

FormTemplates.propTypes = {
  uri: PropTypes.string,
  ctx: PropTypes.object,
  className: PropTypes.string,
};
export default function FormTemplates({ ctx, className = '' }) {
  const {
      nav,
      pageParams: { id },
      pathname,
    } = ctx,
    state = nav.get(pathname) || {},
    { proc, task } = state,
    [item, setItem] = useState(),
    [touched] = useState(), //, setTouched
    { loadEntity } = useData(),
    navigate = useNavigate(),
    onEditEnd = (ev, _id) => {
      const { path, ...value } = state;
      if (_id === 'cancel') {
        //form.current.resetHistory();
      } else {
        console.log('ok');
      }
      nav.clear(pathname);
      nav.dispatch({ path, value });
      navigate(path);
    };

  useEffect(async () => {
    const data = await loadEntity({ type, id });
    setItem(data);
  }, [id]);

  console.log(id, item, getItemHistory(id));
  return (
    <div className={className}>
      <div className="justaposed">
        <h6>{`Form Template for process: "${proc.name}" /  task: "${task.name}"`}</h6>
        <div>
          <CancelButton
            id="cancel"
            text="Cancel Form changes"
            onClick={onEditEnd}
            style={{ marginRight: '0.5rem' }}
          />
          <SaveButton
            id="save"
            text="Accept Form changes"
            onClick={onEditEnd}
            disabled={!touched}
          />
        </div>
      </div>

      <h4>Form here</h4>
    </div>
  );
}
