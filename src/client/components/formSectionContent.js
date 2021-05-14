/* eslint-disable react/prop-types */
import { Children } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { mergeIds } from './core/helpers';
import { Field, containers } from '.';
import { InDesignSection } from './formSection';
import './core/styles.css';

FormPanelHeader.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  className: PropTypes.string,
};
export function FormPanelHeader({ title, children, className }) {
  return title || children ? (
    <div className={classNames(['panel-header', className])}>
      {title && <h6>{title}</h6>}
      {children}
    </div>
  ) : null;
}

const scoped = (src, scope) => (scope ? src?.[scope] : src);

SectionContent.propTypes = {
  title: PropTypes.string,
  parent: PropTypes.string,
  scope: PropTypes.string,
  ctx: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.any,
  items: PropTypes.array,
  layout: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  schema: PropTypes.object,
  model: PropTypes.object,
  wrapStyle: PropTypes.object,
  params: PropTypes.object,
  row: PropTypes.object,
  column: PropTypes.object,
  loc: PropTypes.object,
};
//actual contents of the section to be displayed regardless of the Mode
export default function SectionContent(props) {
  const {
      id,
      parent,
      scope,
      schema,
      model,
      params,
      children,
      items,
      ...rest
    } = props,
    contents =
      items?.map(({ type, ...spec }) => ({ type, spec })) ||
      Children.toArray(children).map(({ type, props }) => {
        const { type: typ, ...spec } = props;
        return { type: typ || type.name, spec };
      });

  return contents.map(({ type, spec }) => {
    const { hide, disable, ...other } = spec,
      { ctx, inDesign, horizontal, onSelect, selected } = rest,
      isContainer = !!containers[type],
      itemId = mergeIds(id, other.id || other.dataid),
      localScope = mergeIds(parent, scope),
      propagate = inDesign && isContainer;
    let Ctrl = containers[type] || Field;
    if (propagate && type === 'Section') Ctrl = InDesignSection;
    // Hide it based on condition - only containers hidden
    //disable containers by setting

    return isContainer && ctx?.state?.[hide] && !inDesign ? null : (
      <Ctrl
        key={itemId}
        {...rest}
        {...other}
        id={itemId}
        type={type}
        parent={localScope}
        onSelect={propagate ? onSelect : undefined}
        selected={propagate ? selected : undefined}
        disableAll={isContainer && ctx?.state?.[disable]}
        // disabled={!isContainer && (disableAll || disableIt)}
        model={scoped(model, localScope)}
        schema={scoped(schema, localScope)}
        params={scoped(params, localScope)}
        horizontal={isContainer ? horizontal : other.horizontal}
      />
    );
  });
}
