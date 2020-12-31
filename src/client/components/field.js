import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { mergeIds } from './core/helpers';
import { controls, InputWrapper } from './index'; //InputGroup

const { isString, get, isNil } = _;
//Field is a wrapper over InputWrapper to be used inFormit
//to show HTML components those will be placed as children,
//core components will be accessed via type
Field.propTypes = {
  type: PropTypes.string,
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
export default function Field({
  type,
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
  children,
  ...rest
}) {
  const Ctrl = controls[type] || type,
    { context, lookups } = ctx;
  const def = meta?.fields?.find((f) => f.name === dataid),
    value = calcid
      ? get(context, calcid)
      : get(model || ctx.model, dataid),
    options = isString(def?.options)
      ? model[def?.options]
      : lookups[def?.ref],
    did = mergeIds(parent, dataid);

  return (
    <InputWrapper
      role="gridcell"
      id={did || id}
      label={label}
      message={message}
      hint={hint}
      intent={intent}
      hasValue={!isNil(value)}
      wrapStyle={wrapStyle}>
      {isString(Ctrl) ? (
        <Ctrl>{children}</Ctrl>
      ) : (
        <Ctrl
          id={id}
          dataid={did}
          def={def}
          value={value}
          style={style}
          uom={ctx.uom}
          locale={ctx.locale}
          options={options}
          intent={intent}
          {...rest}
        />
      )}
    </InputWrapper>
  );
}
