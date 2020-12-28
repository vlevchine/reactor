import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { _ } from '@app/helpers';
import { Machine, State, interpret } from 'xstate';

const { isFunction, identity, noop } = _,
  defaultOptions = {
    immediate: false,
  },
  useMachine = (machineDef, options = defaultOptions) => {
    const {
        rehydratedState,
        immediate,
        interpreterOptions,
        ...machineConfig
      } = options,
      { context, actions, services } = machineConfig; //also : guards, activities, delays

    const machineRef = useRef(null),
      serviceRef = useRef(null);
    if (machineRef.current === null) {
      const machine = Machine(machineDef);
      machineRef.current = machine.withConfig(machineConfig, {
        ...machine.context,
        ...context,
      });
      serviceRef.current = interpret(
        machineRef.current,
        interpreterOptions
      ).onTransition((state) => {
        if (state.changed) setCurrent(state);
      });
    }

    const service = serviceRef.current,
      opts = service.machine.options,
      initialState = rehydratedState
        ? State.create(rehydratedState)
        : service.initialState,
      [current, setCurrent] = useState(() => initialState);

    useEffect(() => {
      Object.assign(opts.actions, actions);
    }, [actions]);

    useEffect(() => {
      Object.assign(opts.services, services);
    }, [services]);

    // Start service immediately (before mount) if specified in options
    if (immediate) service.start();

    useEffect(() => {
      // Start the service on mount, stop when unmounts.
      service.start(rehydratedState ? initialState : undefined);
      return () => service.stop();
    }, []);

    return [current, service.send, service];
  };

const defSchema = { fields: [] },
  useMetadata = (bound, schema = defSchema, ctx) => {
    return useMemo(() => {
      let meta =
        schema.fields.find((f) => f.name === bound) ||
        Object.create(null);
      if (meta.type === 'PagedList') {
        Object.assign(meta, ctx.schema[meta.directives.of.type]);
        meta.multi = true;
      }
      meta.fields &&
        meta.fields.forEach((f) => {
          if (isFunction(f.options)) {
            //&& meta.options.length === 2
            f.options = f.options.bind(null, ctx);
          }
        });

      return meta;
    }, []);
  };

const useSyncedState = (value) => {
    const [val, setVal] = useState(value);
    useEffect(() => {
      setVal(value);
    }, [value]);
    return [val, setVal];
  },
  useToggle = (initial) => {
    const [tog, setToggle] = useState(initial),
      toggle = useCallback(() => setToggle((t) => !t));
    return [tog, toggle];
  };

const useRect = (cb, selector = identity) => {
  const elRef = useRef(null);
  function setRect() {
    const el = selector(elRef.current),
      rect = Array.isArray(el)
        ? el.map((e) => e.getBoundingClientRect())
        : el.getBoundingClientRect();
    cb(rect);
  }
  useEffect(() => {
    setRect();
    window.addEventListener('resize', setRect);
    return () => window.removeEventListener('resize', setRect);
  }, []);
  return elRef;
};
const toEmptyString = (v) => v ?? '',
  toUndefined = (v) => (v === '' ? undefined : v);

const useInputHandlers = ({
  value,
  dataid,
  debounce,
  onChange = noop,
  onEditEnd,
  onKey,
}) => {
  const immediate = debounce === 0,
    delayed = debounce > 0,
    _value = toEmptyString(value),
    [val, setVal] = immediate ? [_value, noop] : useState(_value),
    timeout = useRef(),
    notify = (v) => {
      timeout.current = undefined;
      if (v !== _value) onChange(toUndefined(v), dataid);
    },
    clear = () => notify(),
    //in case of immediate val === _value always! so onChange will not run-in
    //in case of delayed val and _value will be synched after timeout,
    //so if blur happens after timeout, onChgange also not run
    //in case of fully controlled onChange will run
    onBlur = () => {
      notify(val, dataid);
      onEditEnd?.(val, dataid);
    },
    keyPressed = (ev) => {
      const code = ev.keyCode;
      //on Enter has the same effect as blur
      if (code === 13) {
        onBlur();
      } else onKey?.(code); //?????????????
    },
    updated = (ev) => {
      const _v = ev?.target?.value;
      setVal(_v);
      return _v;
    },
    notifyUpdated = (ev) => notify(updated(ev)),
    resetUpdated = (ev) => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(notify, debounce, updated(ev));
    },
    changed = immediate
      ? notifyUpdated
      : delayed
      ? resetUpdated
      : updated;
  !immediate &&
    useEffect(() => {
      setVal(_value);
    }, [_value]);

  return [val, changed, onBlur, keyPressed, clear, setVal];
};

const useStoredValue = (key, val, inSession) => {
  const storage = inSession
      ? window.sessionStorage
      : window.localStorage,
    [state, setState] = useState(() => {
      const cached = storage.getItem(key);
      return cached ? JSON.parse(cached) : val;
    });

  useEffect(() => {
    if (state) {
      storage.setItem(key, JSON.stringify(state));
    } else {
      storage.removeItem(key);
    }
  }, [state]);
  return [state, setState];
};

export {
  useMachine,
  useMetadata,
  useSyncedState,
  useToggle,
  useRect,
  useInputHandlers,
  useStoredValue,
};
