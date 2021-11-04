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
      name: 'role',
      display: 'name',
      // options: ctx.roles,
      placeholder: 'Add user role to team...',
    },
    {
      name: 'count',
      type: 'int',
      max: 10,
      min: 1,
    },
    {
      name: 'occupied',
      type: 'float',
      max: '1.0',
      placeholder: '% occupied',
    },
  ];

TaskEditor.propTypes = {
  model: PropTypes.object,
  loc: PropTypes.object,
  scope: PropTypes.string,
  onRemove: PropTypes.func,
  onForm: PropTypes.func,
  ctx: PropTypes.object,
  isEditing: PropTypes.bool,
  canEdit: PropTypes.bool,
  tasks: PropTypes.array,
};
export function TaskEditor({
  onForm,
  onRemove,
  isEditing,
  canEdit,
  tasks,
  ...rest
}) {
  const { ctx, model } = rest,
    canDepend = (tasks || []).filter((e) => e.id !== model.id);
  (teamFields[0].options = ctx.roles), console.log(canDepend);
  return (
    <Panel
      id="details"
      {...rest}
      layout={{ cols: 5, rows: 6 }}
      title={`Task: ${model.name}`}
      fixed
      readonly={!isEditing}
      toolbar={() => {
        return canEdit ? (
          <span className="sm">
            {!model?.form && (
              <Button
                prepend="edit"
                text="Add Form"
                size="sm"
                minimal
                disabled={!isEditing}
                onClick={onForm}
              />
            )}
            {model?.form && (
              <ButtonGroup minimal size="sm" disabled={!isEditing}>
                <Button
                  prepend="edit"
                  text="Edit Form"
                  onClick={onForm}
                />
                <ConfirmDeleteBtn
                  text="Remove Form"
                  message="delete this"
                  onDelete={onRemove}
                />
              </ButtonGroup>
            )}
          </span>
        ) : (
          <Button
            prepend="search"
            minimal
            text="View Form"
            onClick={onForm}
          />
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
        loc={{ col: 1, row: 4, colSpan: 3 }}
        label="Team"
        // sharedOptions="role"
        fields={teamFields}
        config={config}
      />
      <Field
        type="Select"
        dataid="teamLead"
        loc={{ col: 4, row: 4, colSpan: 2 }}
        options="teamMembers"
        display="name"
        disabled="noTeam"
        clear
        label="Team lead"
      />
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
        fields={[
          {
            name: 'role',
            display: 'name',
            options: ctx?.roles,
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
    </Panel>
  );
}
