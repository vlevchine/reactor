//import { useState } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { toaster } from '@app/services';
import { getProps, allProps, getElement } from './formBuilderHelpers';
import { EditableText, Button } from '@app/components/core';

const _items = 'items',
  getFullName = (str, def) => {
    if (str === def?.id) return `Form [Title: ${def?.title}]`;
    let res = [];
    _.initial(str.split('.')).reduce((acc, e) => {
      const comp = acc?.[_items]?.find((t) => t.id === e);
      if (comp)
        res.push(`${comp.type} [${comp.title || comp.label || ''}]`);
      return comp;
    }, def);
    return res.join(' / ');
  };
FormEditorProps.propTypes = {
  item: PropTypes.object,
  onChange: PropTypes.func,
  canRemove: PropTypes.bool,
  onRemove: PropTypes.func,
};

export default function FormEditorProps({
  item,
  onRemove,
  canRemove,
  onChange,
}) {
  const elem = getElement(item.type),
    actionable = !['EmptyCell', 'Form'].includes(item.type);
  return (
    <>
      <h5>{elem.name || 'Form'}:</h5>
      <i>in:&nbsp;{getFullName()}</i>
      {/* selected, form */}
      <div className="props-content">
        {getProps(item.type).map((k) => {
          const Comp = allProps[k].component || EditableText,
            val = item[k],
            value = allProps[k].asString?.(val, item) || val,
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
              className={classNames(['prop'], {
                vertical: tabsProp,
              })}>
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
        })}
        {actionable && (
          <Button
            className="clip-icon before close danger invert"
            text="Remove"
            style={{
              margin: '0.25rem',
            }}
            disabled={!canRemove}
            onClick={onRemove}
          />
        )}
      </div>
    </>
  );
}
