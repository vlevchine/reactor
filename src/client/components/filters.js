import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers'; //, classNames, useMemo, useRef, useEffect
import { IconSymbol, Button, Drawer } from './core';
import Form, { Field } from './formit';
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
  schema: PropTypes.object,
  lookups: PropTypes.object,
  model: PropTypes.object,
  nav: PropTypes.object,
  onChange: PropTypes.func,
};

export default function Filters(props) {
  const { schema, lookups, nav, model, disabled, onChange } = props,
    [open, setOpen] = useState(),
    [data, setData] = useState(model || {}),
    filters = useMemo(() => toFilters(props), []),
    parsed = parse(filters, model, lookups),
    ctx = { lookups, nav },
    changed = (v) => {
      // if (op === 'remove') {
      //   const n_v = _.safeRemove(data[id], v);
      //   setData({ ...data, [id]: n_v });
      // }
      setData(v);
    },
    onClear = () => {
      setData({});
    },
    onClose = (res) => {
      if (res) {
        const applied = Object.entries(data).filter(
          ([, v]) =>
            v !== undefined &&
            (!_.isArray(v) || v.length) &&
            (!v.type || v.value)
        );
        onChange?.(Object.fromEntries(applied));
      } else setData(model);
    },
    onClearAll = () => {
      onChange?.({});
    };

  useEffect(() => {
    setData(model);
  }, [model]);

  return (
    <>
      <div className="flex-row filter-text">
        <Button
          prepend="filter"
          minimal
          iconSize="lg"
          tooltip="Set filters"
          onClick={() => setOpen(Symbol())}
          disabled={disabled}
        />
        <Button
          prepend="file-times"
          iconSize="lg"
          minimal
          disabled={_.isEmpty(data)}
          tooltip="Clear all filters"
          onClick={onClearAll}
        />
        <h6>Filters:</h6>
        {parsed.map((e) => (
          <Item key={e[0]} dt={e} />
        ))}
      </div>
      <Drawer
        cmd={open}
        ratio={30}
        title="Table filters"
        onClose={onClose}>
        {filters.length > 0 && (
          <Button onClick={onClear}>
            <IconSymbol name="times" size="md" />
            <span>Clear all filters</span>
          </Button>
        )}
        <Form
          className="filter-box"
          layout={{ cols: 1 }}
          schema={schema}
          ctx={ctx}
          onChange={changed}
          model={data}>
          {filters.map(({ id, type, label, text, options }, i) => {
            const tp = mapper(type);
            return (
              <Field
                key={id}
                type={tp}
                dataid={id}
                loc={{ row: i + 1 }}
                throttle={700}
                display="name"
                clear
                label={label}
                labelLeft
                size="lg"
                text={text}
                options={options}
              />
            );
          })}
        </Form>
      </Drawer>
    </>
  );
}
