import { _ } from '@app/helpers';
import { mergeIds } from './core/helpers';
import { Decorated } from '@app/components';

const { isString, get } = _;
const formControl = (
  Type,
  prps,
  id,
  model,
  meta,
  ctx,
  onChange,
  styled
) => {
  const { dataid, calcid, value, options, style, ...rest } = prps,
    fieldDef = meta?.fields?.find((f) => f.name === dataid),
    val =
      value ||
      (calcid ? get(ctx.context, calcid) : get(model, dataid)),
    opts =
      options ||
      (_.isString(fieldDef?.options)
        ? model[fieldDef?.options]
        : ctx.lookups[fieldDef?.ref]),
    Comp = Decorated[Type.name] || Type;

  return isString(Type) ? (
    <Comp {...rest} style={{ ...style, ...styled }} />
  ) : (
    <Comp
      {...rest}
      role="gridcell"
      dataid={mergeIds(id, dataid)}
      itemStyle={styled}
      style={style}
      value={val}
      options={opts}
      lookups={ctx.lookups}
      meta={fieldDef}
      onChange={onChange}
    />
  );
};

export { formControl };
