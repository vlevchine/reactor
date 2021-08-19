import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Tabs, CancelButton, SaveButton } from '@app/components/core';
import Form, { Field } from '@app/formit';
import { useData } from '@app/services'; // useDialog, useToaster

//page-specifc config useNavigate,
export const config = {};
const dependency = [
  [(v) => v.approval, 'approved'],
  [(v) => v.review, 'reviewed'],
  [(v) => v.team?.length, 'teamLead'],
];

TaskDefs.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  ctx: PropTypes.object,
  className: PropTypes.string,
  pageParams: PropTypes.object,
  pageInfo: PropTypes.object,
};
export default function TaskDefs({
  //def,
  ctx,
  pageParams,
  pageInfo,
  ...rest
}) {
  const {
      state: { task, parentPath, taskName, procName, back },
    } = pageInfo,
    { id } = pageParams,
    [item, setItem] = useState(),
    { loadData } = useData(),
    navigate = useNavigate(),
    form = useRef(),
    onClick = (ev, id) => {
      const { pathname, snapshot } = back;
      if (id === 'cancel') {
        form.current.resetHistory();
      }
      navigate(pathname, {
        state: { ...snapshot, task: form.current.getState() },
      });
    },
    // onForm = (a, b) => {
    //   console.log(a, b);
    // },
    onChange = () => {};

  useEffect(async () => {
    if (!task) {
      const [data] = await loadData([
        {
          type: 'T_Template',
          id,
          common: 2,
        },
      ]);
      setItem(data);
    } else setItem(task);
  }, [id]);

  return item ? (
    <>
      <div className="justaposed">
        <h6>{`Editing task: "${taskName}" for process: "${procName}"`}</h6>
        <div>
          <CancelButton
            id="cancel"
            text="Cancel Task changes"
            onClick={onClick}
            style={{ marginRight: '0.5rem' }}
          />
          <SaveButton
            id="save"
            text="Accept Task changes"
            onClick={onClick}
          />
        </div>
      </div>
      <Tabs>
        <Tabs.Tab id="general" name="General">
          <Form
            stateRef={form}
            layout={{ cols: 4, rows: 5 }}
            {...rest}
            scope="" //with scope reset it behaves like independent form
            model={item}
            ctx={ctx}
            onChange={onChange}
            toolbar={undefined}
            parentPath={parentPath}
            context={(v, ctx) => {
              return {
                noForm: !v.form,
                noTeam: !v.team?.length,
                isManual: v.mode === 'm',
                noApproval: !v.approval,
                noReview: !v.review,
                teamMembers: ctx.roles.filter((r) =>
                  v.team?.some((e) => e.role === r.id)
                ),
              };
            }}
            dependency={dependency}>
            <Field
              type="Duration"
              dataid="duration"
              loc={{ col: 1, row: 1 }}
              clear
              prepend="clock"
              label="Task duration"
            />
            <Field
              type="Duration"
              dataid="lag"
              loc={{ col: 2, row: 1 }}
              clear
              prepend="clock"
              label="Trailing lag"
              disable="isManual"
              message="Time after Task finished and next one starts"
            />
            <Field
              type="TextInput"
              dataid="startCondition"
              loc={{ col: 1, colSpan: 2, row: 2 }}
              clear
              prepend="question-circle"
              label="Start condition"
            />
            <Field
              type="TextArea"
              dataid="comment"
              loc={{ col: 3, colSpan: 2, row: 1, rowSpan: 2 }}
              clear
              className="full-height"
              label="Description"
            />
            <Field
              type="List"
              dataid="team"
              loc={{ col: 1, row: 3, colSpan: 1 }}
              label="Team"
              sharedOptions="role"
              fields={[
                {
                  name: 'role',
                  display: 'name',
                  options: ctx.roles,
                  placeholder: 'Add user role to team...',
                },
                {
                  name: 'count',
                  max: 10,
                  min: 1,
                },
              ]}
              config={{
                itemTitle: 'team member',
                selection: false,
                itemClass: 'spread',
              }}
            />
            <Field
              type="Select"
              dataid="teamLead"
              loc={{ col: 2, row: 3 }}
              options="teamMembers"
              display="name"
              disabled="noTeam"
              clear
              label="Team lead"
            />
            {/* <Field
              type="Select"
              dataid="mode"
              options={modes}
              defaultValue="m"
              loc={{ col: 1, row: 4, colSpan: 2 }}
              single
              pills
              label="Task start type"
          /> 
          <Field
            type="Button"
            id="addForm"
            hidden="!noForm"
            loc={{ col: 1, row: 4, colSpan: 2 }}
            prepend="plus"
            className="invert info"
            text="Add Form"
            onClick={onForm}
          />*/}

            <Field id="formData" type="Group" hide="!noForm">
              <Field
                type="Checkbox"
                dataid="approval"
                loc={{ col: 1, row: 4, colSpan: 2 }}
                toggle
                disable="noForm"
                intent="success"
                label="Approval required"
                text="Task requires approval"
              />
              <Field
                type="Checkbox"
                dataid="review"
                loc={{ col: 3, row: 4, colSpan: 2 }}
                toggle
                disable="Form"
                intent="success"
                label="Review required"
                text="Task form must be reviewed before approval"
              />
              <Field
                type="MultiSelect"
                dataid="approved"
                loc={{ col: 1, row: 5, colSpan: 2 }}
                options={ctx.roles}
                display="name"
                disabled="noApproval"
                clear
                prepend="user"
                label="Approved by"
              />
              <Field
                type="Select"
                dataid="reviewed"
                loc={{ col: 3, row: 5, colSpan: 2 }}
                options={ctx.roles}
                display="name"
                disabled="noReview"
                clear
                prepend="user"
                label="Reviewed by"
              />
            </Field>
          </Form>
        </Tabs.Tab>
        <Tabs.Tab id="form" name="Form"></Tabs.Tab>
      </Tabs>
    </>
  ) : (
    <h6>Task definition not found...</h6>
  );
}
