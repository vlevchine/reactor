import { Children } from 'react';
import PropTypes from 'prop-types';
import { classNames, _ } from '@app/helpers';
import { mergeIds } from './core/helpers';
import FormControl from './formField';
import { FormPanel, FormTabs } from './formContainers';
import './core/styles.css';

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
  hideItem = (hidden, ctx = {}) =>
    isString(hidden) ? ctx?.[hidden] : hidden?.(ctx);

FormSection.propTypes = {
  parentId: PropTypes.string,
  dataid: PropTypes.string,
  ctx: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.any,
  layout: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  schema: PropTypes.object,
  model: PropTypes.object,
  wrapStyle: PropTypes.object,
  params: PropTypes.object,
  onChange: PropTypes.func,
};

export default function FormSection(props) {
  const {
      layout = 'column',
      parentId,
      dataid,
      schema,
      model,
      params,
      ctx,
      className,
      wrapStyle,
      children,
      onChange,
      ...other
    } = props,
    //layout - {cols, rows} -grid
    klass = classNames([className, 'form-grid']);
  const id = mergeIds(parentId, dataid),
    styled = Object.assign(containerStyle(layout), wrapStyle);

  return (
    <section className={klass} style={styled}>
      {Children.map(children, (child) => {
        const isHtml = isString(child.type);
        const Ctrl = isHtml
            ? child.type
            : containers[child.type.name] || FormControl,
          { loc, style, hidden, ...rest } = child.props,
          wrapStyle = styleItem(loc);

        // Hide it based on condition
        return hideItem(hidden, ctx?.context) ? null : isHtml ? (
          <Ctrl
            {...rest}
            className={classNames([className])}
            style={Object.assign(wrapStyle, style)}
          />
        ) : (
          <Ctrl
            {...other}
            {...rest}
            parent={id}
            schema={dataid ? schema[dataid] : schema}
            params={dataid ? params?.[dataid] : params}
            model={model}
            wrapStyle={wrapStyle}
            style={style}
            ctx={ctx}
            onChange={onChange}
          />
        );
      })}
    </section>
  );
}
