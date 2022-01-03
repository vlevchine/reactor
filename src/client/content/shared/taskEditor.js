import PropTypes from 'prop-types';
import {
  Button,
  ConfirmDeleteBtn,
  ButtonGroup,
} from '@app/components/core';
import { Field, Panel } from '@app/formit';
//import { useData } from '@app/services';

//import { nanoid } from 'nanoid';import { useEffect, useState } from 'react';
// const dependency = [
//   [(v) => v.approval, 'approved'],
//   [(v) => v.review, 'reviewed'],
//   [(v) => v.team?.length, 'teamLead'],
// ];
const config = {
    itemTitle: 'team member',
    selection: false,
    itemClass: 'spread',
  },
  teamFields = [
    {
      id: 'role',
      name: 'Role',
      display: 'name',
      width: '12rem',
      type: 'Select',
      placeholder: 'User role',
    },
    {
      id: 'count',
      name: '#',
      type: 'Count',
      width: '2.5rem',
      props: { max: 10, min: 1 },
    },
    {
      id: 'occupied',
      name: 'Busy(%)',
      type: 'percent',
      width: '4rem',
      placeholder: '% occupied',
    },
  ];

TaskEditor.propTypes = {
  model: PropTypes.object,
  onRemove: PropTypes.func,
  onForm: PropTypes.func,
  ctx: PropTypes.object,
  isEditing: PropTypes.bool,
  tasks: PropTypes.array,
};
export function TaskEditor({
  onForm,
  onRemove,
  isEditing,
  tasks,
  ...rest
}) {
  const { ctx, model } = rest,
    canDepend = (tasks || []).filter((e) => e.id !== model.id);
  //set rooles
  teamFields[0].options = ctx.roles;
  return (
    <Panel
      id="details"
      {...rest}
      layout={{ cols: 5, rows: 6 }}
      title={`Task: ${model.name}`}
      fixed
      readonly={!isEditing}
      toolbar={() => {
        return (
          <ButtonGroup minimal size="sm">
            {model?.form ? (
              <>
                {isEditing && (
                  <ConfirmDeleteBtn
                    text="Remove Form"
                    message="delete this"
                    onDelete={onRemove}
                  />
                )}
                <Button
                  prepend={isEditing ? 'edit' : 'search'}
                  text="Go to Form"
                  onClick={onForm}
                />
              </>
            ) : isEditing ? (
              <Button
                prepend="plus"
                text="Add Form"
                onClick={onForm}
              />
            ) : null}
          </ButtonGroup>
        );
      }}
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
        type="Select"
        dataid="dependsOn"
        loc={{ col: 1, row: 1, colSpan: 2 }}
        options={canDepend}
        display="name"
        clear
        // single pills
        label="Depends on Task"
      />
      <Field
        type="Duration"
        dataid="duration"
        loc={{ col: 1, colSpan: 3, row: 2 }}
        clear
        prepend="clock"
        label="Task duration"
      />
      <Field
        type="Duration"
        dataid="lag"
        loc={{ col: 4, row: 2, colSpan: 2 }}
        clear
        prepend="clock"
        label="Lag"
        disable="isManual"
        message="Time after previous Task finished"
      />
      <Field
        type="TextInput"
        dataid="startCondition"
        loc={{ col: 1, colSpan: 5, row: 3 }}
        clear
        prepend="question-circle"
        label="Start condition"
      />
      <Field
        type="List"
        dataid="team"
        loc={{ col: 1, row: 4, colSpan: 5 }}
        label="Team"
        // sharedOptions="role"
        numbered
        fields={teamFields}
        config={config}
      />
      <Field
        type="Select"
        dataid="teamLead"
        loc={{ col: 1, row: 5, colSpan: 2 }}
        options="teamMembers"
        display="name"
        disabled="noTeam"
        clear
        label="Team lead"
      />
      {/* <Field
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
      /> */}
    </Panel>
  );
}

TaskGroupEditor.propTypes = {
  ctx: PropTypes.object,
  model: PropTypes.object,
  tasks: PropTypes.array,
};
export function TaskGroupEditor(props) {
  const { model, ctx, tasks } = props,
    canDepend = (tasks || []).filter((e) => e.id !== model.id);
  //set rooles
  teamFields[0].options = ctx.roles;
  return (
    <Panel
      {...props}
      title={`Task group: ${model?.name}`}
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
        dataid="seq"
        loc={{ col: 1, row: 1, colSpan: 5 }}
        toggle
        intent="success"
        label="Run tasks in sequence"
        text={(v) => `${v ? 'Sequentially' : 'In parallel'}`}
      />
      <Field
        type="Select"
        dataid="dependsOn"
        loc={{ col: 1, row: 2, colSpan: 2 }}
        options={canDepend}
        display="name"
        clear
        // single pills
        label="Depends on Task"
      />
      <Field
        type="List"
        dataid="team"
        loc={{ col: 1, row: 3, colSpan: 3 }}
        label="Team"
        sharedOptions="role"
        fields={teamFields}
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
    </Panel>
  );
}
