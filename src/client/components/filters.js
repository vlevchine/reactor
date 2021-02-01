import { useState } from 'react';
import PropTypes from 'prop-types';
//import { _ } from '@app/helpers'; //, classNames, useMemo, useRef, useEffect
import { Button, Drawer } from './core';
import { Section, Component } from './formit'; //, { Component }
import './styles.css';

const mapper = ({ type, multi }) => {
  let typ = type === 'ID' ? 'Select' : 'Input';
  if (multi) typ = 'MultiSelect';
  return typ;
};
Filters.propTypes = {
  disabled: PropTypes.bool,
  items: PropTypes.array,
  columns: PropTypes.array,
  def: PropTypes.object,
  lookups: PropTypes.object,
  model: PropTypes.object,
  nav: PropTypes.object,
};
//
export default function Filters({
  items,
  def,
  columns,
  lookups,
  nav,
  model = {},
  disabled,
}) {
  const [open, setOpen] = useState(),
    [data, setData] = useState(model),
    filters = items.map(({ id, multi }) => {
      return {
        id,
        type: def[id]?.type,
        options: lookups[def[id].ref]?.value,
        label: columns.find((c) => c.id === id)?.title,
        multi: multi,
      };
    }),
    ctx = { lookups, nav },
    onChange = (v, id) => {
      setData({ ...data, [id]: v });
    },
    onClose = (res) => {
      console.log(res);
      //setOpen(true);
    };

  return (
    <>
      <Button
        text="Filter"
        icon="filter"
        iconStyle="r"
        minimal
        style={{ color: 'var(--g-3)' }}
        onClick={() => setOpen(Symbol())}
        disabled={disabled}
      />
      <Drawer
        cmd={open}
        ratio={30}
        title="Filter table"
        onClose={onClose}>
        <Section
          className="filter-box"
          layout={{ cols: 1, rows: 4 }}
          schema={def}
          ctx={ctx}
          onChange={onChange}
          model={data}>
          {filters.map((f, i) => (
            <Component
              key={f.id}
              component={mapper(f)}
              dataid={f.id}
              loc={{ row: i + 1 }}
              throttle={700}
              display="name"
              //type={f.type}
              clear
              label={f.label}
            />
          ))}
        </Section>
      </Drawer>
    </>
  );
}
