import { nanoid } from 'nanoid';

export function formRequest(payload) {
  const { item, id, changes, type } = payload;
  if (changes) return { type, op: 'edit', id, changes };
  if (item) {
    return item.id
      ? { type, op: 'update', id: item.id, item }
      : {
          type,
          op: 'add',
          item: Object.assign(item, { id: nanoid() }),
        };
  } else return { type, op: 'delete', id };
}

export const withCommon = (obj, common) => {
  obj.common = common ? 1 : 0;
  return obj;
};

export const dfltRequestOptions = { sort: { name: 'asc' } };
