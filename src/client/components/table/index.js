import { useState, useEffect } from 'react'; // useCallback,
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom'; //
import { _ } from '@app/helpers'; //, classNames, useMemo, useRef, useEffect
// import { useToaster, useDialog } from '@app/services';
import { IconSymbol, Button, ButtonGroup } from '../core';
import { mergeIds } from '../core/helpers';
import BasicTable from './basicTable';
import Filters from '../filters';
import Pager from '../pager';
import './styles.css';

const newId = '_new',
  fromValue = (value, colKey) => {
    return colKey ? value[colKey] : value;
  };

Table.propTypes = {
  dataid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  columns: PropTypes.array,
  filters: PropTypes.array,
  title: PropTypes.string,
  pageSize: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  height: PropTypes.string,
  intent: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.object,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  meta: PropTypes.object,
  locale: PropTypes.string,
  uom: PropTypes.string,
  lookups: PropTypes.object,
  params: PropTypes.object,
  dynamicColumns: PropTypes.bool,
  editable: PropTypes.bool,
};
export default function Table(props) {
  const {
    value,
    dataid,
    columns,
    filters,
    title,
    pageSize,
    onChange,
    params,
    editable,
    style,
    meta,
    locale,
    uom,
    lookups,
    dynamicColumns,
  } = props;
  const colKey =
      _.isObject(value) &&
      Object.keys(value).find((k) => _.isArray(value[k])),
    [vals, setVals] = useState(() => fromValue(value, colKey)),
    navigate = useNavigate(),
    [appliedParams, setParams] = useState(() => ({
      filter: params?.filter || {},
      sort: params?.sort || {},
      options: params?.options || { page: 1, size: pageSize },
    })),
    onAdd = () => {
      if (editable) {
        vals.unshift({ id: newId });
        // dispatch({ select: newId, edit: true });
      } else navigate(`${editable}/${newId}`);
    },
    changing = (value, path, op) => {
      onChange(value, mergeIds(dataid, colKey, path), op);
    },
    onParamsChange = (prm) => {
      if (!prm.options)
        prm.options = { page: 1, size: appliedParams.options.size };
      const n_params = { ...appliedParams, ...prm };
      onChange(n_params, dataid, 'options');
      setParams(n_params);
    },
    onSort = (sort) => {
      onParamsChange({ sort });
    },
    onPager = (options) => {
      onParamsChange({ options });
    },
    onFilters = (filter) => {
      onParamsChange({ filter });
    };

  useEffect(() => {
    setVals(fromValue(value, colKey));
  }, [value]);

  return (
    <div className="table">
      <div className="t_title">
        <span>
          <h6>{title}</h6>&nbsp;&nbsp;
        </span>
        {value && (
          <Pager
            {...appliedParams.options}
            max={value.length || value.count}
            onChange={onPager}
          />
        )}
        <ButtonGroup minimal>
          <Button disabled={true} onClick={onAdd}>
            <IconSymbol name="plus" />
            <span>Add</span>
          </Button>
        </ButtonGroup>
      </div>
      {meta && lookups && filters && (
        <Filters
          items={filters}
          columns={columns}
          schema={meta}
          model={appliedParams.filter}
          lookups={lookups}
          nav={{ uom, locale }}
          onChange={onFilters}
        />
      )}
      <BasicTable
        //Table wrapper handles dataid, so it's not passed to SimpleTable
        value={vals}
        columns={columns}
        //visibleColumns - cached visible column ids
        onChange={changing}
        onSort={onSort}
        sorted={appliedParams.sort}
        meta={meta}
        lookups={lookups}
        locale={locale}
        uom={uom}
        editable={editable}
        style={style}
        dynamicColumns={dynamicColumns}
        canAdd
      />
    </div>
  );
}
