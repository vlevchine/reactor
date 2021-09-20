import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
//import { process } from '@app/utils/immutable';
// import {   AddButton,  SearchInput, } from '@app/components/core';
import { BasicTable } from '@app/components';

const kinds = [
    'currency',
    'percent',
    'height',
    'length',
    'weight',
    'distance',
  ],
  columns = [
    {
      title: 'Name',
      id: 'name',
      required: true,
    },
    {
      title: 'Type',
      id: 'type',
      use: 'Select',
    },
    {
      title: '!',
      id: 'required',
      use: 'Checkbox',
    },
    {
      title: '[]',
      id: 'multi',
      use: 'Checkbox',
    },
    { title: 'Shape', id: 'shape' },
    {
      title: 'Unit type',
      id: 'kind',
      use: 'Select',
      options: kinds,
    },
    { title: 'Lookup', id: 'lookups', use: 'Select' },
    { title: 'Ref', id: 'ref', use: 'Select' },
  ],
  idField = 'name';

SchemaEditor.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.object,
  title: PropTypes.string,
  editable: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  types: PropTypes.array,
  lookups: PropTypes.array,
  skip: PropTypes.array,
};

export default function SchemaEditor({
  dataid,
  value,
  title,
  disabled,
  onChange,
  types,
  lookups,
  skip,
}) {
  const vals = Object.entries(value || {}).map(([name, v]) => ({
      ...v,
      name,
      id: name,
    })),
    cols = skip
      ? columns.filter((c) => !skip.includes(c.id))
      : columns,
    onEdit = (v) => {
      if (_.isObject(v)) {
        const val = { [v[idField]]: v };
        delete v[idField];
        delete v.id;
        onChange(val, dataid, 'update');
      } else if (_.isString(v))
        onChange(undefined, _.dotMerge(dataid, v), 'rename');
    };

  useEffect(async () => {
    if (cols.includes(columns[1])) columns[1].options = types || [];
    if (cols.includes(columns[6])) columns[6].options = lookups || [];
    if (cols.includes(columns[7]))
      columns[7].options = types?.filter((e) => !e.primitive) || [];
  }, [types, lookups]);

  return (
    <>
      <h6>{title}</h6>
      <BasicTable
        value={vals}
        dataid={dataid}
        //idProp={idField}
        editable
        noToasts
        disabled={disabled}
        onChange={onEdit}
        columns={cols}
      />
    </>
  );
}
