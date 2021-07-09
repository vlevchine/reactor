import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import {
  AddButton,
  SearchInput,
  EditorButtonGroup,
  EditableText,
  Tag,
  Tabs,
} from '@app/components/core';
import { BasicTable } from '@app/components';
import ItemList from './itemList';
import {
  pageConfig,
  typeItems,
  columns,
  primitive,
  useTabbedLists,
} from './helpers';
import '@app/content/styles.css';

//page-specifc config
export const config = {
  entity: {
    types: {
      options: pageConfig.Type.opts,
      project: 'id name primitive entity company',
      common: 2,
    },
    lookups: {
      options: pageConfig.Type.opts,
      project: 'id name company',
      common: 2,
    },
  },
};

Types.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  ctx: PropTypes.object,
  loadData: PropTypes.func,
};
export default function Types({ loadData, model, ctx }) {
  const {
      state,
      dispatch,
      withCommon,
      canEdit,
      typeItem,
      item,
      onTab,
      onSearch,
      startEdit,
      onNameEdit,
      onAdd,
      onDelete,
      onEditEnd,
    } = useTabbedLists(ctx.user, loadData),
    { tab, selected, editing, touched, search } = state,
    onSelect = async (id) => {
      if (editing) return;
      if (id === selected[tab]?.id) {
        selected[tab] = undefined;
      } else {
        if (id !== primitive.id) {
          const [data] = await loadData([
            withCommon({
              type: 'Type',
              id: id,
              project: 'id name fields',
            }),
          ]);
          selected[tab] = data;
        } else selected[tab] = primitive.items[0];
      }
      dispatch({ selected });
    },
    onEdit = (v, id, op) => {
      let fields = editing.fields;
      if (op === 'remove') {
        const ind = fields.findIndex((e) => e.id === v);
        fields = _.removeAt(fields, ind);
      } else {
        const _id = id.split('.')[1];
        let ind = fields.findIndex((e) => e.id === _id);
        if (ind < 0) ind = fields.length - 1;
        fields = _.replace(fields, ind, v);
      }
      dispatch({ editing: { ...editing, fields } });
    };

  useEffect(async () => {
    const [complex, simple] = _.partition(
        model?.types,
        (e) => e.entity
      ),
      [primitives, composites] = _.partition(
        simple,
        (e) => e.primitive
      ),
      [custom, common] = _.partition(composites, (e) => e.company);
    primitive.items[0].items = primitives;
    columns[1].options = _.unique(simple);
    columns[6].options = model ? _.unique(model?.lookups) : [];
    columns[7].options = complex;
    dispatch({ custom, common });
  }, [model]);

  return (
    <div className="docs">
      <aside className="doc-index">
        <div className="justaposed">
          <h5>Types</h5>
          <AddButton
            onClick={onAdd('Type')}
            className="info"
            size="sm"
            disabled={!!editing}
          />
        </div>
        <Tabs selected={tab} onSelect={onTab}>
          {typeItems.map((e) => (
            <Tabs.Tab id={e.id} name={e.title} key={e.id}>
              {tab === 'common' && (
                <ItemList {...primitive} onSelect={onSelect} />
              )}
              {typeItem.name && (
                <h6 style={{ margin: '1rem 0 0.5rem' }}>
                  {typeItem.name}
                </h6>
              )}
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
                    placeholder="Type name..."
                  />
                ) : (
                  item.name
                )}
              </h5>
              {canEdit && (
                <EditorButtonGroup
                  editing={!!editing}
                  delText="Type definition"
                  //size="sm"
                  saveDisabled={!touched}
                  onDelete={onDelete('Type')}
                  onEdit={startEdit}
                  onEditEnd={onEditEnd('Type')}
                />
              )}
            </div>
            {item.id === 'primitive' ? (
              <ul>
                {primitive.items[0].items.map((e) => (
                  <li key={e.id}>
                    <Tag
                      text={e.name}
                      className="pill"
                      intent="muted"
                      style={{ width: '9rem' }}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <h6>Properties</h6>
                <BasicTable
                  value={item.fields}
                  dataid={item.id || '_new'}
                  canAdd={!!editing}
                  editable={!!editing}
                  noToasts
                  //disabled={!entityType.name}
                  onChange={onEdit}
                  columns={columns}
                />
              </>
            )}
          </>
        ) : (
          <h5>Select type ...</h5>
        )}
      </article>
    </div>
  );
}
