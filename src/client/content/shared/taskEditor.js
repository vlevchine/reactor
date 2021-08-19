import PropTypes from 'prop-types';
import { Button } from '@app/components/core';
import { Field, Panel } from '@app/formit';
//import { useData } from '@app/services';

//import { nanoid } from 'nanoid';import { useEffect, useState } from 'react';
// const dependency = [
//   [(v) => v.approval, 'approved'],
//   [(v) => v.review, 'reviewed'],
//   [(v) => v.team?.length, 'teamLead'],
// ];
TaskEditor.propTypes = {
  task: PropTypes.object,
  loc: PropTypes.object,
  scope: PropTypes.string,
  onChange: PropTypes.func,
  onInit: PropTypes.func,
  onEdit: PropTypes.func,
  ctx: PropTypes.object,
  readonly: PropTypes.bool,
  isEditing: PropTypes.bool,
};
export function TaskEditor({
  ctx,
  loc,
  task,
  onEdit,
  readonly,
  isEditing,
}) {
  return (
    <Panel
      id="details"
      loc={loc}
      layout={{ cols: 5, rows: 5 }}
      title="Task details"
      fixed
      readonly={readonly}
      model={task}
      toolbar={() => {
        return (
          <span className="sm">
            <Button
              prepend="edit"
              text="Edit"
              size="sm"
              disabled={!isEditing}
              onClick={onEdit}
            />
          </span>
        );
      }}
      ctx={ctx}
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
      style={{ minHeight: '30rem' }}>
      <Field
        type="Duration"
        dataid="duration"
        loc={{ col: 1, colSpan: 3, row: 1 }}
        clear
        prepend="clock"
        label="Task duration"
      />
      <Field
        type="Duration"
        dataid="lag"
        loc={{ col: 4, row: 1, colSpan: 2 }}
        clear
        prepend="clock"
        label="Lag"
        disable="isManual"
        message="Time after previous Task finished"
      />
      <Field
        type="TextInput"
        dataid="startCondition"
        loc={{ col: 1, colSpan: 5, row: 2 }}
        clear
        prepend="question-circle"
        label="Start condition"
      />
      <Field
        type="List"
        dataid="team"
        loc={{ col: 1, row: 3, colSpan: 3 }}
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
        loc={{ col: 4, row: 3, colSpan: 2 }}
        options="teamMembers"
        display="name"
        disabled="noTeam"
        clear
        label="Team lead"
      />
      {/*   <Field
              type="Select"
              dataid="mode"
              options={modes}
              defaultValue="m"
              loc={{ col: 1, row: 4, colSpan: 2 }}
              single
              pills
              label="Task start type"
            /> 
 */}
      <Field id="formData" type="Group" hide="noForm">
        <Field
          type="Checkbox"
          dataid="approval"
          loc={{ col: 1, row: 5, colSpan: 3 }}
          toggle
          disable="noForm"
          intent="success"
          label="Approval required"
          text="Task requires approval"
        />
        <Field
          type="Checkbox"
          dataid="review"
          loc={{ col: 4, row: 5, colSpan: 2 }}
          toggle
          disable="Form"
          intent="success"
          label="Review required"
          text="Task form must be reviewed before approval"
        />
        <Field
          type="MultiSelect"
          dataid="approved"
          loc={{ col: 1, row: 6, colSpan: 3 }}
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
          loc={{ col: 4, row: 6, colSpan: 2 }}
          options={ctx.roles}
          display="name"
          disabled="noReview"
          clear
          prepend="user"
          label="Reviewed by"
        />
      </Field>
    </Panel>
  );
}

TaskGroupEditor.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  items: PropTypes.array,
  onDrag: PropTypes.func,
  onDelete: PropTypes.func,
  ctx: PropTypes.object,
  loc: PropTypes.object,
};
export function TaskGroupEditor(props) {
  const { ctx } = props;
  return (
    <Panel
      {...props}
      title="Task group details"
      fixed
      layout={{ cols: 5, rows: 3 }}
      style={{ minHeight: '20rem' }}
      context={(v, ctx) => {
        return {
          noTeam: !v.team?.length,
          teamMembers: ctx.roles.filter((r) =>
            v.team?.some((e) => e.role === r.id)
          ),
        };
      }}>
      <Field
        type="Checkbox"
        dataid="formRequired"
        loc={{ col: 1, row: 1, colSpan: 5 }}
        toggle
        intent="success"
        label="Run tasks in parallel"
        text={(v) => `${v ? 'In parallel' : 'Sequentially'}`}
      />
      <Field
        type="List"
        dataid="team"
        loc={{ col: 1, row: 2, colSpan: 3 }}
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
        loc={{ col: 4, row: 2, colSpan: 2 }}
        options="teamMembers"
        display="name"
        disabled="noTeam"
        clear
        label="Team lead"
      />
    </Panel>
  );
}
