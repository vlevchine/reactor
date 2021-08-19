import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
//import { _ } from '@app/helpers';
//import { useDialog, useToaster } from '@app/services';
import Form, { Validator } from '@app/formit';
//import { Dropdown, Button, TextInput } from '@app/components/core';
import {
  formRequest,
  dfltRequestOptions,
} from '@app/content/helpers';

//page-specifc config
export const config = {
  entity: {
    type: 'P_Template', //page-specific entity type here
    project: 'id name group type company', //???
    options: dfltRequestOptions, //name asc
    common: 2, //0 - company only, 1 - common only, 2 - both
  },
};

Types.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  ctx: PropTypes.object,
  loadData: PropTypes.func,
  blocker: PropTypes.func,
};
export default function Types({
  def,
  loadData,
  model,
  ctx,
  blocker,
  //parentRoute
  //workflowConfig,
  // ...rest
}) {
  const [editing, setEditing] = useState(false),
    // { projectGroups, projectTypes } = workflowConfig,
    // dialog = useDialog(),
    // toaster = useToaster(),
    validator = useRef(new Validator()),
    onValidate = () => {},
    onChange = async () => {
      const [dt, items] = await loadData([
        formRequest({ type: config.entity.name, item: editing }),
        { ...config.entity },
      ]);
      setEditing(false);
      console.log(dt, items);
    };

  blocker(!!editing);
  useEffect(() => {
    const subscription = validator.current.subscribe(onValidate);

    return () => {
      validator.current.unsubscribe(subscription);
    };
  }, []);

  useEffect(() => {
    //update state here
  }, [model]);

  return (
    <div>
      <h3>{def.title}</h3>
      <h4>Model</h4>
      <p>{JSON.stringify(ctx)}</p>
      <Form
        def={{}}
        onChange={onChange}
        validator={validator.current}
      />
    </div>
  );
}
