import { useMemo, Children } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { classNames, _ } from '@app/helpers';
import { mergeIds } from './core/helpers';
import { Collapsible } from '@app/components/core';
import './core/styles.css';
import Field from './field';
import FormTabs from './formTabs';

FormPanel.propTypes = {
  title: PropTypes.string,
};
export function FormPanel({ title, ...rest }) {
  const id = useMemo(() => nanoid(4), []);
  //TBD: always start open???
  return (
    <Collapsible
      id={id}
      title={title}
      className="panel-title"
      open={true}>
      {<FormSection {...rest} />}
    </Collapsible>
  );
}

const { isString } = _;
const containerStyle = (layout) => ({
    gridTemplateColumns: `repeat(${
      layout.cols || 1
    }, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${layout.rows || 1}, auto)`,
  }),
  styleItem = (loc) => {
    if (!loc) return undefined;
    const { row = 1, col = 1, rowSpan = 1, colSpan = 1 } = loc;
    return {
      gridArea: `${row} / ${col} / ${row + rowSpan} / ${
        col + colSpan
      }`,
      justifySelf: 'stretch', // width: '100%',
    };
  },
  containers = { FormSection, FormPanel, FormTabs },
  getMeta = (schema, dataid, meta) => {
    let field = meta?.fields?.find((f) => f.name === dataid);
    return schema[field?.type] || meta;
  },
  hideItem = (hidden, ctx = {}) =>
    isString(hidden) ? ctx[hidden] : hidden?.(ctx);

FormSection.propTypes = {
  parentId: PropTypes.string,
  dataid: PropTypes.string,
  ctx: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.any,
  layout: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  meta: PropTypes.object,
  model: PropTypes.object,
  wrapStyle: PropTypes.object,
  onChange: PropTypes.func,
};

export default function FormSection(props) {
  const {
      layout = 'column',
      parentId,
      dataid,
      meta,
      model,
      ctx,
      className,
      wrapStyle,
      children,
      onChange,
    } = props,
    //layout - {cols, rows} -grid
    klass = classNames([className, 'form-grid']);
  const met = getMeta(ctx.schema, dataid, meta),
    id = mergeIds(parentId, dataid),
    styled = Object.assign(containerStyle(layout), wrapStyle);

  return (
    <section className={klass} style={styled}>
      {Children.map(children, (child) => {
        const isHtml = isString(child.type);
        const Ctrl = isHtml
            ? child.type
            : containers[child.type.name] || Field,
          { loc, style, hidden, ...rest } = child.props;

        // Hide it based on condition
        return hideItem(hidden, ctx.context) ? null : isHtml ? (
          <Ctrl {...rest} style={style} />
        ) : (
          <Ctrl
            {...rest}
            parent={id}
            meta={met}
            model={model}
            wrapStyle={styleItem(loc)}
            style={style}
            ctx={ctx}
            onChange={onChange}
          />
        );
      })}
    </section>
  );
}
