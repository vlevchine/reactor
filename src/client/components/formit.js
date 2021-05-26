import { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { process } from '@app/utils/immutable';
import { useDrag } from './core/dnd';
export { default as Field } from './formField';
import Section, { InDesignSection } from './formSection';
import { FormPanelHeader } from './formSectionContent';
import { Tabs, Panel, Group } from './formContainers';
export { Section, Tabs, Panel, Group };

const passThrough = ['ui', 'options'];
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
  history: PropTypes.bool,
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
      history = true,
      //pageParams,
      ...rest
    } = props,
    //params = pageParams[boundTo],
    titl = title || def?.title,
    {
      user: { id, roles = [] },
      company,
    } = ctx,
    changeHistory = useRef([]),
    [model, setModel] = useState(_model || {}),
    changed = useCallback((value, path, op = 'edit') => {
      const msg = {
        op,
        passThrough: passThrough.includes(op),
        path,
        value,
      };
      //if onChange is specified, form is controlled
      if (!onChange) {
        const [new_model, change] = process(model, msg);
        setModel(new_model);
        if (history) {
          change.id = `${id}@${company?.id}`;
          const last = _.last(changeHistory.current);
          if (
            last &&
            op === 'edit' &&
            op === last.op &&
            path === last.path &&
            change.id === last.id
          ) {
            last.value = value;
          } else changeHistory.current.push(change);
          console.log(changeHistory.current);
        }
      } else onChange(msg, ctx);
    }, []),
    Sect = rest.inDesign ? InDesignSection : Section;

  //state will include checks on roles/assignments, etc.
  ctx.state = (def?.context || context)?.(model, roles) || {};

  const { ref } = useDrag({
    id: 'form',
    copy: true,
    dragEnded: onAddComponent,
    update: [def],
  });

  useEffect(() => {
    setModel(_model || {});
  }, [_model]);

  return (
    <article ref={ref} className="form">
      <FormPanelHeader title={titl} className="section">
        {rest.toolbar?.({ id: def.id, name: 'Form' })}
      </FormPanelHeader>
      <Sect
        items={def?.items}
        model={model}
        ctx={ctx}
        onChange={changed}
        layout={def?.layout || layout}
        {...rest}
      />
    </article>
  );
}

export function Component() {}
