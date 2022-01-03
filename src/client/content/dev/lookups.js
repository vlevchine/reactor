import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import {
  AddButton,
  EditorButtonGroup,
  TextInput,
  List,
  Tabs,
  ItemList,
} from '@app/components/core';
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

const nameField = { id: 'name', name: 'Name' };
Lookups.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  ctx: PropTypes.object,
};
export default function Lookups({ model, ctx }) {
  const {
      state,
      dispatch,
      onTab,
      onSearch,
      onSelect,
      startEdit,
      onAdd,
      onEditEnd,
      onDelete,
    } = useTabbedLists(ctx.user),
    canEdit = true,
    { selected, tab, editing, search } = state,
    item = editing || selected[tab],
    fields = item?.fields
      ? [nameField, ...item?.fields]
      : [nameField],
    onEdit = (v, id, op) => {
      if (id === 'name')
        return dispatch({ editing: { ...editing, [id]: v } });
      let items;
      if (op === 'remove') {
        const ind = editing[id].findIndex((e) => e.id === v);
        items = _.removeAt(editing[id], ind);
      } else if (op === 'add') {
        items = [...editing[id], v];
      } else if (op === 'edit') {
        const _id = v.id,
          ind = editing[id].findIndex((e) => e.id === _id);
        items = _.replace(editing[id], ind, v);
      }
      dispatch({ editing: { ...editing, items } });
    },
    selecting = useMemo(() => onSelect('Lookup'), []),
    selectedItem = selected[tab];

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
              <ItemList
                id={e.id}
                items={e.items}
                render={(e) => (
                  <span className="smaller">{e.name}</span>
                )}
                onSelect={editing ? undefined : selecting}
                selected={selectedItem?.id}
                searchTerm={search[tab]}
                onSearch={onSearch}
              />
            </Tabs.Tab>
          ))}
        </Tabs>
      </aside>
      <article className="doc-content">
        {item ? (
          <>
            <div className="justaposed">
              <div className="doc-title">
                <h6>Lookup name:</h6>
                <TextInput
                  id="name"
                  value={item?.name}
                  onChange={onEdit}
                  readonly={!editing}
                />
              </div>

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
            <div className="flex-column mt-4">
              <List
                id="items"
                value={item?.items}
                onChange={onEdit}
                readonly={!editing}
                numbered
                fields={fields}
                style={{ width: '70%' }}
                //className="full-width"
              />
            </div>
          </>
        ) : (
          <h5>Select type ...</h5>
        )}
      </article>
    </div>
  );
}
