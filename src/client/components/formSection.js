/* eslint-disable react/prop-types */
import { Children } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { mergeIds } from './core/helpers';
import { Field, containers } from '.';
import { containerStyle, styleItem } from './helpers';
import './core/styles.css';

SectionContent.propTypes = {
  items: PropTypes.array,
  children: PropTypes.any,
  schema: PropTypes.object,
  state: PropTypes.object,
  scope: PropTypes.string,
  params: PropTypes.object,
  disableAll: PropTypes.bool,
};
function SectionContent({
  items,
  children,
  scope,
  state,
  schema,
  params,
  disableAll,
  ...upperRest
}) {
  const contents =
    items?.map(({ type, ...spec }) => ({ type, spec })) ||
    Children.toArray(children).map(({ type, props }) => {
      const { type: typ, ...spec } = props;
      return { type: typ || type.name, spec };
    });
  return contents.map(({ type, spec }, i) => {
    const { hide, disable, ...rest } = spec,
      isContainer = !!containers[type],
      Ctrl = containers[type] || Field;
    //console.log(rest.id, !isContainer && disable);
    // Hide it based on condition - only containers hidden
    //disable containers by setting
    return isContainer && hide?.(state) ? null : (
      <Ctrl
        key={rest.id || rest.dataid || i}
        {...upperRest}
        {...rest}
        type={type}
        parent={scope}
        disableAll={isContainer && disable?.(state)}
        disabled={!isContainer && disableAll}
        schema={schema}
        params={params}
      />
    );
  });
}
Section.propTypes = {
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
  onChange: PropTypes.func,
  row: PropTypes.object,
  column: PropTypes.object,
  loc: PropTypes.object,
};

export default function Section(props) {
  const {
      title,
      layout = 'column',
      parent,
      scope,
      schema,
      model,
      params,
      ctx,
      className,
      children,
      items,
      loc,
      ...rest
    } = props,
    klass = classNames([className, 'form-grid']),
    content = (
      <SectionContent
        {...rest}
        items={items}
        state={ctx.state}
        ctx={ctx}
        scope={mergeIds(parent, scope)}
        model={model[scope] || model}
        schema={scope ? schema[scope] : schema}
        params={scope ? params?.[scope] : params}>
        {children}
      </SectionContent>
    );

  return loc ? (
    <section className="form-grid-item" style={styleItem(loc)}>
      {title && <h6>{title}</h6>}
      <div className={klass} style={containerStyle(layout)}>
        {content}
      </div>
    </section>
  ) : (
    <section className={klass} style={containerStyle(layout)}>
      {content}
    </section>
  );
}
