import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
//import { _ } from '@app/helpers';
import { process } from '@app/utils/immutable';
import { useDrag } from './core/dnd';
export { default as Field } from './formField';
import Section, { InDesignSection } from './formSection';
import { FormPanelHeader } from './formSectionContent';
import { TabPanel, Panel, Group } from './formContainers';
export { Section, TabPanel, Panel, Group };

Form.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  model: PropTypes.object,
  ctx: PropTypes.object,
  def: PropTypes.object,
  layout: PropTypes.object,
  onChange: PropTypes.func,
  onAddComponent: PropTypes.func,
  context: PropTypes.func,
  className: PropTypes.string,
  pageParams: PropTypes.object,
  useHistory: PropTypes.bool,
  resource: PropTypes.string,
};

export default function Form(props) {
  const {
      model: _model,
      def,
      ctx,
      context,
      layout,
      title,
      onChange,
      onAddComponent,
      pageParams,
      ...rest
    } = props,
    titl = title || def?.title,
    [model, setModel] = useState(_model),
    changed = (value, path, op = 'edit') => {
      const msg = { op, path, value },
        [new_model, change] = process(model, msg);
      //dispatch ui/options, change in resource
      //request data from server per new options
      ctx.onChange?.(msg, change);
      //custom page func - page will provide functionality as needed
      //for controlled form, model will be reset;
      //if no onChange - reset state locally - not controlled
      if (onChange) {
        onChange(new_model, msg);
      } else if (new_model !== model) setModel(new_model);
    },
    Sect = rest.inDesign ? InDesignSection : Section;

  //state will include checks on roles/assignments, etc.
  ctx.state =
    (def?.context || context)?.(model || {}, ctx.user?.roles || []) ||
    {};

  const { ref } = useDrag({
    id: 'form',
    copy: true,
    dragEnded: onAddComponent,
    update: [def],
  });

  useEffect(() => {
    setModel(_model);
  }, [_model]);

  return (
    <article ref={ref} className="form">
      <FormPanelHeader title={titl} className="section">
        {rest.toolbar?.({ id: def.id, name: 'Form' })}
      </FormPanelHeader>
      <Sect
        {...rest}
        items={def?.items}
        model={model}
        ctx={ctx}
        onChange={changed}
        layout={def?.layout || layout}
        params={pageParams}
      />
    </article>
  );
}

export function Component() {}
