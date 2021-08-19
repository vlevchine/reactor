import { Fragment, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
//import { nanoid } from 'nanoid';
import { _ } from '@app/helpers'; //classNames
import { useDialog, useToaster, useData } from '@app/services';
//import { process } from '@app/utils/immutable';
import '@app/content/styles.css';
import {
  AddButton,
  Icon,
  SearchInput,
  WithPrompt,
} from '@app/components/core';
import { formRequest } from '@app/content/helpers';
import ItemList from '@app/content/shared/itemList';
import ProcEditor from '@app/content/shared/procEditor';

//page-specifc config
const procSpec = {
    type: 'P_Template',
    project: 'id name group type tasks company',
    options: { sort: { name: 'asc' } },
    common: 2,
  },
  taskSpec = {
    type: 'T_Template',
    filter: { ref: null },
    project: 'id name ref',
    options: { sort: { name: 'asc' } },
    common: 2,
  },
  getState = (task, snapshot, pathname, taskName) => ({
    task,
    taskName,
    procName: snapshot.editing.name,
    parentPath: 'tasks',
    back: { pathname, snapshot },
  }),
  taskPage = (pathname, id) =>
    [..._.initial(pathname.split('/')), 'taskDefs', id].join('/');

export const config = {
    entity: [procSpec, taskSpec],
  },
  addDialog = {
    title: 'Add Process definition',
    text: 'Select new Process name, group and type',
    cancelText: 'Cancel',
    form: {
      layout: { cols: 2, rows: 2 },
      items: [
        {
          type: 'TextInput',
          dataid: 'name',
          loc: { row: 1, col: 1, colSpan: 2 },
          clear: true,
          required: true,
          label: 'Name',
        },
        {
          type: 'Select',
          dataid: 'group',
          loc: { row: 2, col: 1 },
          label: 'Template group',
          clear: true,
          required: true,
          display: 'name',
        },
        {
          type: 'Select',
          dataid: 'type',
          loc: { row: 2, col: 2 },
          label: 'Project type',
          clear: true,
          required: true,
          display: 'name',
        },
      ],
    },
  };

const itemRender = (e) => {
  const comp = e.company;
  return (
    <>
      <Icon
        style={{ marginRight: '0.5rem' }}
        name={comp ? 'exclamation' : 'share-square'}
        styled={comp ? 'r' : 'l'}
        //tooltip={'Shared tempate'}
      />
      <span>{e.name}</span>
    </>
  );
};
async function requestProc(items, id, loadData) {
  const item = _.findById(items, id),
    [data] = await loadData([
      {
        type: procSpec.type,
        id,
        common: item.company ? 0 : 1,
      },
    ]);
  return data;
}
ProcDefs.propTypes = {
  model: PropTypes.array,
  ctx: PropTypes.object,
  workflowConfig: PropTypes.object,
  pageInfo: PropTypes.object,
};
export default function ProcDefs({
  model,
  ctx,
  workflowConfig,
  pageInfo,
}) {
  const { projectGroups, projectTypes } = workflowConfig,
    dialog = useDialog(),
    toaster = useToaster(),
    { loadData } = useData(),
    navigate = useNavigate(),
    [state, dispatch] = useReducer(_.merge, {}),
    { items, editing, selected, search } = state,
    taskTemplates = useRef([]),
    onSelect = async (id) => {
      if (editing) return;
      if (id === selected?.id) {
        dispatch({ selected: null });
      } else {
        const selected = await requestProc(items, id, loadData);
        dispatch({ selected });
      }
    },
    onSearch = (search) => dispatch({ search }),
    onEditing = async (edit, payload) => {
      const res = { editing: edit ? selected : undefined };
      if (payload) {
        const reqs = payload.map(formRequest);
        reqs.push({ ...procSpec });
        const { item, changes } = payload,
          response = await loadData(reqs);
        res.items = _.last(response);
        res.selected = _.findById(res.items, selected.id);
        toaster.info(
          `Process template definition ${
            item || changes ? 'saved' : 'deleted'
          }`,
          true
        );
      }
      dispatch(res);
    },
    onAdd = async () => {
      addDialog.form.items[1].options = projectGroups;
      addDialog.form.items[2].options = projectTypes;
      const { ok, data } = await dialog(addDialog);
      if (ok) {
        data.items = [];
        data.model = [];
        dispatch({
          editing: data,
          selected: undefined,
        });
      }
    },
    onTaskEdit = (task, name) => {
      const { pathname } = pageInfo,
        path = taskPage(pathname, task.id),
        state = getState(task, { selected, editing }, pathname, name);
      navigate(path, { state });
    },
    onTaskInit = async (taskId, tempId) => {
      let task,
        { pathname } = pageInfo,
        path = taskPage(pathname, taskId);
      if (tempId) {
        const [data] = await loadData([
          { type: taskSpec.type, id: tempId, common: 2 },
        ]);
        data.id = taskId;
        task = data;
      } else task = { id: taskId };
      navigate(path, { state: getState(task, editing, pathname) });

      //const pldTask = formRequest({ type: taskSpec.type, item });
      // pldTask.item.id = nanoid();
      // const pldProc = formRequest({
      //   type: procSpec.type,
      //   id: selected.id,
      //   changes: [
      //     {
      //       path: [...path, 'ref'],
      //       value: pldTask.item.id,
      //       op: 'edit',
      //     },
      //   ],
      // });
      // const res = await loadData([pldTask, pldProc]),
      //   itm = res[1].value;
      // dispatch({ selected: itm, editing: itm });
    },
    item = selected || editing,
    canAdd = ctx.user.isDev() || ctx.user.isOwner(),
    canEdit =
      item &&
      (!selected || selected.company
        ? ctx.user.isDev()
        : ctx.user.isOwner());

  const filtered = search
    ? items.filter((e) => new RegExp(search, 'i').test(e.name))
    : items || [];
  const groups = _.groupBy(filtered, (e) => e.group);

  useEffect(async () => {
    const { selected, editing } = pageInfo.state,
      res = { selected, editing };
    if (model) {
      taskTemplates.current = model[1];
      res.items = model[0];
    }
    dispatch(res); //force render
  }, [model]);

  return (
    <div className="docs">
      <aside className="doc-index">
        <div
          className="justaposed"
          style={{ marginBottom: '0.5rem' }}>
          <h5>Templates</h5>
          <AddButton
            onClick={onAdd}
            className="info"
            size="sm"
            disabled={!canAdd || !!editing}
          />
        </div>
        <SearchInput
          value={search}
          disabled={!!selected}
          placeholder="Search type"
          style={{ width: '98%' }}
          onModify={onSearch}
        />
        {projectGroups.map((g) => {
          return (
            <Fragment key={g.id}>
              <h6
                style={{
                  marginTop: '1rem',
                  color: 'var(--secondary)',
                }}>
                {g.name}
              </h6>
              <ItemList
                items={groups[g.id]}
                render={itemRender}
                onSelect={onSelect}
                selected={selected?.id}
              />
            </Fragment>
          );
        })}
      </aside>
      <article className="doc-content">
        <WithPrompt
          condition={item}
          text="Select process to view details">
          <ProcEditor
            type={procSpec.type}
            def={item}
            ctx={ctx}
            canEdit={canEdit}
            onEditStatus={onEditing}
            onTaskInit={onTaskInit}
            onTaskEdit={onTaskEdit}
            activeTask={pageInfo.state?.task}
            taskTemplates={taskTemplates.current}
            workflowConfig={workflowConfig}
          />
        </WithPrompt>
      </article>
    </div>
  );
}
