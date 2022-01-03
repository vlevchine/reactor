import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';
import { useData } from '@app/services'; // useDialog, useToaster
import { process } from '@app/utils/immutable';
import { lookupsCache, typesCache } from '@app/services/indexedCache'; // entityCache,
import FormBuilder from '@app/components/formBuilder';
import Form from '@app/formit';
//import { getItemHistory } from '@app/services/changeHistory';
import {
  CancelButton,
  SaveButton,
  Button,
  // EditableText,
  Tabs,
} from '@app/components/core';
import SchemaEditor from './schemaEditor';

export const config = {};
const type = 'F_Template',
  key = 'form',
  none = 'new_task',
  initForm = () => ({
    type: 'Form',
    id: _.generateId(key),
    layout: { cols: 2, rows: 2 },
    // title: 'Sample Form',
    schema: { entity: {}, types: [] },
    items: [
      // {
      //   type: 'NumberInput',
      //   id: '_1',
      //   dataid: 'age',
      //   loc: { row: 1, col: 1 },
      //   // prepend: 'user',
      //   // append: 'cog',
      //   label: 'Age',
      // },
    ],
  });

FormEditor.propTypes = {
  uri: PropTypes.string,
  ctx: PropTypes.object,
  className: PropTypes.string,
};
export default function FormEditor({ ctx, className = '' }) {
  console.log(ctx);
  const { nav, currentPage = {} } = ctx,
    { pageParams, pathname } = currentPage,
    state = nav.get(pathname) || {},
    { proc, task, canEdit } = state,
    id = pageParams?.id;

  const itemInitial = useRef(),
    config = useRef(),
    [item, setItem] = useState(),
    { entity, types = {} } = item?.schema || {},
    { loadEntity, addToDomain } = useData(),
    navigate = useNavigate(), //, setEntityType
    enhancedTypes = [
      ...(config.current?.types || []),
      ...Object.keys(types).map((e) => ({ id: e, name: e })),
    ],
    onEditEnd = async (ev, _id) => {
      const { path, ...value } = state;
      if (_id === 'save') {
        await addToDomain(item, type, proc.id); //report form id only if new one created and saved
        task.formId = item.id;
        value.changed = true;
        // await saveEntity(
        //   { type, op: new_item ? 'add' : 'update', item },
        //   { depends: new_item ? proc.id : undefined }
        // );
      } else value.changed = false;
      nav.clear(pathname);
      nav.dispatch({ path, value });
      navigate(path);
    },
    onChange = (msg, frm) => {
      if (msg.value.id) msg.value.dataid = msg.value.id;
      const [updated] = process(item || frm, msg);
      setItem(updated);
    },
    onTypeProp = (value, path, op) => {
      const msg = { op, value, path };
      //if (op === 'add') value.type = config.current.types[0].id;
      const [updated] = process(item, msg);
      setItem(updated);
    },
    addType = () => {
      const [updated] = process(item, {
        op: 'update',
        value: { [`Inner-${nanoid(2)}`]: {} },
        path: 'schema.types',
      });
      setItem(updated);
    };

  useEffect(async () => {
    itemInitial.current =
      id === none ? initForm() : await loadEntity({ type, id }, type);
    setItem(itemInitial.current);
  }, [id]);
  useEffect(async () => {
    const [lookups, types] = await Promise.all([
      lookupsCache.getAll(),
      typesCache.getAll(),
    ]);
    config.current = { lookups, types };
  }, []);

  return (
    <div className={className}>
      <div className="justaposed">
        {proc && (
          <h6>{`Form Template for process: "${proc.name}" /  task: "${task.name}"`}</h6>
        )}
        <div>
          <CancelButton
            id="cancel"
            text="Cancel changes"
            onClick={onEditEnd}
            style={{ marginRight: '0.5rem' }}
          />
          <SaveButton
            id="save"
            text="Accept changes"
            onClick={onEditEnd}
            disabled={itemInitial.current === item}
          />
        </div>
      </div>
      <Tabs selected={canEdit ? 'design' : 'preview'}>
        {canEdit && (
          <Tabs.Tab id="design" name="Design">
            <FormBuilder def={item} onChange={onChange} ctx={ctx} />
          </Tabs.Tab>
        )}
        <Tabs.Tab id="preview" name="Preview">
          <Form
            //{...rest}
            def={item}
            ctx={ctx}
          />
        </Tabs.Tab>
        <Tabs.Tab id="schema" name="Schema">
          <div className="flex-row" style={{ marginTop: '0.5rem' }}>
            <div style={{ width: '70%' }}>
              <h6>Form model schema</h6>
              {entity && (
                <SchemaEditor
                  value={entity}
                  dataid={'schema.entity'}
                  disabled={!canEdit}
                  onChange={onTypeProp}
                  lookups={config.current?.lookups}
                  types={enhancedTypes}
                />
              )}
            </div>
            <div style={{ width: '28%', marginLeft: '0.5rem' }}>
              <div className="justaposed">
                <h6>Additional types</h6>
                <Button
                  id="types"
                  prepend="plus"
                  text="Add Type"
                  size="sm"
                  disabled={!canEdit}
                  className="muted invert"
                  onClick={addType}
                />
              </div>
              {Object.entries(types).map(([name, e]) => (
                <div key={name}>
                  <h6>{name}</h6>
                  {/* <EditableText
                    style={{ margin: '-0.125rem 0 0 1rem' }}
                    value={name}
                    id={e.id}
                    disabled={!canEdit}
                    onChange={onNameChange}
                    placeholder="Type name..."
                  /> */}
                  <SchemaEditor
                    dataid={`schema.types.${name}`}
                    value={e}
                    disabled={!canEdit}
                    onChange={onTypeProp}
                    skip={[
                      'required',
                      'multi',
                      'shape',
                      'lookups',
                      'ref',
                    ]}
                    types={config.current?.types}
                  />
                </div>
              ))}
            </div>
          </div>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
}
