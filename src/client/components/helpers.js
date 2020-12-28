import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';

const { isArray, get, pick } = _;
// const ctrlBtn = {
//   edit: { id: 'edit', icon: 'edit', text: 'Edit' },
//   cancel: { id: 'cancel', icon: 'key-escape', text: 'Cancel' },
//   confirm: { id: 'confirm', icon: 'confirm', text: 'Save' },
//   add: { id: 'add', icon: 'add-to-artifact', text: 'Add' },
//   remove: { id: 'remove', icon: 'trash', text: 'Remove' },
//   undo: { id: 'undo', icon: 'undo', text: 'Undo' },
//   redo: { id: 'redo', icon: 'redo', text: 'Redo' },
// };
const payload = (id, value, optionInd) => ({
  path: id,
  value,
  optionInd: optionInd > -1 && [id, optionInd].join('.'),
});

//custom hooks
const useValueFromProps = (value) => {
    const [val, setVal] = useState(
        isArray(value) ? [...value] : value
      ),
      handleChange = (ev = {}) => {
        setVal(ev.target ? ev.target.value : ev);
      };
    useEffect(() => {
      setVal(isArray(value) ? [...value] : value);
    }, [value]);

    return [val, handleChange];
  },
  // 1 - Call hook on a variable inside the component: let inifiniteScroll = useInfiniteScroll()
  // 2 - Use .splice() on disered array before mapping: array.splice(0, infiniteScroll).map();
  useInfiniteScroll = (start = 30, pace = 10) => {
    const [limit, setLimit] = useState(start);
    window.onscroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight
      ) {
        setLimit(limit + pace);
      }
    };
    return limit;
  };

const containers = [
    'FormField',
    'FormSection',
    'Tabs',
    'Card',
    'ListBrowser',
    // 'Table',
  ],
  isContainer = (type) => containers.includes(type),
  applyContext = (type, ctx) => (isContainer(type) ? ctx : undefined),
  mergeIds = (...arg) => arg.filter((e) => !!e).join('.'),
  tmp_id = '_',
  tempId = () => tmp_id,
  isTempId = (id) => id === tmp_id,
  localId = () => nanoid(10),
  schemaProps = ['uom', 'type', 'kind', 'list'],
  itemMetaData = (itemSchema, ctx) => {
    if (!itemSchema) return {};
    const res = pick(itemSchema, schemaProps),
      ref =
        itemSchema.type === 'array'
          ? itemSchema.items.ref
          : itemSchema.ref;
    if (ref) {
      res.type = 'ref';
      res.options = ref.lookups
        ? ctx.lookups[ref.lookups]
        : ctx.refData[ref.data];
      if (ref.via) res.via = ref.via;
    } else {
      Object.assign(res, { lookups: ctx.lookups, itemSchema });
    }

    return res;
  },
  metaData = (bind, schemaType, ctx) => {
    const { schema } = ctx,
      itemSchema = schema[schemaType] || get(schema, bind);
    if (!itemSchema) return;
    const res = itemMetaData(itemSchema, ctx),
      ofType = itemSchema.of && schema[itemSchema.of.value];
    if (ofType) {
      res.itemSchema.itemType = ofType;
      res.itemSchema.def = schema[res.type];
    }

    return res;
  };

export {
  payload,
  useValueFromProps,
  mergeIds,
  useInfiniteScroll,
  applyContext,
  isContainer,
  metaData,
  tempId,
  isTempId,
  localId,
};
