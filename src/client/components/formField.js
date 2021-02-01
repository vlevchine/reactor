import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { mergeIds } from './core/helpers';
import { Info } from './core';
import { directControls, controls } from '.'; //InputGroup

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
  schema: PropTypes.object,
  model: PropTypes.object,
  label: PropTypes.string,
  message: PropTypes.string,
  hint: PropTypes.string,
  icon: PropTypes.string,
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
  schema,
  model,
  label,
  icon,
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
    Ctrl = Direct || Decoratable || controls[component],
    transient = !Direct;

  const { nav = {}, context, lookups } = ctx, //!!!!resources,roles, schema
    { uom, locale } = nav;
  const def = dataid ? schema?.[dataid] : schema,
    value = calcid
      ? _.get(context, calcid)
      : _.get(model || ctx?.model, dataid),
    opts = _.isString(def?.options)
      ? model[def?.options]
      : lookups[def?.ref],
    options = opts?.value || opts,
    did = mergeIds(parent, dataid),
    klass = classNames(['form-field'], {
      [intent]: intent,
      ['no-pad']: !transient,
    }),
    Inner = (
      <Ctrl
        id={did || id}
        dataid={did}
        def={def}
        value={value}
        className={classNames(['form-control'], {
          left: icon,
        })}
        icon={icon}
        style={style}
        uom={uom}
        locale={locale}
        options={options}
        intent={intent}
        lookups={ctx?.lookups}
        {...rest}
      />
    );

  return (
    <div style={wrapStyle} className={klass} role="gridcell">
      {Decoratable ? Inner : Inner}
      {label && (
        <label
          htmlFor={id}
          className={classNames([
            'form-label',
            `lbl-${transient ? 'transient' : 'static'}`,
          ])}>
          {label}
          {hint && <Info text={hint} />}
        </label>
      )}
      {message && <small className="form-message">{message}</small>}
    </div>
  );
}
