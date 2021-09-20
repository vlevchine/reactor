import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
//import { useData } from '@app/services'; //useToaster
import '@app/content/styles.css';
import { entityCache } from '@app/services/indexedCache';
import Form, { Field, TabPanel, Conditional } from '@app/formit';
import { TaskGroupEditor, TaskEditor } from './taskEditor';
import { EditorButtonGroup } from '@app/components/core';

const taskListConf = {
    prop: 'tasks',
    type: 'T_Template',
    itemsProp: 'items',
    itemTitle: 'Task',
    groupIcon: 'folders',
    icon: 'tasks',
  },
  formType = 'F_Template',
  taskFields = ['name'],
  modelFields = [
    'name',
    {
      name: 'type',
      options: ['String', 'Int', 'Float', 'Boolean'],
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
  canEdit,
  isEditing,
  touched,
  setEdit,
  onEditEnd,
  onFormEdit,
  onDelete,
  workflowConfig,
}) {
  const { projectGroups, projectTypes } = workflowConfig,
    [isTouched, setTouched] = useState(touched),
    [taskPath, setTaskPath] = useState(activeTaskPath),
    form = useRef(),
    //  { removeEntity } = useData(),
    onTaskSelect = (prop, id) => {
      setTaskPath(id);
    },
    onStartEdit = () => {
      setEdit(true);
    },
    editEnd = (accept) => {
      onEditEnd(accept && form.current.getState());
    },
    changing = async (x, y, msg = {}) => {
      const { op, value, path } = msg,
        item = op === 'remove' && _.getIn(def[path], value),
        forms = item.form
          ? [item.form]
          : item.items?.map((e) => e.form).filter(Boolean) || [];
      //removing task, also remove correspondent form
      //removing task group, also remove forms for all tasks in group
      //form.current.markAsRemoved(forms, formType)
      await Promise.all(
        forms.map((e) =>
          entityCache.markAsRemoved(e.form, def.id, formType)
        )
      );
      setTouched(form.current.isTouched());
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
  }, [def]);

  return (
    <Form
      stateRef={form}
      id="proc"
      layout={{ cols: 2, rows: 2 }}
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
      context={() => ({
        selectedId: _.dotMerge(taskListConf.prop, taskPath),
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
      <Field
        id="edit"
        type="Markup"
        loc={{ col: 2, row: 1 }}
        hidden={!canEdit}>
        <EditorButtonGroup //size="sm"
          editing={isEditing}
          delText="delete process definition"
          style={{ float: 'right' }}
          saveDisabled={def.id && !isTouched}
          onDelete={onDelete}
          onEdit={onStartEdit}
          onEditEnd={editEnd}
        />
      </Field>
      <TabPanel
        loc={{ col: 1, row: 2, colSpan: 2 }}
        selected={taskPath ? '1' : '0'}>
        <TabPanel.Tab
          id="0"
          title="General"
          layout={{ cols: 5, rows: 2 }}>
          <Field
            type="Markup"
            loc={{ col: 1, row: 1, colSpan: 2 }}
            label="Process details">
            <div className="flex-row">
              <h6>Group:</h6>
              <i>{_.findById(projectGroups, def.group).name}</i>
            </div>
            <div className="flex-row">
              <h6>Type: </h6>
              <i>{_.findById(projectTypes, def.type).name}</i>
            </div>
          </Field>
          <Field
            type="List"
            dataid="model"
            loc={{ col: 1, row: 2, colSpan: 2 }}
            fields={modelFields}
            numbered
            config={{
              itemProp: 'name',
              itemClass: 'spread',
              selection: false,
            }}
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
        <TabPanel.Tab id="1" title="Tasks" layout={{ cols: 5 }}>
          <Field
            type="List"
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
            addGroups={1}
          />
          <Conditional
            loc={{ col: 3, colSpan: 3 }}
            scope={taskScope}
            condition={taskTest}
            placeholder="Select task of goup of tasks to view details...">
            <TaskEditor
              isEditing={isEditing}
              onForm={gotoForm}
              onRemove={onRemoveForm}
              canEdit={canEdit}
            />
            <TaskGroupEditor id="group" />
          </Conditional>
        </TabPanel.Tab>
        <TabPanel.Tab
          id="2"
          title="Schedule"
          layout={{ cols: 2, rows: 2 }}>
          <Field
            type="RawHtml"
            loc={{ col: 1, row: 1 }}
            label="Process details">
            <div className="flex-row">
              <h6>Group:</h6>
            </div>
          </Field>
        </TabPanel.Tab>
      </TabPanel>
    </Form>
  );
}
