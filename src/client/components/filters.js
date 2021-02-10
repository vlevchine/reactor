import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers'; //, classNames, useMemo, useRef, useEffect
import { IconSymbol, Button, Drawer } from './core';
import Form, { Component } from './formit'; //, { Component }
import './styles.css';
import { mapper, parse, toFilters } from './filters_helpers';

const Item = ({ dt }) => (
  <>
    <b>{dt[0]}</b>
    {dt[1] && <i>{dt[1]}</i>}
    <span className="text-dots">{dt[2]}</span>
  </>
);
Item.propTypes = {
  dt: PropTypes.array,
};

Filters.propTypes = {
  disabled: PropTypes.bool,
  items: PropTypes.array,
  columns: PropTypes.array,
  def: PropTypes.object,
  lookups: PropTypes.object,
  model: PropTypes.object,
  nav: PropTypes.object,
  onChange: PropTypes.func,
};

export default function Filters({
  items,
  def,
  columns,
  lookups,
  nav,
  model,
  disabled,
  onChange,
}) {
  const [open, setOpen] = useState(),
    [data, setData] = useState(model ? { ...model } : {}),
    filters = useMemo(
      () => toFilters(items, columns, def, lookups),
      []
    ),
    parsed = parse(filters, model, lookups),
    ctx = { lookups, nav },
    changed = (v, id, op) => {
      if (op === 'remove') {
        const n_v = _.safeRemove(data[id], v);
        setData({ ...data, [id]: n_v });
      } else setData({ ...data, [id]: v });
    },
    onClear = () => {
      setData({});
    },
    onClose = (res) => {
      if (res) {
        onChange?.(
          Object.fromEntries(
            Object.entries(data).filter(
              ([, v]) =>
                v !== undefined &&
                (!_.isArray(v) || v.length) &&
                (!v.type || v.value)
            )
          )
        );
      } else setData({ ...model });
    },
    onClearAll = () => {
      onChange?.();
    };

  useEffect(() => {
    setData({ ...model });
  }, [model]);

  return (
    <>
      <div className="flex-row filter-text">
        <Button
          icon="filter"
          iconStyle="r"
          minimal
          onClick={() => setOpen(Symbol())}
          disabled={disabled}
        />
        <Button
          icon="file-times"
          iconStyle="r"
          minimal
          onClick={onClearAll}
        />
        <h5>Filters:</h5>
        {parsed.map((e) => (
          <Item key={e[0]} dt={e} />
        ))}
      </div>
      <Drawer
        cmd={open}
        ratio={30}
        title="Table filters"
        onClose={onClose}>
        <Button onClick={onClear}>
          <IconSymbol name="times" size="xl" />
          <h5>Clear all filters</h5>
        </Button>
        <Form
          className="filter-box"
          layout={{ cols: 1 }}
          schema={def}
          ctx={ctx}
          onChange={changed}
          model={data}>
          {filters.map(({ id, type, label, text, options }, i) => (
            <Component
              key={id}
              component={mapper(type)}
              dataid={id}
              loc={{ row: i + 1 }}
              throttle={700}
              display="name"
              clear
              label={label}
              text={text}
              options={options}
            />
          ))}
        </Form>
      </Drawer>
    </>
  );
}
