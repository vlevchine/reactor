import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { process } from '@app/utils/immutable';
import { Observable, Status } from '@app/utils/observable';
import { useDrag } from './core/dnd';
export { default as Field } from './formField';
import Section, { InDesignSection } from './formSection';
import { FormPanelHeader } from './formSectionContent';
import { TabPanel, Panel, Group } from './formContainers';
export { Section, TabPanel, Panel, Group };

//state will include checks on roles/assignments, etc
function setContext(ctx, context, model = {}) {
  ctx.state = context?.(model, ctx) || {};
}
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
  unset: PropTypes.object,
  className: PropTypes.string,
  pageParams: PropTypes.object,
  useHistory: PropTypes.bool,
  resource: PropTypes.string,
  validate: PropTypes.bool,
};

export default function Form(props) {
  const {
      model: _model,
      def,
      ctx,
      context,
      unset,
      layout,
      title,
      onChange,
      onAddComponent,
      pageParams,
      ...rest
    } = props,
    _ctx = ctx || {},
    _unset = unset || def?.unset || {},
    _context = context || def?.context,
    titl = title || def?.title,
    [model, setModel] = useState(_model || {}),
    changed = (value, path, op = 'edit') => {
      const msg = { op, path, value },
        [new_model, change] = process(model, msg);
      setContext(_ctx, _context, new_model);
      const resetting = Object.keys(_unset).filter(
        (k) => _ctx.state[k]
      );
      //dispatch ui/options, change in resource
      //request data from server per new options
      _ctx.onChange?.(msg, change);
      //custom page func - page will provide functionality as needed
      //for controlled form, model will be reset;
      //if no onChange - reset state locally - not controlled
      if (new_model !== model || resetting.length > 0) {
        resetting.forEach((k) => {
          _.setIn(new_model, _unset[k]);
        });
        setModel(new_model);
        if (onChange) onChange(new_model, msg);
      }
    },
    Sect = rest.inDesign ? InDesignSection : Section;
  const { ref } = useDrag({
    id: 'form',
    copy: true,
    dragEnded: onAddComponent,
    update: [def],
  });

  useEffect(() => {
    if (_model) {
      setContext(_ctx, _context, _model);
      if (_model !== model) setModel(_model);
    }
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
        ctx={_ctx}
        onChange={changed}
        layout={def?.layout || layout}
        params={pageParams}
      />
    </article>
  );
}

export function Component() {}

const validationStatuses = ['pristine', 'error', 'success'],
  okStatus = ['pristine', 'success'],
  nulls = ['', undefined];
export class Validator extends Observable {
  constructor(name) {
    super(name);
    this.status = new Status(validationStatuses);
    this.data = { required: [] };
  }
  isPristine() {
    return this.status.isZero();
  }
  isOK() {
    return okStatus.includes(this.status.name);
  }
  isValid() {
    return this.status.name === 'success';
  }
  setStatus() {
    this.status.name = this.data.required.length
      ? 'error'
      : 'success';
    return this.status;
  }
  checkRequired(v, id) {
    const ind = this.data.required.indexOf(id);
    if (nulls.includes(v)) {
      ind < 0 && this.data.required.push(id);
    } else if (ind > -1) this.data.required.splice(ind, 1);
    this.onSuccess(this.setStatus());
  }
  checkShape() {}
  validate(fields, data) {
    //required fields
    fields.forEach((f) =>
      this.checkRequired(data[f.dataid], f.dataid)
    );
    //shapes, etc.
    this.onSuccess(this.setStatus());
  }
  reset() {
    this.data = { required: [] };
    this.status.value(0);
  }
}
