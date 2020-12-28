import PropTypes from 'prop-types';
export { default as Field } from './field';
export { default as Tabs } from './formTabs';
import Section, { FormPanel } from './formSection';
export { Section, FormPanel as Panel };

Form.propTypes = {
  id: PropTypes.string,
  boundTo: PropTypes.object,
  store: PropTypes.object,
  ctx: PropTypes.object,
  onChange: PropTypes.func,
};
export default function Form(props) {
  const { boundTo = {}, ctx, ...rest } = props,
    name = boundTo.alias || boundTo.name,
    changed = (value, id) => {
      const msg = { op: 'edit', src: name, path: id, value };
      ctx.onChange?.(msg);
    };
  //  console.log(process.env);
  return (
    <Section
      model={ctx.model?.[name]}
      meta={ctx.schema[boundTo.valueType]}
      ctx={ctx}
      onChange={changed}
      {...rest}
    />
  );
}
