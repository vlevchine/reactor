import { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { Button, Tag } from '@app/components/core';
import { mergeIds } from '@app/components/core/helpers';
import { useDrag } from '@app/components/core/dnd';
import Form from '@app/components/formit';
import FormEditorProps from './formEditorProps';
import { createItem, allProps, elements } from './formEditorHelpers';
import '@app/content/styles.css';

const _items = 'items',
  findComponent = (obj, id, def_val) =>
    id ? _.getIn(obj, _.insertBetween(id, _items)) : def_val,
  getFullName = (str, def) => {
    if (str === def.id) return `Form [Title: ${def.title}]`;
    let res = [];
    str.split('.').reduce((acc, e) => {
      const comp = acc?.[_items]?.find((t) => t.id === e);
      if (comp)
        res.push(`${comp.type} [${comp.title || comp.label}]`);
      return comp;
    }, def);
    return res.join(' / ');
  };

Toolbar.propTypes = {
  title: PropTypes.string,
  id: PropTypes.string,
  items: PropTypes.array,
  onChange: PropTypes.func,
};
function Toolbar({ title, id, items }) {
  const { ref } = useDrag({
    id,
    toolbar: true,
  });
  return (
    <>
      <h6 className="undelined">{title}</h6>
      <div ref={ref} className="tags">
        {items.map(({ id, label }) => (
          <Tag
            key={id}
            id={id}
            text={label}
            dragAllowed
            className="pill"
          />
        ))}
      </div>
    </>
  );
}
FormEditor.propTypes = {
  def: PropTypes.object,
  onChange: PropTypes.func,
  model: PropTypes.object,
  boundTo: PropTypes.string,
  cache: PropTypes.object,
  store: PropTypes.object,
  className: PropTypes.string,
};
export default function FormEditor({
  def,
  // boundTo,
  onChange,
  ...rest
}) {
  const form = def || createItem('Form'),
    [selected, select] = useState(form.id),
    [propsCollapsed, toggleProps] = useState(false),
    onSelect = (id) => {
      select(id || form.id);
    },
    onRemove = () => {
      const [root, value] = selected.split('.'),
        msg = {
          op: 'remove',
          path: _.insertOver(root, _items),
          value,
        };
      onChange(msg);
      //[updated] = process(form, msg);
      // setForm(updated);
    },
    onDrag = ({ from, to }) => {
      const { id, ind } = from,
        ids = to.drop_id.split('.'),
        [row, col] = _.last(ids).split(':').map(Number),
        comp = elements[id]?.[ind];
      const value = createItem(comp.id, { row, col }),
        path = _.insertOver(_.initial(ids), _items),
        msg = { op: 'add', path, value };
      onChange(msg, form);
      // setForm((form) => {
      //   const [updated] = process(form, msg);
      //   return updated;
      // });
    },
    onPropChanged = (v, prop, status, pth) => {
      if (status === false) return;
      const fn = allProps[prop].parse || _.identity,
        addRemove = _.isString(status),
        msg = addRemove
          ? {
              op: status,
              path: _.insertOver(selected, _items),
              value: v,
            }
          : {
              op: 'update',
              path:
                selected === def.id
                  ? ''
                  : _.insertLeft(mergeIds(selected, pth), _items),
              value: { [prop]: fn(v, selectedItem) },
            };
      onChange(msg, form);
      // const [updated] = process(form, msg);
      // setForm(updated);
    },
    selectedItem =
      findComponent(form[_items], selected, form) || form;

  useLayoutEffect(() => {
    // window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="editor"
      style={{ ['--propWidth']: propsCollapsed ? 0 : '15rem' }}>
      <div className="edit-toolbar">
        <h5>Toolbar</h5>
        <Toolbar
          title="Containers"
          id="containers"
          items={elements.containers}
        />
        <Toolbar
          title="Components"
          id="components"
          items={elements.components}
        />
      </div>
      <div className="edit-preview">
        <Form
          {...rest}
          def={form}
          boundTo={undefined}
          model={undefined}
          inDesign={true}
          onSelect={onSelect}
          onAddComponent={onDrag}
          selected={selected}
          toolbar={({ name, id, hide, disable }) => {
            return (
              <>
                <Button
                  className="secondary btn-invert"
                  text={`<${name}>`}
                  style={{ fontSize: '0.92em' }}
                  disabled={disable}
                  onClick={() => onSelect(id)}
                />
                {hide && (
                  <Button
                    id={id}
                    text={
                      propsCollapsed ? 'Show props' : 'Hide props'
                    }
                    style={{ marginLeft: '0.5rem' }}
                    className="info btn-invert"
                    onClick={() => toggleProps((e) => !e)}
                  />
                )}
              </>
            );
          }}
        />
      </div>

      <div
        className={classNames([
          'props-editor',
          propsCollapsed ? 'off' : '',
        ])}>
        <h6>Selected component:</h6>
        <i>{getFullName(selected, form)}</i>
        <div className="props-content">
          <Button
            className="clip-icon before close danger btn-invert"
            text="Remove"
            style={{
              margin: '0.25rem',
            }}
            disabled={selected === form.id}
            onClick={onRemove}
          />

          <FormEditorProps
            item={selectedItem}
            onChange={onPropChanged}
          />
        </div>
      </div>
    </div>
  );
}

{
  /*  <div className="edit-tree">
        
        <Accordion
          items={formTree}
          onSelect={onSelect}
          expandAll
          selected={selected}
          selectedClass="selected"
          spec={{
            items: 'items',
            iconExpand: true,
            id: (e) => `${e.row.row}_${e.column.col}`,
            label: ({ type, loc }) =>
              type === 'Tab' || type === 'Form'
                ? type
                : `${type}${` - [${loc?.row},${loc?.col}]`}`,
            icon: (e) => containerIcon(e.type),
          }}
        /> 
      </div>*/
}
