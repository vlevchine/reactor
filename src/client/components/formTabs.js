import { Children } from 'react';
import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import { mergeIds } from './core/helpers';
import './core/styles.css';
import Field from './field';

const { isString } = _,
  containerStyle = (layout, flex) =>
    flex
      ? { flexDirection: layout }
      : {
          gridTemplateColumns: `repeat(${
            layout.cols || 1
          }, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${layout.rows || 1}, auto)`,
        },
  containers = ['Group', 'Section', 'Tabs'],
  getMeta = (schema, { dataid, boundTo, bound }, meta) => {
    let met = schema?.[bound] || schema?.[boundTo?.valueType] || meta,
      field;
    if (met?.fields && dataid)
      field = meta.fields.find((f) => f.name === dataid);

    return schema[field?.type] || met;
  };

FormTabs.propTypes = {
  parentId: PropTypes.string,
  dataid: PropTypes.string,
  ctx: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.any,
  layout: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  meta: PropTypes.object,
  model: PropTypes.object,
  onChange: PropTypes.func,
};

export default function FormTabs(props) {
  const {
      layout = 'column',
      parentId,
      dataid,
      meta,
      model,
      ctx,
      className,
      children,
      onChange,
    } = props,
    //layout - possible values: column, row -flex, {cols, rows} -grid
    isFlex = isString(layout),
    klass = classNames([
      className,
      `form-${isFlex ? 'flex' : 'grid'}`,
    ]);
  const met = getMeta(ctx.schema, props, meta),
    id = mergeIds(parentId, dataid);

  return (
    <section className={klass} style={containerStyle(layout, isFlex)}>
      {Children.map(children, (child) => {
        const Type = child.type.name || child.type,
          Ctrl = containers.includes(Type.name) ? Type : Field;
        return (
          <Ctrl
            {...child.props}
            parent={id}
            meta={met}
            model={model}
            ctx={ctx}
            onChange={onChange}
          />
        );
      })}
    </section>
  );
}
