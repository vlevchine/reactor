import { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { Button, Tag } from '@app/components/core';
import { useDrag } from '@app/components/core/dnd';
import Form from '@app/formit';
import FormEditorProps from './formBuilderProps';
import {
  createItem,
  allProps,
  elements,
  //isContainer,
} from './formBuilderHelpers';
import '@app/content/styles.css';

const _items = 'items',
  findComponent = (obj, id, def_val) =>
    id ? _.getIn(obj, _.insertBetween(id, _items)) : def_val,
  loc2Object = (loc) => {
    const [row, col] = loc.split(':');
    return { row, col };
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
FormBuilder.propTypes = {
  def: PropTypes.object,
  onChange: PropTypes.func,
  model: PropTypes.object,
  cache: PropTypes.object,
  className: PropTypes.string,
};
export default function FormBuilder({ def, onChange, ...rest }) {
  const form = def || createItem('Form'),
    [selected, select] = useState(form.id),
    [propsCollapsed, toggleProps] = useState(false),
    onSelect = (id) => {
      select(id || form.id);
    },
    onRemove = () => {
      const sels = selected.split('.'),
        msg = { op: 'remove', value: _.last(sels) };
      if (sels.length > 1) msg.path = _.initial(sels);
      onChange(msg);
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
    onPropChanged = (v, prop, status) => {
      //, pth
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
                  : // : isContainer(selectedItem.type)
                    // ? _.insertOver(selected, _items)
                    _.insertLeft(selected, _items),
              value: { [prop]: fn(v, selectedItem) },
            };
      onChange(msg, form);
      // const [updated] = process(form, msg);
      // setForm(updated);
    },
    selectedItem =
      selected === form.id
        ? form
        : findComponent(form[_items], selected, form) || {
            type: 'EmptyCell',
            id: '--22',
            loc: loc2Object(selected),
          };

  useLayoutEffect(() => {
    // window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="editor"
      style={{ ['--propWidth']: propsCollapsed ? 0 : '15rem' }}>
      <div className="edit-toolbar">
        <h6>Add field</h6>
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
          model={undefined}
          inDesign
          onSelect={onSelect}
          onAddComponent={onDrag}
          selected={selected}
          toolbar={({ name, id, hide, disable }) => {
            return (
              <>
                <Button
                  className="secondary invert"
                  text={`<${name}>`}
                  size="xs"
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
                    className="info invert"
                    onClick={() => toggleProps((e) => !e)}
                  />
                )}
              </>
            );
          }}
        />
      </div>
      <div
        className={classNames(['props-editor'], {
          off: propsCollapsed,
        })}>
        <FormEditorProps
          item={selectedItem}
          onChange={onPropChanged}
          onRemove={onRemove}
          canRemove={selected !== form.id}
        />
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
