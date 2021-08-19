/* eslint-disable react/prop-types */
import { Children } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { Field, containers } from './containers';
import { InDesignSection } from './section';

FormPanelHeader.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  className: PropTypes.string,
};
export function FormPanelHeader({ title, children, className }) {
  return title || children ? (
    <div className={classNames(['panel-header', className])}>
      {title && <span>{title}</span>}
      {children}
    </div>
  ) : null;
}

const scoped = (src, scope) =>
  scope ? _.getIn(src, scope, true) : src;

SectionContent.propTypes = {
  title: PropTypes.string,
  parent: PropTypes.string,
  scope: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.any,
  items: PropTypes.array,
  layout: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  schema: PropTypes.object,
  model: PropTypes.object,
  state: PropTypes.object,
  params: PropTypes.object,
};
//actual contents of the section to be displayed regardless of the Mode
export default function SectionContent(props) {
  const {
      id,
      parent,
      scope,
      schema,
      model,
      state,
      params,
      children,
      items,
      context,
      ...rest
    } = props,
    contents =
      items?.map(({ type, ...spec }) => ({ type, spec })) ||
      Children.toArray(children).map(({ type, props }) => {
        const { type: typ, ...spec } = props;
        return { type: typ || type.name, spec };
      });
  const { ctx, inDesign, horizontal } = rest,
    _state = context ? context(model || {}, ctx) : state; //, onSelect, selected
  // if (context) console.log(_state);

  return contents.map(({ type, spec }) => {
    const { hide, disable, ...other } = spec,
      isContainer = !!containers[type],
      itemId = _.dotMerge(id, other.id || other.dataid),
      propagate = inDesign && isContainer,
      localScope = _.dotMerge(parent, scope),
      _model = scoped(model, localScope);
    let Ctrl = isContainer ? containers[type] : Field;
    if (propagate && type === 'Section') Ctrl = InDesignSection;
    // Hide it based on condition - only containers hidden
    //disable containers by setting
    return isContainer && _state?.[hide] && !inDesign ? null : (
      <Ctrl
        key={itemId}
        {...rest}
        {...other}
        id={itemId}
        type={type}
        parent={localScope}
        state={_state}
        // onSelect={propagate ? onSelect : undefined}
        // selected={propagate ? selected : undefined}
        disableAll={(isContainer && state?.[disable]) || undefined}
        // disabled={!isContainer && (disableAll || disableIt)}
        model={_model}
        schema={scoped(schema, localScope)}
        params={scoped(params, localScope)}
        horizontal={isContainer ? horizontal : other.horizontal}
      />
    );
  });
}
