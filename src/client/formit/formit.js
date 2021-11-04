import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { process } from '@app/utils/immutable';
import formHistory from '@app/services/changeHistory';
import '@app/components/core/styles.css';
import { styleItem } from './helpers';
import { useDrag } from '@app/components/core/dnd';
export { default as Field } from './field';
import Section, { InDesignSection } from './section';
import { FormPanelHeader } from './sectionContent';

const updateSelection = (model, selection, selected = {}) => {
  if (!selection) return selected;
  Object.entries(selection).forEach(([path, sel]) => {
    const fullPath = _.dotMerge(path, sel),
      item = _.getIn(model, fullPath);
    Object.assign(selected, {
      [path]: { path: sel, item },
    });
  });
  return selected;
};

function Form(props) {
  const {
      id: formId,
      model: _model,
      type,
      scope,
      def,
      loc,
      style,
      ctx,
      context,
      initialSelection,
      dependency,
      layout,
      title,
      onChange,
      onSelect,
      onAddComponent,
      onTouched,
      readonly,
      stateRef,
      relationship, //{type: 'T_Template', prop: 'tasks},
      ...rest
    } = props,
    _ctx = ctx || {},
    _id = formId || def?.id,
    _contextFunc = context || def?.context,
    titl = title || def?.title,
    history = useRef(),
    [model, setModel] = useState(_model),
    [selection, select] = useState(initialSelection),
    selected = useRef(updateSelection(model, selection)),
    changed = (value, path, op = 'edit', params) => {
      if (scope)
        return onChange(value, path, op, { scope, dependency });
      if (op === 'ui') return;

      //!!!!!!!!!!!!!!!!!
      // const modelNames = _.unique(v.model, 'name');
      // if (modelNames.length < v.model.length)
      //   toaster.danger('Duplicate model property name.');
      //!!!!!!!!!!!!!!!!!!!!!!!!!!!
      //dispatch ui/options, change in resource
      //request data from server per new options
      //????_ctx.onChange?.(msg, change, _id);
      //custom page func - page will provide functionality as needed
      //for controlled form, model will be reset;
      //if no onChange - reset state locally - not controlled
      let n_model, change;
      const scop = params?.scope,
        msg = { op, value, path };
      if (scop)
        Object.assign(msg, {
          path: _.dotMerge(scop, path),
          scope: scop,
        });
      setModel((model = {}) => {
        let [new_model, chng] = process(model, msg);
        const m = scop ? _.getIn(new_model, scop) : new_model,
          deps = ((params ? params.dependency : dependency) || [])
            .filter(([func, k]) => !func(m) && _.getIn(m, k))
            .map(([, k]) => ({
              op: 'edit',
              path: _.dotMerge(scop, k),
            })),
          depChanges = [];
        deps.forEach((msg) => {
          const [new_m, chang] = process(new_model, msg);
          new_model = new_m;
          depChanges.push(chang);
        });
        change = depChanges.length
          ? { ...chng, deps: depChanges }
          : chng;
        const hasChanged = new_model !== model;
        if (hasChanged) n_model = hasChanged && new_model;
        return hasChanged ? new_model : model;
      });
      if (n_model && n_model !== _model) {
        history.current?.addChange(change, n_model);
        onChange?.(n_model, formId, msg, model);
      }
      onTouched?.(history.current?.hasChanges());
    },
    selecting = (path, sel) => {
      const new_selection = { ...selection, [path]: sel };
      select(new_selection);
      updateSelection(model, new_selection, selected.current);
      onSelect?.(path, sel, _.getIn(model, _.dotMerge(path, sel)));
    },
    state = _contextFunc?.(model, _ctx, selection) || {},
    Sect = rest.inDesign ? InDesignSection : Section,
    { ref: dragRef } = useDrag(
      rest.inDesign
        ? {
            id: 'form',
            copy: true,
            dragEnd: onAddComponent,
            update: [def],
          }
        : undefined
    );

  stateRef &&
    useImperativeHandle(
      stateRef,
      () => ({
        changed,
        getState: () => model || {},
        getSelection: (key) => {
          return selected.current[key];
        },
        getHistory: () => history.current,
        getChanges: () => {
          return history.current.getChanges();
        },
        getRemoved: () => {
          return history.current.removed;
        },
        reset: () => {
          setModel(_model);
          history.current.reset();
        },
        isTouched: () => history.current.hasChanges(),
      }),
      [model]
    );

  useEffect(() => {
    //history being reset on model change(save or selecting another item)
    if (_model)
      history.current = formHistory(type, _model.id, relationship);
    //need to refresh if model changes, but also when when editing cancelled
    //readonly gets true, revert to _model
    if (_model !== model) setModel(_model);
  }, [_model, readonly]);

  return (
    <article
      ref={dragRef}
      className="form"
      style={Object.assign(loc ? styleItem(loc) : {}, style)}>
      <FormPanelHeader
        title={titl || (rest.inDesign && '<No title>')}
        className="section">
        {rest.toolbar?.({ id: _id, name: 'Form props' })}
      </FormPanelHeader>
      <Sect
        {...rest}
        readonly={readonly}
        items={def?.items}
        model={model}
        state={state}
        selection={selection}
        ctx={_ctx}
        onChange={changed}
        onSelect={selecting}
        layout={def?.layout || layout}
      />
    </article>
  );
}
Form.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string,
  scope: PropTypes.string,
  title: PropTypes.string,
  model: PropTypes.object,
  ctx: PropTypes.object,
  loc: PropTypes.object,
  style: PropTypes.object,
  def: PropTypes.object,
  initialSelection: PropTypes.object,
  layout: PropTypes.object,
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  onAddComponent: PropTypes.func,
  onTouched: PropTypes.func,
  context: PropTypes.func,
  relationship: PropTypes.object,
  dependency: PropTypes.array,
  className: PropTypes.string,
  readonly: PropTypes.bool,
  validate: PropTypes.bool,
  stateRef: PropTypes.any,
};
export default Form;
export function Component() {}
