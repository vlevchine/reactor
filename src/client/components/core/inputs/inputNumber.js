import {
  useEffect,
  useState,
  useRef,
  useMemo,
  Fragment,
} from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { createTypedValue } from '@app/utils/numberUnits';
//import { numberFormatter } from '@app/utils/number';
import { Decorate, Decorator, ClearButton, Readonly } from '..';
import InputGeneric from './input_generic';
import './styles.css';

InputNumber0.propTypes = {
  dataid: PropTypes.string,
  name: PropTypes.string,
  append: PropTypes.string,
  prepend: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  onChange: PropTypes.func,
  invalidate: PropTypes.func,
  fill: PropTypes.bool,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.bool,
  clear: PropTypes.bool,
  locale: PropTypes.string,
  uom: PropTypes.string,
  meta: PropTypes.object,
  tabIndex: PropTypes.number,
  intent: PropTypes.string,
  blend: PropTypes.bool,
  readonly: PropTypes.bool,
  minimal: PropTypes.bool,
  underlined: PropTypes.bool,
};

export function InputNumber0(props) {
  const {
      dataid,
      value,
      onChange,
      prepend,
      append,
      clear,
      disabled,
      className,
      style,
      // locale = 'en-CA',
      invalidate,
      uom,
      meta,
      blend,
      intent,
      readonly,
      minimal,
      underlined,
    } = props,
    { type } = meta?.unit || {},
    unitVal = useRef(createTypedValue(type, value)),
    [val, setVal] = useState(() => unitVal.current.toUnitSystem(uom)),
    shape = meta?.shape,
    onBlur = (v) => {
      const _v = Number(v),
        n_v = Number.isNaN(_v)
          ? undefined
          : type
          ? unitVal.current.fromUnitSystem(_v, uom).valueOf()
          : _v;
      shape && invalidate?.(!unitVal.current.validate(n_v, shape));
      n_v !== value && onChange?.(n_v, dataid);
    },
    text = unitVal.current.getLabel(uom),
    hasValue = !_.isNil(value);

  useEffect(() => {
    if (shape) {
      const invalid = !unitVal.current.validate(value, shape);
      invalid && invalidate?.(invalid);
    }
  }, []);
  useEffect(() => {
    setVal(unitVal.current.toUnitSystem(uom));
  }, [uom]);
  useEffect(() => {
    if (unitVal.current.value !== value) {
      unitVal.current.set(value);
      setVal(unitVal.current.toUnitSystem(uom));
      if (shape) {
        const invalid = !unitVal.current.validate(value, shape);
        invalid && invalidate?.(invalid);
      }
    }
  }, [value]);

  return readonly ? (
    <Readonly txt={val || undefined} />
  ) : (
    <Decorator
      prepend={prepend}
      append={append || text}
      appendType={text ? 'text' : 'icon'}
      blend={blend}
      onChange={onBlur}
      className={className}
      hasValue={hasValue}
      disabled={disabled}
      minimal={minimal}
      underlined={underlined}
      intent={intent}
      style={style}>
      <InputGeneric
        kind="input"
        type="number"
        value={val}
        dataid={dataid}
        onChange={onBlur}
        // placeholder={toString(val, formatter.format)        }
      />
      <ClearButton
        clear={clear}
        id={dataid}
        disabled={!hasValue}
        onChange={onChange}
      />
    </Decorator>
  );
}

InputNumber.propTypes = {
  id: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  clear: PropTypes.bool,
  append: PropTypes.string,
  onChange: PropTypes.func,
  invalidate: PropTypes.func,
  uncontrolled: PropTypes.bool,
  locale: PropTypes.string,
  uom: PropTypes.string,
  shape: PropTypes.object,
  unit: PropTypes.object,
};
function asState(v, uom) {
  return v.toUnitSystem(uom);
}
export default function InputNumber(props) {
  const {
      id,
      value,
      shape,
      unit,
      uom,
      clear,
      uncontrolled,
      onChange,
      append,
      invalidate,
    } = props,
    type = unit?.type,
    unitVal = useMemo(() => createTypedValue(type, value), []),
    [_value, setValue] = useState(() => asState(unitVal, uom)),
    reportValidity = shape
      ? (v) => {
          const invalid = !unitVal.validate(v, shape);
          invalid && invalidate?.(invalid);
        }
      : _.noop,
    onKey = (ev) => {
      if (ev.code === 'Enter') report(_value);
    },
    transform = (v) => {
      const _v = Number(v);
      return Number.isNaN(_v)
        ? undefined
        : type
        ? unitVal.fromUnitSystem(_v, uom).valueOf()
        : _v;
    },
    report = (v) => {
      const n_v = transform(v);
      if (n_v !== value) {
        if (uncontrolled) setValue(v || '');
        reportValidity(n_v);
        onChange?.(n_v, id);
      }
    },
    blur = () => report(_value),
    changed = (ev) => {
      const v = ev.target.value;
      if (!Number.isNaN(Number(v))) setValue(v);
    };

  useEffect(() => {
    setValue(unitVal.toUnitSystem(uom));
  }, [uom]);

  useEffect(() => {
    unitVal.set(value);
    setValue(unitVal.toUnitSystem(uom));
    reportValidity(value);
  }, [value]);

  return (
    <Decorate
      {...props}
      clear={clear && !_.isNil(_value) ? report : undefined}
      append={append || unitVal.getLabel(uom)}>
      <input
        type="text"
        value={_value}
        onChange={changed}
        onKeyPress={onKey}
        onBlur={blur}
      />
    </Decorate>
  );
}

InputPercent.propTypes = {
  value: PropTypes.number,
  style: PropTypes.object,
  onChange: PropTypes.func,
};
export function InputPercent({ value, style, onChange, ...props }) {
  const _style = _.assign(style, { width: '3rem' }),
    changing = (v, id) => {
      onChange?.(v ? v / 100 : v, id);
    };
  return (
    <InputNumber
      {...props}
      value={value ? value * 100 : value}
      style={_style}
      onChanghe={changing}
      append="%"
    />
  );
}

InputMulti.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.array,
  spec: PropTypes.array,
  style: PropTypes.object,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  uncontrolled: PropTypes.bool,
};
function transformToState(value, spec) {
  return value
    ? spec.map((e, i) => {
        const pos = Math.abs(value[i]),
          sign = pos / value[i],
          ind = e.scale.indexOf(sign);
        return [pos, ind];
      })
    : [];
}
function transformToValue(state, spec) {
  return state.length
    ? state.map((e, i) => {
        const [v, f] = e,
          scale = spec[i].scale[f];
        return v * scale;
      })
    : undefined;
}
export function InputMulti({
  id,
  value,
  spec,
  label,
  onChange,
  disabled,
  style,
  uncontrolled,
}) {
  const [_value, setValue] = useState(() =>
      transformToState(value, spec)
    ),
    changing = ({ type, target }) => {
      const ids = target.id.split('_'),
        n_v = [..._value],
        active = n_v[ids[0]];
      if (type === 'change') {
        const v = Number(target.value);
        if (!Number.isNaN(v)) active[ids[1]] = v;
      } else active[ids[1]] = ++active[ids[1]] % 2;

      if (uncontrolled) setValue(n_v);
      const val = transformToValue(_value, spec);
      console.log(val);
      onChange?.(val, id);
    };

  useEffect(() => {
    const v = transformToState(value, spec);
    setValue(v);
  }, [value]);

  return (
    <div
      className={classNames(['decor border multi'], { disabled })}
      style={style}>
      {spec.map((e, i) => (
        <Fragment key={i}>
          <input
            type="text"
            id={`${i}_0`}
            value={_value[i][0]}
            onChange={changing}
          />
          <button
            id={`${i}_1`}
            className="btn muted"
            onClick={changing}>
            {e.options[_value[i][1]]}
          </button>
        </Fragment>
      ))}
      {label && (
        <label htmlFor={id} className="lbl">
          {label}
        </label>
      )}
    </div>
  );
}
