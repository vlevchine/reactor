import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';
import {
  AddButton,
  SearchInput,
  EditorButtonGroup,
  TextInput,
  List,
  Tabs,
} from '@app/components/core';
import ItemList from '@app/content/shared/itemList';
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
};
export default function Lookups({ model, ctx }) {
  const {
      state,
      dispatch,
      toaster,
      canEdit,
      onTab,
      onSearch,
      onSelect,
      startEdit,
      onAdd,
      onEditEnd,
      onDelete,
    } = useTabbedLists(ctx.user),
    { selected, tab, editing, search } = state,
    item = editing || selected[tab],
    fields = item?.fields ? ['name', ...item?.fields] : ['name'],
    onEdit = (v, ids = []) => {
      if (ids === 'name')
        return dispatch({ editing: { ...editing, name: v } });
      const { op, value } = v,
        [prop, id] = ids;
      let items;
      if (op === 'remove') {
        const ind = editing[prop].findIndex((e) => e.id === value);
        items = _.removeAt(editing[prop], ind);
      } else if (op === 'add') {
        if (value.name) {
          value.id = nanoid(6);
          items = [...editing[prop], value];
        } else
          return toaster.warning(
            'Name field is required for lookup object.'
          );
      } else if (op === 'edit') {
        const ind = editing[prop].findIndex((e) => e.id === id),
          n_item = Object.assign({}, editing[prop][ind], value);
        items = _.replace(editing[prop], ind, n_item);
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
              <SearchInput
                value={search[tab]}
                disabled={!!item}
                placeholder="Search type"
                style={{ width: '80%' }}
                onModify={onSearch}
              />
              <ItemList
                id={e.id}
                items={e.items}
                render={(e) => (
                  <span className="smaller">{e.name}</span>
                )}
                onSelect={onSelect('Lookup')}
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
              {editing ? (
                <div className="doc-title">
                  <h6>
                    {item.id ? 'Template name' : 'New Template name'}
                  </h6>
                  <TextInput
                    id="name"
                    value={item?.name}
                    onChange={onEdit}
                  />
                </div>
              ) : (
                <h5>{item?.name}</h5>
              )}
              {canEdit && (
                <EditorButtonGroup
                  editing={!!editing}
                  delText="Lookup definition"
                  //size="sm"
                  saveDisabled={
                    !editing?.name ||
                    (editing?.id && editing === selected?.[tab])
                  }
                  onDelete={onDelete('Lookup')}
                  onEdit={startEdit}
                  onEditEnd={onEditEnd('Lookup')}
                />
              )}
            </div>
            <div className="flex-row">
              <div
                className="flex-column"
                style={{ minWidth: '70%', marginLeft: '2rem' }}>
                <h6 style={{ margin: '0 0 0.5rem 3rem' }}>
                  {fields.join(' / ')}
                </h6>
                <List
                  id="items"
                  items={item?.items}
                  onChange={editing ? onEdit : undefined}
                  fields={fields}
                  config={{ itemProp: 'name' }}
                  className="smaller"
                />
              </div>
            </div>
          </>
        ) : (
          <h5>Select type ...</h5>
        )}
      </article>
    </div>
  );
}
