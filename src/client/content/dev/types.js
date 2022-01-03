import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import {
  AddButton,
  EditorButtonGroup,
  TextInput,
  Tag,
  Tabs,
  ItemList,
} from '@app/components/core';
import { BasicTable } from '@app/components';
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
  blocker: PropTypes.func,
};
export default function Types({ model, ctx, blocker }) {
  const {
      state,
      dispatch,
      canEdit,
      typeItem,
      onTab,
      onSearch,
      onSelect,
      startEdit,
      onNameEdit,
      onAdd,
      onDelete,
      onEditEnd,
    } = useTabbedLists(ctx.user),
    { tab, selected, editing, search } = state,
    item = editing || selected[tab],
    onEdit = (v, id, op) => {
      if (id === 'name')
        return dispatch({ editing: { ...editing, name: v } });
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
    },
    primitiveTypes = primitive.items[0];

  useEffect(async () => {
    if (!model?.types) return;
    const [complex, simple] = _.partition(
        model.types,
        (e) => e.entity
      ),
      [primitives, composites] = _.partition(
        simple,
        (e) => e.primitive
      ),
      [custom, common] = _.partition(composites, (e) => e.company);
    primitiveTypes.items = primitives;
    columns[1].options = _.unique(simple);
    columns[6].options = model ? _.unique(model?.lookups) : [];
    columns[7].options = complex;
    dispatch({ custom, common });
  }, [model]);

  blocker(!!editing);

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
                <>
                  <h6 className="item-list-title">
                    {primitiveTypes.name}
                  </h6>
                  {primitiveTypes.items.map((e) => (
                    <Tag
                      key={e.id}
                      text={e.name}
                      className="pill"
                      intent="muted"
                      style={{ margin: '0.125rem' }}
                    />
                  ))}
                </>
              )}
              <ItemList
                id={e.id}
                title={typeItem.name}
                items={e.items}
                render={(e) => (
                  <span className="smaller">{e.name}</span>
                )}
                onSelect={onSelect('Type')}
                selected={selected[tab]?.id}
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
              {editing ? (
                <div className="doc-title">
                  <h6>
                    {item.id ? 'Template name' : 'New Template name'}
                  </h6>
                  <TextInput
                    id="name"
                    value={item?.name}
                    onChange={onNameEdit}
                  />
                </div>
              ) : (
                <h5>{item?.name}</h5>
              )}
              {canEdit && (
                <EditorButtonGroup
                  editing={!!editing}
                  delText="Type definition"
                  //size="sm"
                  saveDisabled={
                    !editing?.name ||
                    (editing?.id && editing === selected?.[tab])
                  }
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
