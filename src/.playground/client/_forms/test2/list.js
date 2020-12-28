import addonSchema from './list.graphql.json';
import React from 'react';
import formics from '@app/components/formics';

const fetchData = async (values, id) => {
    const val = values.find((e) => e.id === id);
    return Promise.resolve(val);
  },
  { FormBrowser, Formit } = formics;
//forms selected by user for activity; TBD: must come from store/user
const Form = (props) => {
  return (
    <Formit
      {...props}
    queryTypes={['Person']}
      addonSchema={addonSchema}
      id="testFormBrowser"
      //bound="Test"
      title="Form with Form Browser"
      cols={1}>
      <FormBrowser
        title="Drilling activity"
        requestData={fetchData}
        dataid="k30"
        style={{ width: '100%' }}
      />
    </Formit>
  );
};

export default Form;
