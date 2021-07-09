import {  useEffect } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';
import {
  Button,
  AddButton,
  SearchInput,
  EditorButtonGroup,
  EditableText,
  List,
  Tabs,
} from '@app/components/core';
import { Field } from '@app/components/formit';
import ItemList from './itemList';
import { pageConfig, typeItems, useTabbedLists } from './helpers';
import '@app/content/styles.css';

//page-specifc config
export const config = {
  entity: {
    lookups: {
      options: pageConfig.Lookup.opts,
      project: 'id name company',
      common: 2,
    },
  },
};

Lookups.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  ctx: PropTypes.object,
  loadData: PropTypes.func,
};
export default function Lookups({ loadData, model, ctx }) {
  const {
      state,
      dispatch,
      toaster,
      withCommon,
      canEdit,
      item,
      onTab,
      onSearch,
      startEdit,
      onAdd,
      onNameEdit,
      onEditEnd,
      onDelete
    } = useTabbedLists(ctx.user, loadData),
    { selected, tab, editing, touched, search } = state,
    fields = item?.fields ? ['name', ...item?.fields] : ['name'],
    onSelect = async (id) => {
      if (editing) return;
      if (id === selected[tab]?.id) {
        selected[tab] = undefined;
      } else {
        const [data] = await loadData([
          withCommon({
            type: 'Lookup',
            id,
            project: 'id name fields items',
          }),
        ]);
        selected[tab] = data;
      }
      dispatch({ selected });
    },
    onAddProp = (v, id) => {
      if (v?.currentTarget) {
        const [f1, f2] = editing.fields.filter(Boolean);
        if (f1) {
          editing.fields = f1 === f2 ? [f1] : [f1, f2];
        } else delete editing.fields;
        dispatch({ editing: { ...editing, items: [] } });
      } else {
        const [f1, f2] = editing.fields,
          fields = id === '0' ? [v, f2] : [f1, v];
        dispatch({ editing: { ...editing, fields } });
      }
    },
    onEdit = (v, id, done) => {
      if (!done?.accept) return;
      const { op, value } = v;
      let items;
      if (op === 'remove') {
        const ind = editing.items.findIndex((e) => e.id === value);
        items = _.removeAt(editing.items, ind);
      } else if (op === 'add') {
        if (value.name) {
          value.id = nanoid(6);
          items = [...editing.items, value];
        } else
          return toaster.warning(
            'Name field is required for lookup object.'
          );
      } else if (op === 'edit') {
        const ind = editing.items.findIndex((e) => e.id === id),
          n_item = Object.assign({}, editing.items[ind], value);
        items = _.replace(editing.items, ind, n_item);
      }
      dispatch({ editing: { ...editing, items } });
    };

  useEffect(async () => {
    const [custom, common] = _.partition(
      model?.lookups,
      (e) => e.company
    );
    dispatch({ custom, common });
  }, [model]);

  return (
    <div className="docs">
      <aside className="doc-index">
        <div className="justaposed">
          <h5>Lookups</h5>
          <AddButton
            onClick={onAdd('Lookup')}
            className="info"
            size="sm"
            disabled={!canEdit || !!editing}
          />
        </div>
        <Tabs selected={tab} onSelect={onTab}>
          {typeItems.map((e) => (
            <Tabs.Tab id={e.id} name={e.title} key={e.id}>
              <div className="justaposed ">
                <SearchInput
                  value={search[tab]}
                  disabled={!!item}
                  placeholder="Search type"
                  style={{ width: '80%' }}
                  onModify={onSearch}
                />
              </div>
              <ItemList
                id={e.id}
                items={e.items}
                className="smaller"
                onSelect={onSelect}
                selected={selected[tab]?.id}
              />
            </Tabs.Tab>
          ))}
        </Tabs>
      </aside>
      <article className="doc-content">
        {item ? (
          <>
            <div className="justaposed">
              <h5>
                {editing ? (
                  <EditableText
                    value={item.name}
                    onChange={onNameEdit}
                    placeholder="Lookup name..."
                  />
                ) : (
                  item.name
                )}
              </h5>
              {canEdit && (
                <EditorButtonGroup
                  editing={!!editing}
                  delText="Lookup definition"
                  //size="sm"
                  saveDisabled={!touched}
                  onDelete={onDelete('Lookup')}
                  onEdit={startEdit}
                  onEditEnd={onEditEnd('Lookup')}
                />
              )}
            </div>
            {editing && !editing.items ? (
              <div style={{ marginTop: '0.5rem' }}>
                <i>
                  Each lookup object will have a predefined NAME
                  property, to add up to 2 more custom properties type
                  names below.
                </i>
                <div className="flex-row" style={{ width: '30rem' }}>
                  {['0', '1'].map((e, i) => (
                    <Field
                      key={e}
                      type="TextInput"
                      id={e}
                      value={editing.fields[i]}
                      style={{ width: '12rem' }}
                      onChange={onAddProp}
                      clear
                      label={`Extra prop #${i + 1}`}
                    />
                  ))}
                  <Button
                    prepend="check"
                    text="OK"
                    onClick={onAddProp}
                    className="normal"
                    size="md"
                    disabled={!editing}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-row">
                <div
                  className="flex-column"
                  style={{ minWidth: '70%' }}>
                  <h6 style={{ margin: '0 0 0.5rem 1rem' }}>
                    {fields.join(' / ')}
                  </h6>
                  <List
                    id="name"
                    items={item?.items}
                    onChange={editing ? onEdit : undefined}
                    fields={fields}
                    config={{ itemProp: 'name' }}
                    className="smaller"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <h5>Select type ...</h5>
        )}
      </article>
    </div>
  );
}
