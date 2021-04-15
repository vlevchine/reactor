import { useState } from 'react';
import PropTypes from 'prop-types';
//import { _ } from '@app/helpers';
export { default as Field } from './formField';
import Section from './formSection';
import { Tabs, Panel, Group } from './formContainers';
export { Section, Tabs, Panel, Group };
//!!!Important
//enhance converts strings into functions, this way def will always have functional checks
//while coding form directly, use strings as prop names only, otherwise use functions
// const funcProps = ['display', 'hide', 'disable'],
//   enhanceFormDef = (def) => {
//     if (!def) return;
//     funcProps.forEach((e) => {
//       if (def[e] && _.isString(def[e])) def[e] = eval(def[e]);
//     });
//     (def.content || def.tabs || []).forEach(enhanceFormDef);
//   };

Form.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  boundTo: PropTypes.string,
  model: PropTypes.object,
  ctx: PropTypes.object,
  def: PropTypes.object,
  layout: PropTypes.object,
  onChange: PropTypes.func,
  context: PropTypes.func,
  className: PropTypes.string,
  pageParams: PropTypes.object,
};
const passThrough = ['ui', 'options'];
export default function Form(props) {
  const {
      boundTo,
      model: _model,
      def,
      ctx,
      context,
      layout,
      title,
      //pageParams,
      ...rest
    } = props,
    //params = pageParams[boundTo],
    titl = title || def.title,
    resource = ctx.dataResource?.resources?.[boundTo],
    name = resource?.query.name || resource?.query.alias || boundTo,
    [model, setModel] = useState(resource?.data || _model[name]),
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

  //enhanceFormDef(def);
  //state will include checks on roles/assignments, etc.
  ctx.state =
    (def?.context || context)?.(model || {}, ctx.roles || []) || {};
  // useEffect(() => {
  //   ctx.dataResource?.fetch(pageParams).then(() => {
  //     setModel(resource.data);
  //   });
  // }, [ctx]);

  return (
    <>
      {titl && <h5>{titl}</h5>}
      <Section
        items={def?.items}
        model={model}
        schema={resource?.valueType?.fields}
        params={resource?.params}
        ctx={ctx}
        onChange={changed}
        layout={def?.layout || layout}
        {...rest}></Section>
    </>
  );
}

export function Component() {}
