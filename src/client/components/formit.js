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
};

export default function Form(props) {
  const { boundTo = {}, ctx, model, ...rest } = props,
    name = boundTo.alias || boundTo.name,
    resource = ctx.dataResource?.resources?.[name],
    params = resource?.params,
    schema = resource?.valueType,
    changed = (value, id, op = 'edit') => {
      const msg = { op, src: name, path: id, value };
      ctx.onChange?.(msg);
    };

  return (
    <Section
      model={name ? model?.[name] : model}
      schema={schema?.fields}
      params={params}
      ctx={ctx}
      onChange={changed}
      {...rest}
    />
  );
}

export function Component() {}
