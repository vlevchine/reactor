import { useEffect } from 'react';
import PropTypes from 'prop-types';
//import { _, classNames } from '@app/helpers';
//import { useDialog, useToaster } from '@app/services';
//import Form, { Validator } from '@app/formit';
//import { Dropdown, Button, TextInput } from '@app/components/core';
import { dfltRequestOptions } from '@app/content/helpers';

//page-specifc config
export const config = {
  entity: {
    type: 'P_Template', //page-specific entity type here
    project: 'id name group type company', //???
    options: dfltRequestOptions, //name asc
    common: 2, //0 - company only, 1 - common only, 2 - both
  },
};

Dev_Ogc_Completion.propTypes = {
  def: PropTypes.object,
  parentRoute: PropTypes.string,
  model: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  ctx: PropTypes.object,
  loadData: PropTypes.func,
  blocker: PropTypes.func,
};
export default function Dev_Ogc_Completion({
  def,
  model,
  //  ctx,
  // blocker,
  //parentRoute
  //workflowConfig,
  // ...rest
}) {
  useEffect(() => {
    //update state here
  }, [model]);

  return (
    <div>
      <h3>{def.title}</h3>
    </div>
  );
}
