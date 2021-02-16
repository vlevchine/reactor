import { useState } from 'react';
import PropTypes from 'prop-types';
export { default as Field } from './field';
import Section from './formSection';
import { FormTabs, FormPanel, FormGroup } from './formContainers';
export {
  Section,
  FormTabs as Tabs,
  FormPanel as Panel,
  FormGroup as Group,
};

Form.propTypes = {
  id: PropTypes.string,
  boundTo: PropTypes.object,
  model: PropTypes.object,
  ctx: PropTypes.object,
  onChange: PropTypes.func,
  context: PropTypes.func,
  pageParams: PropTypes.object,
};
const passThrough = ['ui', 'options'];
export default function Form(props) {
  const {
      boundTo = {},
      model: _model,
      ctx,
      context,
      //pageParams,
      ...rest
    } = props,
    name = boundTo.alias || boundTo.name,
    [model, setModel] = useState(_model[name]),
    //params = pageParams[name],
    resource = ctx.dataResource?.resources?.[name],
    changed = (value, path, op = 'edit') => {
      if (passThrough.includes(op)) {
        resource?.fetch(value).then(() => {
          setModel(resource.data);
        });
        ctx.onChange?.({ [name]: value });
      } else {
        resource.processChange({ op, src: name, path, value });
        setModel(resource.data);
      }
    };
  ctx.context = context?.(model);
  // useEffect(() => {
  //   ctx.dataResource?.fetch(pageParams).then(() => {
  //     setModel(resource.data);
  //   });
  // }, [ctx]);

  return (
    <Section
      model={model}
      schema={resource?.valueType?.fields}
      params={resource?.params}
      ctx={ctx}
      onChange={changed}
      {...rest}></Section>
  );
}

export function Component() {}
