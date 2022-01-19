//import { useState } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { baseInputs, Info } from '@app/components/core';

//const controls = { TextInput, Select, MultiSelect };
FormControl.propTypes = {
  dataid: PropTypes.string,
  id: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.string,
  intent: PropTypes.string,
  messageHint: PropTypes.string,
};
export function FormControl({
  dataid,
  id,
  message,
  type,
  intent,
  messageHint,
  ...props
}) {
  const Ctrl = baseInputs[type] || baseInputs.TextInput,
    //dataid is for Form only, outside, just use id
    _id = dataid || id;
  return (
    <div className="form-ctrl">
      <Ctrl {...props} id={_id} intent={intent} />
      {message && (
        <div className={classNames(['msg', intent])}>
          {message} {messageHint && <Info text={messageHint} />}
        </div>
      )}
    </div>
  );
}

Fieldset.propTypes = {
  label: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  children: PropTypes.any,
};
export function Fieldset({ label, disabled, style, children }) {
  return (
    <fieldset className="form-ctrl" style={style} disabled={disabled}>
      <legend>{label}</legend>
      {children}
      <br />
    </fieldset>
  );
}
