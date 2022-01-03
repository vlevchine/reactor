import { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { _, classNames } from '@app/helpers'; //
import { useDialog, toaster, useData } from '@app/services';
import {
  AddButton,
  Icon,
  Info,
  SearchInput,
  WithPrompt,
  ItemList,
  Switch,
  TriState,
} from '@app/components/core';
import ProcEditor from '@app/content/shared/procEditor';

//page-specifc config
const procSpec = {
    type: 'P_Template',
    // project: 'id name group type tasks company',
    options: { sort: { name: 'asc' } },
    common: 2,
  },
  _new = '_new',
  name = 'proc',
  taskSpec = {
    path: 'tasks',
    type: 'T_Template',
    filter: { template: true },
    project: 'id name company',
    options: { sort: { name: 'asc' } },
    common: 2,
  },
  formEditor = 'formEditor',
  formsPage = (pathname, id = 'new_task') =>
    [
      '',
      ..._.initial(pathname.split('/').filter(Boolean)),
      formEditor,
      id,
    ].join('/');

export const config = {
    entity: [procSpec, taskSpec],
  },
  addDialog = {
    title: 'Add Process definition',
    text:
      'Select new Process name, type of Process and type of Asset',
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
          dataid: 'asset',
          loc: { row: 2, col: 1 },
          label: 'Asset type',
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
  const own = e.company;
  return (
    <>
      <Icon
        style={{ marginRight: '0.25rem' }}
        name={e.type === 'workflow' ? 'list-ol' : 'calendar'}
        styled="r"
        size="sm"
      />
      <span>{e.name}</span>
      <Info
        name={own ? 'user' : 'user-friends'}
        styled="s"
        size={own ? 'xs' : 'sm'}
        text={own ? 'Company-specific tempate' : 'Shared '}
      />
    </>
  );
};

ProcDefs.propTypes = {
  model: PropTypes.array,
  ctx: PropTypes.object,
  workflowConfig: PropTypes.object,
};
export default function ProcDefs({ model, ctx, workflowConfig }) {
  const { assetTypes, projectTypes } = workflowConfig,
    dialog = useDialog(),
    { nav, currentPage } = ctx,
    pathname = currentPage?.pathname,
    { proc, task, taskPath, editing, changed } =
      nav.get(pathname) || {},
    { loadEntity, saveEntity, clearEntity, removeEntity } = useData(),
    navigate = useNavigate();
  const [items, taskTemplates] = model || [],
    [{ selected, search, isEditing }, dispatch] = useReducer(
      _.merge,
      {
        selected: proc,
        isEditing: editing,
      }
    ),
    setEditing = (st) => {
      dispatch({ isEditing: st });
      nav.dispatch({ path: pathname, value: { editing: st } });
    },
    onSelect = async (id) => {
      if (isEditing && !taskPath) return;
      if (id !== selected?.id) {
        const data = id
          ? await loadEntity(
              {
                type: procSpec.type,
                id,
                common: 2,
              },
              name
            )
          : undefined;
        dispatch({ selected: data });
      }
    },
    onSearch = (search) => dispatch({ search }),
    onEditEnd = async (item) => {
      const res = { isEditing: false },
        adding = !selected.createdAt;

      nav.dispatch({ path: pathname, value: { editing: false } });
      //if cancel new proc, set selectio to null
      if (item) {
        if (adding) selected.id = _.generateId(name);
        const ind = items.findIndex((e) => e.id === selected.id),
          result = await saveEntity(
            {
              type: procSpec.type,
              item,
              op: adding && 'add',
            },
            name
          );
        if (!result?.error) {
          items.splice(ind, 1, result);
          res.selected = result;
          toaster.info(
            `Process template definition ${
              adding ? 'added' : 'saved'
            }`,
            true
          );
        } else
          toaster.danger(
            `Operation status: ${result.error}, code: ${result.status}`,
            true
          );
      } else {
        toaster.warning(
          'Editing cancelled, all changed discarded.',
          true
        );
        if (adding) {
          items.pop();
          res.selected = undefined;
        }
        await clearEntity(selected.id);
      }
      dispatch(res);
    },
    onDelete = async () => {
      nav.dispatch({ path: pathname, value: { editing: false } });
      const ind = items.findIndex((e) => e.id === selected.id),
        msg = { type: procSpec.type, id: selected.id },
        deps = {
          type: taskSpec.type,
          id: _.getAllTreeLeaves(selected.tasks)
            .map((e) => e.form)
            .filter(Boolean),
        };
      await removeEntity(msg, deps);
      items.splice(ind, 1);
      toaster.info('Process template definition deleted', true);
      dispatch({ isEditing: false, selected: undefined });
    },
    addProc = async () => {
      addDialog.form.items[1].options = assetTypes;
      addDialog.form.items[2].options = projectTypes;
      const { ok, data } = await dialog(addDialog);
      if (ok) {
        Object.assign(data, {
          tasks: [],
          model: [],
          id: _new,
          company: ctx.company?.id,
        });
        items.push(data);
        dispatch({
          selected: data,
          isEditing: true,
        });
      }
    },
    onFormEdit = async (task, taskPath, proc) => {
      const path = formsPage(pathname, task.form);
      nav.dispatch({
        path,
        value: {
          proc,
          task,
          taskPath,
          path: pathname,
          canEdit,
        },
      });
      navigate(path);
    },
    canAdd = ctx.user.isDev() || ctx.user.isOwner(),
    canEdit =
      selected &&
      (selected.company ? ctx.user.isDev() : ctx.user.isOwner());

  const filtered = search
    ? items.filter((e) => new RegExp(search, 'i').test(e.name))
    : items || [];
  const groups = _.groupBy(filtered, (e) => e.asset);

  useEffect(async () => {
    if (model && !_.idEqual(selected, proc)) onSelect(proc?.id);
  }, [model]);

  return (
    <div className="docs">
      <aside className={classNames(['doc-index'], { editing })}>
        <Switch
          id="hu"
          intent="danger"
          size="sm"
          // options={['In', 'Ac']}
          // style={{  ['--height']: '1rem' }}
        />
        <TriState
          id="huy"
          size="sm"
          intent="success"
          label="Hello"
          selectedColor="green"
          text="Text here..."
        />
        <div
          className="justaposed"
          style={{ marginBottom: '0.5rem' }}>
          <h5>Templates</h5>
          <AddButton
            onClick={addProc}
            className="info"
            size="sm"
            minimal
            disabled={!canAdd || isEditing}
          />
        </div>
        <SearchInput
          value={search}
          disabled={!!selected}
          placeholder="Search type"
          style={{ width: '98%' }}
          onModify={onSearch}
        />
        {assetTypes.map((g) => {
          return (
            <ItemList
              key={g.id}
              title={g.name}
              items={groups[g.id]}
              render={itemRender}
              onSelect={onSelect}
              selected={selected?.id}
            />
          );
        })}
      </aside>
      <article className="doc-content">
        <WithPrompt
          condition={selected}
          text="Select process to view details">
          <ProcEditor
            type={procSpec.type}
            def={selected}
            ctx={ctx}
            canEdit={canEdit || canAdd}
            isEditing={isEditing}
            touched={changed}
            setEdit={setEditing}
            onEditEnd={onEditEnd}
            onDelete={onDelete}
            //  onTaskInit={onTaskInit}
            onFormEdit={onFormEdit}
            activeTask={task}
            activeTaskPath={taskPath}
            taskTemplates={taskTemplates}
            workflowConfig={workflowConfig}
          />
        </WithPrompt>
      </article>
    </div>
  );
}
