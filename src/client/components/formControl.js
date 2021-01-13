import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { mergeIds } from './core/helpers';
import { directControls, controls, Field } from '.'; //InputGroup

const { isString, get, isNil } = _;
//Field is a wrapper over InputWrapper to be used inFormit
//to show HTML components those will be placed as children,
//core components will be accessed via type
FormControl.propTypes = {
  component: PropTypes.string,
  parent: PropTypes.string,
  id: PropTypes.string,
  dataid: PropTypes.string,
  calcid: PropTypes.string,
  ctx: PropTypes.object,
  hidden: PropTypes.oneOf([PropTypes.string, PropTypes.func]),
  meta: PropTypes.object,
  model: PropTypes.object,
  label: PropTypes.string,
  message: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.any,
  style: PropTypes.object,
  wrapStyle: PropTypes.object,
  intent: PropTypes.string,
};
export default function FormControl({
  component,
  parent,
  id,
  dataid,
  calcid,
  ctx = {},
  meta,
  model,
  label,
  message,
  hint,
  intent,
  style,
  wrapStyle,
  //children,
  ...rest
}) {
  const Direct = directControls[component],
    Decoratable = controls.decoratable[component],
    Ctrl = Direct || Decoratable || controls[component];

  const { nav, context, lookups } = ctx,
    { uom, locale } = nav;
  const def = meta?.fields?.find((f) => f.name === dataid),
    value = calcid
      ? get(context, calcid)
      : get(model || ctx.model, dataid),
    options = isString(def?.options)
      ? model[def?.options]
      : lookups[def?.ref],
    did = mergeIds(parent, dataid),
    Inner = (
      <Ctrl
        id={id}
        dataid={did}
        def={def}
        value={value}
        style={style}
        uom={uom}
        locale={locale}
        options={options}
        intent={intent}
        {...rest}
      />
    );

  return (
    <Field
      role="gridcell"
      id={did || id}
      label={label}
      message={message}
      hint={hint}
      intent={intent}
      transient={!Direct}
      hasValue={!isNil(value)}
      wrapStyle={wrapStyle}>
      {Decoratable ? Inner : Inner}
    </Field>
  );
}
