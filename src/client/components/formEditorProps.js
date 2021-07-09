//import { useState } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { useToaster } from '@app/services';
import { getProps, allProps } from './formEditorHelpers';
import { EditableText } from '@app/components/core';

FormEditorProps.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  selectedItem: PropTypes.object,
  selected: PropTypes.string,
  className: PropTypes.string,
};

export default function FormEditorProps({ item, onChange }) {
  return getProps(item.type).map((k) => {
    const Comp = allProps[k].component || EditableText,
      val = item[k],
      value = allProps[k].asString?.(val, item) || val,
      toaster = useToaster(),
      tabsProp = k === 'tabs',
      changing = (...args) => {
        if (tabsProp) {
          if (args[2] === 'remove' && item.items.length < 3) {
            toaster.warning('Minimum 2 tabs required');
          } else onChange(...args);
        } else onChange(...args);
      };

    return (
      <div
        key={k}
        className={classNames(['prop'], { vertical: tabsProp })}>
        <label>{allProps[k].label}:</label>
        <span className="prop-value">
          <Comp
            id={k}
            toggle
            values={item.items}
            editable
            tagClear
            display={k === 'tabs' ? 'title' : undefined}
            value={value}
            onChange={changing}
            height="1.125rem"
            placeholder="<Property value>"
          />
        </span>
      </div>
    );
  });
}
