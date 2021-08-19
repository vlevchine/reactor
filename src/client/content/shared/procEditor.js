import { useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { useData } from '@app/services'; //useToaster classNames
import '@app/content/styles.css';
import Form, {
  Field,
  TabPanel,
  Conditional,
  Panel,
} from '@app/formit';
import { TaskGroupEditor, TaskEditor } from './taskEditor';
import { EditorButtonGroup } from '@app/components/core';

const taskListConf = {
    prop: 'tasks',
    itemsProp: 'items',
    itemTitle: 'Task',
    groupIcon: 'folders',
    icon: 'tasks',
  },
  taskFields = ['name'],
  modelFields = [
    'name',
    {
      name: 'type',
      options: ['String', 'Int', 'Float', 'Boolean'],
    },
  ],
  taskScope = 's:tasks',
  taskTest = (m) => (m ? (m.items ? 2 : m.ref ? 1 : 0) : -1);

ProcEditor.propTypes = {
  def: PropTypes.object,
  type: PropTypes.string,
  ctx: PropTypes.object,
  activeTask: PropTypes.object,
  onEditStatus: PropTypes.func,
  onTaskInit: PropTypes.func,
  onTaskEdit: PropTypes.func,
  canEdit: PropTypes.bool,
  taskTemplates: PropTypes.array,
  workflowConfig: PropTypes.object,
};
export default function ProcEditor({
  def,
  type,
  ctx,
  activeTask,
  canEdit,
  onEditStatus,
  onTaskInit,
  onTaskEdit,
  workflowConfig,
  taskTemplates,
}) {
  const { projectGroups, projectTypes } = workflowConfig,
    [
      { template, selectedTask, isEditing, isTouched },
      dispatch,
    ] = useReducer(_.merge, { selectedTask: activeTask }),
    item = useRef(),
    { loadData } = useData(),
    taskName = useRef(),
    selectTemplate = (template) => {
      dispatch({ template });
    },
    onStartEdit = () => {
      dispatch({ isEditing: true });
      onEditStatus(true);
    },
    onEditEnd = (accept) => {
      dispatch({ isEditing: false });
      if (accept) {
        const payload = item.current.getChanges();
        onEditStatus(false, payload);
      } else {
        onEditStatus(false);
      }
    },
    onDelete = async () => {
      onEditStatus(false, { id: def.id });
    },
    changing = () => {
      dispatch({ isTouched: item.current.isTouched() });
    },
    onSelect = async (sel) => {
      const _sel = _.insertBetween(sel, taskListConf.itemsProp),
        task = _.getIn(def[taskListConf.prop], _sel); //, true
      taskName.current = task?.name;
      if (task?.ref) {
        const [data] = await loadData([
          {
            type: 'T_Template',
            id: task.ref,
          },
        ]);
        dispatch({ selectedTask: data });
      } else dispatch({ selectedTask: task });
    },
    taskInit = () => {
      item.current.changed(
        selectedTask.id,
        _.dotMerge(
          taskListConf.prop,
          _.insertBetween(selectedTask.id, taskListConf.itemsProp),
          'ref'
        )
      );
      onTaskInit(selectedTask.id, template);
    },
    onEditTask = () => {
      onTaskEdit(selectedTask, taskName.current);
    },
    selId = selectedTask && [
      taskListConf.prop,
      ..._.insertBetween(selectedTask.id, taskListConf.itemsProp, {
        asArray: true,
      }),
    ];

  useEffect(() => {
    if (!def.id) dispatch({ isEditing: true });
  }, [def]);

  return (
    <Form
      stateRef={item}
      id="proc"
      layout={{ cols: 2, rows: 2 }}
      onChange={changing}
      onSelect={onSelect}
      initialSelection={{
        [taskListConf.prop]: {
          id: selectedTask?.id,
          path: selectedTask?.id,
        },
      }}
      type={type}
      model={def}
      readonly={!isEditing}
      ctx={ctx}
      context={() => ({
        selectedId: selId,
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
        <EditorButtonGroup
          editing={isEditing}
          delText="Process definition"
          //size="sm"
          style={{ float: 'right' }}
          saveDisabled={def.id && !isTouched}
          onDelete={onDelete}
          onEdit={onStartEdit}
          onEditEnd={onEditEnd}
        />
      </Field>
      <TabPanel
        loc={{ col: 1, row: 2, colSpan: 2 }}
        selected={selectedTask ? '1' : '0'}>
        <TabPanel.Tab
          id="0"
          title="General"
          layout={{ cols: 2, rows: 2 }}>
          <Field
            type="Markup"
            loc={{ col: 1, row: 1 }}
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
            loc={{ col: 1, row: 2 }}
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
            loc={{ col: 2, row: 2 }}
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
            selected={selectedTask?.id}
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
            <Panel
              title="Uninitialized Task"
              fixed
              layout={{ cols: 2, rows: 2 }}
              style={{ minHeight: '20rem' }}>
              <Field
                id="prompt"
                type="Markup"
                loc={{ col: 1, colSpan: 2, row: 1 }}>
                <h6>
                  Task content is not yet defined. You can initialize
                  task from a template or define it from scratch.
                </h6>
              </Field>
              <Field
                dataid="template"
                type="Select"
                options={taskTemplates}
                value={template}
                onChange={selectTemplate}
                display="name"
                label="Use template"
                loc={{ col: 1, row: 2 }}></Field>
              <Field
                type="Button"
                text="Initialize Task"
                onClick={taskInit}
                loc={{ col: 2, row: 2 }}
              />
            </Panel>
            <TaskEditor
              id="task"
              readonly
              isEditing={isEditing}
              onEdit={onEditTask}
              task={selectedTask}
              parentPath="tasks"
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
