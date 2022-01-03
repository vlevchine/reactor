import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { entityCache } from '@app/services/indexedCache';
import Form, { Field, TabPanel, Conditional } from '@app/formit';
import { TaskGroupEditor, TaskEditor } from './taskEditor';
import { Button, EditorButtonGroup } from '@app/components/core';
import Schedule from './schedule';

const lid = 'procEditor',
  taskListConf = {
    prop: 'tasks',
    type: 'T_Template',
    itemName: 'task',
    itemsProp: 'items',
    itemTitle: 'Task',
    groupIcon: 'folders',
    groupName: 'gr',
    icon: 'tasks',
  },
  formType = 'F_Template',
  taskFields = ['name'],
  modelFields = [
    { id: 'name', name: 'Name' },
    {
      id: 'type',
      name: 'Type',
      type: 'Select',
      width: '6rem',
      options: ['String', 'Int', 'Float', 'Boolean'],
    },
    {
      id: 'kind',
      name: 'Kind',
      type: 'Switch',
      props: { size: 'xs' },
      //options: ['Off', 'On'],
    },
  ],
  taskScope = 's:tasks',
  taskTest = (m) => (m ? (m.items ? 1 : 0) : -1);

ProcEditor.propTypes = {
  def: PropTypes.object,
  type: PropTypes.string,
  ctx: PropTypes.object,
  activeTask: PropTypes.object,
  activeTaskPath: PropTypes.string,
  onEditEnd: PropTypes.func,
  onDelete: PropTypes.func,
  onFormEdit: PropTypes.func,
  canEdit: PropTypes.bool,
  isEditing: PropTypes.bool,
  touched: PropTypes.bool,
  setEdit: PropTypes.func,
  taskTemplates: PropTypes.array,
  workflowConfig: PropTypes.object,
};
export default function ProcEditor({
  def,
  type,
  ctx,
  //path in task tree,
  activeTaskPath,
  //actual model, for groups - from task tree, for tasks - requested from server
  activeTask,
  touched,
  canEdit,
  isEditing,
  setEdit,
  onEditEnd,
  onFormEdit,
  onDelete,
  workflowConfig,
}) {
  const { projectTypes } = workflowConfig,
    [taskPath, setTaskPath] = useState(activeTaskPath),
    form = useRef(),
    selPiers = useRef([]),
    [isTouched, setTouched] = useState(touched),
    //  { removeEntity } = useData(),
    onTaskSelect = (prop, id) => {
      ctx.nav.dispatch({ path: lid, value: { [def.id]: id } });
      if (id?.length) {
        const ids = id.split('.'),
          _id = ids.slice(0, ids.lastIndexOf(taskListConf.itemsProp));
        selPiers.current = _.getIn(def[prop], _id)?.items;
      } else selPiers.current = def[prop];
      setTaskPath(id);
    },
    onStartEdit = () => {
      setEdit(true);
    },
    editEnd = (accept) => {
      onEditEnd(accept && form.current.getState());
    },
    changing = async (x, y, msg = {}, old) => {
      const { op, value, path } = msg;
      if (op === 'remove') {
        const item = _.getIn(old[path], value),
          forms = item?.form
            ? [item.form]
            : item?.items?.map((e) => e.form).filter(Boolean) || [];
        //removing task, also remove correspondent form
        //removing task group, also remove forms for all tasks in group
        //form.current.markAsRemoved(forms, formType)
        await Promise.all(
          forms.map((e) =>
            entityCache.markAsRemoved(e.form, def.id, formType)
          )
        );
      }
      setTouched(form.current?.isTouched());
    },
    gotoForm = async () => {
      const { item, path } = form.current.getSelection(
        taskListConf.prop
      );
      onFormEdit(item, path, form.current.getState());
    },
    onRemoveForm = async () => {
      const { item } =
        form.current.getSelection(taskListConf.prop) || {};
      //removing form: - remove form ref
      form.current.changed(undefined, 'form', 'edit', {
        scope: _.dotMerge(taskListConf.prop, taskPath),
      });
      //- and form entity itself
      await entityCache.markAsRemoved(item?.form, def.id, formType);
    },
    onSchedule = (path, value) => {
      const pth = _.dotMerge(taskListConf.prop, path, 'duration');
      form.current.changed(value, pth, 'edit');
      //  onEditEnd(form.current.getState());
    };

  useEffect(async () => {
    if (activeTask?.formId) {
      form.current.changed(
        { form: activeTask.formId },
        _.dotMerge(taskListConf.prop, taskPath),
        'update'
      );
      delete activeTask.formId;
    }
    const sel = ctx.nav.get(lid);
    setTaskPath(sel?.[def.id]);
  }, [def]);

  return (
    <Form
      stateRef={form}
      id="proc"
      layout={{ cols: 2, rows: 'auto 1fr' }}
      onChange={changing}
      onSelect={onTaskSelect}
      relationship={taskListConf}
      initialSelection={{
        [taskListConf.prop]: taskPath,
      }}
      type={type}
      model={def}
      readonly={!isEditing}
      ctx={ctx}
      context={(m) => ({
        projectType: m.type,
        selectedId: taskPath
          ? _.dotMerge(taskListConf.prop, taskPath)
          : undefined,
      })}
      // dependency={[[(v) => v.model?.length, 'comment']]}
    >
      <Field
        type="TextInput"
        loc={{ col: 1, row: 1 }}
        dataid="name"
        label="Process name"
        horizontal
      />
      {def?.company && (
        <Field
          id="edit"
          type="Markup"
          loc={{ col: 2, row: 1 }}
          hidden={!canEdit}>
          <EditorButtonGroup //size="sm"
            editing={isEditing}
            delText="delete process definition"
            style={{ float: 'right' }}
            saveDisabled={!(def.id === '_new' || isTouched)}
            onDelete={onDelete}
            onEdit={onStartEdit}
            onEditEnd={editEnd}
          />
        </Field>
      )}
      <TabPanel
        loc={{ col: 1, row: 2, colSpan: 2 }}
        selected={taskPath ? '1' : '0'}>
        <TabPanel.Tab
          id="0"
          title="General"
          layout={{ cols: 5, rows: 'auto 1fr' }}>
          <Field
            id="procType"
            type="Markup"
            loc={{ col: 1, row: 1, colSpan: 2 }}
            label="Process details">
            <div className="flex-row">
              <h6>Type: </h6>
              <i>{_.findById(projectTypes, def.type).name}</i>
            </div>
          </Field>
          <Field
            id="editBtn"
            type="Markup"
            loc={{ col: 1, row: 2, colSpan: 2 }}
            hidden={({ projectType }) => projectType !== 'approval'}
            label="Process details">
            <Button
              prepend="edit"
              text="Edit Form"
              onClick={gotoForm}
            />
          </Field>
          <Field
            type="List"
            dataid="model"
            loc={{ col: 1, row: 2, colSpan: 2 }}
            hidden={({ projectType }) => projectType !== 'workflow'}
            fields={modelFields}
            numbered
            label="Model"
          />
          <Field
            type="TextArea"
            loc={{ col: 4, row: 2, colSpan: 2 }}
            dataid="comment"
            expandable
            disabled={!isEditing}
            rows="4"
            label="Description"
          />
        </TabPanel.Tab>
        <TabPanel.Tab
          id="1"
          title="Tasks"
          layout={{ cols: 5 }}
          hidden={({ projectType }) => projectType !== 'workflow'}>
          <Field
            type="Tree"
            loc={{ col: 1, colSpan: 2 }}
            title="Process definition"
            dataid="tasks"
            style={{ width: '98%' }}
            readonly={!isEditing}
            selected={taskPath}
            allowDrag
            //dragCopy={!!(isEditing && selectedTask)}
            config={taskListConf}
            fields={taskFields}
            addGroups={2}
          />
          <Conditional
            loc={{ col: 3, colSpan: 3 }}
            scope={taskScope}
            condition={taskTest}
            className="shifted-y"
            placeholder="Select task of goup of tasks to view details...">
            <TaskEditor
              isEditing={isEditing}
              onForm={gotoForm}
              onRemove={onRemoveForm}
              canEdit={canEdit}
              tasks={selPiers.current}
            />
            <TaskGroupEditor
              id="group"
              canEdit={canEdit}
              tasks={selPiers.current}
            />
          </Conditional>
        </TabPanel.Tab>
        <TabPanel.Tab //
          id="2"
          title="Schedule"
          hidden={({ projectType }) => projectType !== 'workflow'}
          layout={{ cols: 1, rows: 1 }}>
          <Field
            type="RawHtml"
            dataid="tasks"
            loc={{ col: 1, row: 1 }}
            className="full-size flex-column"
            style={{ height: '44rem' }}>
            {(props) => (
              <Schedule
                {...props}
                onChange={onSchedule}
                listProp={taskListConf.itemsProp}
                startDate={new Date(2021, 9, 29)}
                //workOn={['Sat']} //"all"
              />
            )}
          </Field>
        </TabPanel.Tab>
        <TabPanel.Tab
          id="3"
          title="Reports"
          layout={{ cols: 5 }}
          hidden={({ projectType }) => projectType !== 'calendar'}>
          <Field
            type="Markup"
            loc={{ col: 1, row: 1, colSpan: 2 }}
            label="Process details">
            <div className="flex-row">
              <h6>Type: </h6>
              <i>{_.findById(projectTypes, def.type).name}</i>
            </div>
          </Field>
        </TabPanel.Tab>
        <TabPanel.Tab
          id="4"
          title="Workflow"
          layout={{ cols: 5 }}
          hidden={({ projectType }) => projectType !== 'approval'}>
          <Field
            type="Markup"
            loc={{ col: 1, row: 1, colSpan: 2 }}
            label="Process details">
            <div className="flex-row">
              <h6>Type: </h6>
              <i>{_.findById(projectTypes, def.type).name}</i>
            </div>
          </Field>
        </TabPanel.Tab>
      </TabPanel>
    </Form>
  );
}
