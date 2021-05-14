import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
//import { _ } from '@app/helpers';
import { process } from '@app/utils/immutable';
import { useDrag } from './core/dnd';
export { default as Field } from './formField';
import Section, { InDesignSection } from './formSection';
import { FormPanelHeader } from './formSectionContent';
import { Tabs, Panel, Group } from './formContainers';
export { Section, Tabs, Panel, Group };

Form.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  boundTo: PropTypes.string,
  model: PropTypes.object,
  ctx: PropTypes.object,
  def: PropTypes.object,
  layout: PropTypes.object,
  onChange: PropTypes.func,
  onAddComponent: PropTypes.func,
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
      onChange,
      onAddComponent,
      //pageParams,
      ...rest
    } = props,
    //params = pageParams[boundTo],
    titl = title || def?.title,
    resource = ctx?.dataResource?.resources?.[boundTo],
    name = resource?.query.name || resource?.query.alias || boundTo,
    [model, setModel] = useState(
      resource?.data || _model?.[name] || _model || {}
    ),
    changed = useCallback((value, path, op = 'edit') => {
      if (onChange) {
        const [new_model] = process(model, {
          op,
          path,
          value,
        });
        setModel(new_model);
        onChange(new_model);
      } else if (passThrough.includes(op)) {
        resource?.fetch(value).then(() => {
          setModel(resource.data);
        });
        ctx.onChange?.({ [name]: value });
      } else {
        resource.processChange({ op, src: name, path, value }, ctx);
        console.log(resource.changes);
        setModel(resource.data);
      }
    }, []),
    Sect = rest.inDesign ? InDesignSection : Section;

  //state will include checks on roles/assignments, etc.
  if (ctx)
    ctx.state =
      (def?.context || context)?.(model || {}, ctx.roles || []) || {};
  // useEffect(() => {
  //   ctx.dataResource?.fetch(pageParams).then(() => {
  //     setModel(resource.data);
  //   });
  // }, [ctx]);

  const { ref } = useDrag({
    id: 'form',
    copy: true,
    dragEnded: onAddComponent,
    update: [def],
  });

  useEffect(() => {
    setModel(resource?.data || _model?.[name] || _model || {});
  }, [resource?.data, _model]);
  return (
    <article ref={ref}>
      <FormPanelHeader title={titl}>
        {rest.toolbar?.({ id: def.id, name: 'Form' })}
      </FormPanelHeader>
      <Sect
        items={def?.items}
        model={model}
        schema={resource?.valueType?.fields}
        params={resource?.params}
        ctx={ctx}
        onChange={changed}
        layout={def?.layout || layout}
        {...rest}
      />
    </article>
  );
}

export function Component() {}
