/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useRef, useEffect } from 'react';
import { _ } from '@app/helpers';
import {
  isCollapsed,
  collapse,
  expandAll,
  triggerEvent,
} from './helpers';
import './dnd.css';

//all containers and draggable items must have globally unique ids
// Container:
//1. const ref = useDrop(id, dragEnded) where dragEnded handles drag result
//2. pass ref to wrapper <div ref={ref} ... >...</div> - it'll
//attr data-drag-container will be auto set  on ref
//if just one container within (nested treated separately)
// or within ref = if we have several containers within ref
//3. have drag items collection mapped inside data-drag-container, use data-draggable
//if container draggable, must set data-draggable on <div ref />!!!
//4. use data-drop to set drop area inside container, if omitted container itself serves as drop area
//Item:
//1. must be a div, could contain children
//2. set data-drag-header on inner div.header (for collapsibles), if not set item div becomes drag-header
//and spread bind on item - <div {...bind} ...>...</div>

const dragClass = 'dragging',
  s_drag = `.${dragClass}`,
  notAllowed = 'no-drop',
  placeholderClass = 'drag-place',
  s_drop = '[data-drop]',
  s_draggable = '[data-draggable]',
  s_handle = '[data-drag-handle]',
  s_container = '[data-drag-container]',
  threshold = 0.5;

//item handlers
function setCursor(elem, cursor = 'pointer') {
  const item = elem.querySelector(s_handle) || elem;
  item.style.cursor = cursor;
}
//either elem contains child with data-drag-handle set or set it to elem itself
function initDraggable(ref) {
  let handle = getOwnItem(ref, s_draggable, s_handle);
  if (!handle) {
    handle = ref;
    handle.setAttribute('data-drag-handle', true);
  }
}
function isClosestUp(item, root, rootSelector) {
  return item?.closest(rootSelector) === root;
}
function getOwnItems(root, rootSelector, itemSelector) {
  return [...root.querySelectorAll(itemSelector)].filter((e) =>
    isClosestUp(e, root, rootSelector)
  );
}
function getOwnItem(root, rootSelector, itemSelector) {
  const item = root.querySelector(itemSelector);
  return isClosestUp(item, root, rootSelector) ? item : undefined;
}

const clearDragItem = (item, transition) => {
    item.removeAttribute('id');
    item.classList.remove(notAllowed, dragClass);
    item.dataset.dragStart = false;
    item.style.removeProperty('top');
    item.style.removeProperty('left');
    item.style.removeProperty('width');
    item.style.removeProperty('height');
    item.style.removeProperty('transform');

    if (transition) {
      const onEnd = () => {
        item.removeEventListener('transitionend', onEnd);
        item.classList.remove('off');
      };
      item.classList.add('off');
      item.addEventListener('transitionend', onEnd);
    }
  },
  onmousemove = (ev) => {
    const { clientX, clientY } = ev,
      item = document.querySelector(s_drag),
      [x0, y0] = item.dataset.dragStart
        .split(',')
        .map((e) => Number(e));
    Object.assign(item.style, {
      transform: `translate(${clientX - x0}px, ${clientY - y0}px)`,
    });
    triggerEvent('ce_drag', item, { item, copy: ev.ctrlKey });
  },
  onmousedown = (ev) => {
    const handle = ev.target.closest('[data-drag-handle]'),
      item = handle?.closest(s_draggable);
    if (!item) return;
    document.addEventListener('mousemove', onmousemove);
    ev.stopImmediatePropagation();
    const { clientX, clientY, ctrlKey } = ev;
    item.dataset.dragStart = [clientX, clientY].join(',');
    triggerEvent('ce_onItem', item, {
      item,
      copy: ctrlKey,
    });
  },
  onmouseup = (ev) => {
    ev.stopImmediatePropagation();
    const item = document.querySelector(s_drag);
    if (!item) return;
    document.removeEventListener('mousemove', onmousemove);
    triggerEvent('ce_ofItem', item, { item, copy: ev.ctrlKey });
  };

document.addEventListener('mousedown', onmousedown);
document.addEventListener('mouseup', onmouseup);

function xOverlap(box0, box1) {
  return (
    Math.min(box0.right, box1.right) - Math.max(box0.left, box1.left)
  );
}
function yOverlap(box0, box1) {
  return (
    Math.min(box0.bottom, box1.bottom) - Math.max(box0.top, box1.top)
  );
}
function overlap(box, tgt, limit = threshold) {
  if (!tgt) return;
  const tgt_box = tgt.getBoundingClientRect(),
    x = Math.max(0, xOverlap(box, tgt_box)),
    y = Math.max(0, yOverlap(box, tgt_box));
  return x > limit * box.width && y > limit * box.height;
}
//function setRelativePositionInBox() {
// const { x, y } = pos,item, box, pos
//   { top, left } = box.getBoundingClientRect();
// item.style.top = `${y - top}px`;
// item.style.left = `${x - left}px`;
//}
function getStaticNodes(area) {
  return area
    ? [...area.childNodes].filter(
        (e) =>
          e.dataset?.draggable && !e.classList?.contains(dragClass)
      )
    : [];
}
function getPlaceholder(area) {
  return getStaticNodes(area).find((e) =>
    e.classList?.contains(placeholderClass)
  );
}
function insertAt(area, ind, el) {
  if (!area) return;
  const nodes = getStaticNodes(area),
    elPos = nodes.indexOf(el);
  if (_.isNil(ind) || !nodes.length) return false;

  if (ind > -1 && ind === elPos) return;
  const node = nodes[ind < elPos || elPos < 0 ? ind : ind + 1];

  if (node) {
    node.before(el);
  } else area.append(el);
  return true;
}

const toClear = ['root', 'reportDrop'],
  tempProps = ['source', 'active', 'draggedContainer'];
class DropArea {
  constructor(elem) {
    this.area = elem;
    if (!getPlaceholder(this.area)) {
      const ph = document.createElement('div');
      ph.dataset.draggable = 'true';
      ph.classList.add(placeholderClass);
      this.area.append(ph);
    }
  }
  placeholderIndex() {
    return getStaticNodes(this.area).findIndex((e) =>
      e.classList.contains(placeholderClass)
    );
  }
  getItemPos(box) {
    const nodes = getStaticNodes(this.area),
      ind = nodes.findIndex((e) => overlap(box, e, 0.4));
    return ind > -1 ? ind : nodes.length - 1;
  }
  addPlaceholder(box, ind) {
    if (_.isNil(ind)) ind = this.getItemPos(box);
    if (ind < 0) return false;
    const el = getPlaceholder(this.area);
    insertAt(this.area, ind, el);
    el.style.setProperty('--height', `${box.height}px`);
    el.classList.add('on');
  }
  hidePlaceholder() {
    const el = getPlaceholder(this.area);
    el.classList.remove('on');
    el.style.removeProperty('height');
    //   this.area.style.setProperty('height', 'auto');
  }
  movePlaceholder(box) {
    const el = getPlaceholder(this.area),
      ind = this.getItemPos(box, this.area);
    if (ind > -1 && ind !== this.placeholderPos) {
      this.placeholderPos = ind;
      insertAt(this.area, ind, el);
    }
    return ind;
  }
  overArea(box) {
    return overlap(box, this.area) && this.area.dataset.drop;
  }
}

//Dragcontainer may contain drop target (with draggable items in) and a header
//or with no header, being direct drop target
class Container {
  constructor(elem, options) {
    const { id, dragEnded, allowDeepGroupDrop, toolbar } = options;
    elem.setAttribute('data-drag-container', id);
    this.id = id;
    this.level = this.id?.split('.').length || 0;
    this.root = elem;
    this.setDropArea();
    this.reportDrop = dragEnded;
    this.allowDeepGroupDrop = allowDeepGroupDrop;
    //2 modes: regular (allows add/remove draggables)
    //or toolbar (inserts draggable copy onto drop area)
    this.toolbar = toolbar;
    this.dragInfo = {};
  }
  setDropArea() {
    const items = getOwnItems(this.root, s_container, s_drop);
    this.droparea =
      items.length === 1 ? new DropArea(items[0]) : undefined;
  }
  clear() {
    _.clearDrop(this, toClear);
  }
  getDragItem() {
    return this.root.classList.contains('dragging')
      ? this.root
      : this.root.querySelector(s_drag);
  }
  expand() {
    this.wasCollapsed = isCollapsed(this.root);
    if (this.wasCollapsed) expandAll(this.root);
    return this.wasCollapsed;
  }
  collapse() {
    if (!isCollapsed(this.root)) collapse(this.root);
  }
  restoreExpand() {
    if (this.wasCollapsed) collapse(this.root);
    return this.wasCollapsed;
  }
  overDropArea(box) {
    return this.droparea
      ? this.droparea.overArea(box)
      : [...this.root.querySelectorAll(s_drop)]
          .filter((e) => isClosestUp(e, this.root, s_container))
          .find((e) => overlap(box, e))?.dataset.drop;
  }
  addPlaceholder(box, ind) {
    return this.droparea?.addPlaceholder(box, ind);
  }
  hidePlaceholder() {
    this.placeholderPos = undefined;
    this.droparea?.hidePlaceholder();
  }
  movePlaceholder(box) {
    this.placeholderPos = this.droparea?.movePlaceholder(box);
  }
  onDragStart({ item, copy }, shift) {
    const container = document.querySelector('.app-content');
    const box = item.getBoundingClientRect();
    let elem = item;
    this.dragInfo.copy = copy || this.toolbar;
    //if container is in toolbar mode or copying - clone element, otherwise use original
    if (this.dragInfo.copy) {
      elem = item.cloneNode(true);
      item.parentNode.insertBefore(elem, item);
    }
    if (copy && !this.toolbar) setCursor(elem, 'copy');
    elem.style.setProperty(
      'top',
      `${box.top + container.scrollTop - shift.top}px`
    );
    elem.style.setProperty('left', `${box.left - shift.left}px`);
    elem.style.setProperty('width', `${box.width}px`);
    elem.style.setProperty('height', `${box.height}px`);
    elem.classList.toggle(dragClass);
    this.placeholderPos = [...elem.parentNode.children]
      .filter(
        (e) =>
          e.dataset.draggable &&
          !e.classList.contains(placeholderClass)
      )
      .indexOf(elem);
    this.dragInfo.ind = this.placeholderPos;
    this.droparea?.addPlaceholder(box, this.placeholderPos);
  }
  onDragEnd() {
    this.placeholderPos = undefined;
    this.dragInfo.ind = undefined;
    this.dragInfo.copy = undefined;
  }
  refresh() {
    //this.setDropArea();
  }
}

export const dragManager = {
  init(shift) {
    //Since header and aside are positioned fixed, main area
    //where dnd is being used must be shifted
    this.shift = shift;
    this.start = this.dragStart.bind(this);
    this.drag = this.dragging.bind(this);
    this.end = this.dragEnd.bind(this);
    document.addEventListener('ce_onItem', this.start);
    document.addEventListener('ce_ofItem', this.end);
    document.addEventListener('ce_drag', this.drag);
  },
  clear() {
    //   this.resizer.disconnect();
    document.removeEventListener('ce_onItem', this.start);
    document.removeEventListener('ce_ofItem', this.end);
    document.removeEventListener('ce_drag', this.drag);
  },
  containers: new Map(),
  register(elem, options) {
    const id = options?.id;
    if (id && !this.containers.has(id)) {
      const container = new Container(elem, options);
      this.containers.set(id, container);
    }
    return id;
  },
  unregister(id) {
    if (this.containers.has(id)) {
      this.containers.get(id).clear();
      this.containers.delete(id);
    }
  },
  unregisterAll() {
    this.containers.forEach((v) => v.clear());
    this.containers.clear();
  },
  // updateRegistry(containers = []) {
  //   containers.forEach(c => this.register())
  // }
  updateRegister() {
    //ids
    // const _ids = [...this.containers.keys()];
  },
  findActiveContainer(item, box) {
    const overlaps = [...this.containers.values()].filter((e) => {
        const area = e.root;
        return area === item || overlap(box, area);
      }),
      container = overlaps.find(
        (e) =>
          !overlaps.find((c) => c !== e && e.root.contains(c.root))
      );
    // if (!container.droparea.area.height) {
    //   container.droparea.area.style.setProperty('height', '40px');
    // }
    const overDrop =
      container?.overDropArea(box) || !container.droparea.area.height;

    return { container, overDrop };
  },
  dragStart(ev) {
    const { item } = ev.detail,
      containers = [...this.containers.values()],
      itemContainer = item.closest(s_container),
      id = itemContainer?.dataset.dragContainer;
    //wrapping container of the dragged item
    this.source = containers.find((e) => e.id === id);
    this.source.onDragStart(ev.detail, this.shift);
    //can drop on the source?
    dragManager.active = dragManager.source.droparea
      ? dragManager.source
      : undefined;

    //if dragging a container
    if (item.dataset.dragContainer) {
      this.draggedContainer = containers.find((e) => e.root === item);
    }
  },
  dragging(ev) {
    const { item, copy } = ev.detail,
      { active, source } = this,
      box = item.getBoundingClientRect(),
      { container, overDrop } = this.findActiveContainer(item, box);
    if (!copy) setCursor(item);

    let new_active = overDrop ? container : undefined;
    if (
      new_active &&
      !new_active.allowDeepGroupDrop &&
      this.draggedContainer?.level <= new_active.level
    ) {
      new_active = undefined;
    }

    if (!new_active) {
      if (container !== source) setCursor(item, 'no-drop');
      if (container) container.expand();
    }

    if (new_active !== active) {
      //left source or other target
      active?.hidePlaceholder();
      if (active === source) active.restoreExpand();
      //get to any target to nothing
      if (new_active) {
        setCursor(item);
        new_active.addPlaceholder(box);
      } else {
        setCursor(item, 'no-drop');
      }
    } else {
      //stays on the same drop area or nothing
      active?.movePlaceholder(box);
    }

    this.active = new_active;
  },
  dragEnd(ev) {
    const { item, copy } = ev.detail,
      { active, source } = this,
      from = Object.assign({ id: source.id }, source.dragInfo),
      to = active && {
        id: active.id,
        drop_id: active.overDropArea(item.getBoundingClientRect()),
        ind: active.droparea?.placeholderIndex(),
      },
      dropAreaChanged = active && active !== source;

    if (!copy) setCursor(item);
    source.onDragEnd(item);
    _.clearDrop(this, tempProps);
    //souce container was in copy mode, items was added to DOM
    if (from.copy) item.remove();
    active?.hidePlaceholder();
    if (dropAreaChanged || (active && to.ind !== from.ind)) {
      clearDragItem(item);
      active.reportDrop({ from, to });
    } else clearDragItem(item, true);
  },
};

///useDrop
export function useDrag(options = {}) {
  const { update } = options,
    ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    //if (dragEnded) dragManager.refresh(id);
    const id = dragManager.register(ref.current, options),
      items = getOwnItems(ref.current, s_container, s_draggable);
    items.forEach(initDraggable);
    return () => {
      dragManager.unregister(id);
    };
  }, [update]);

  return { ref };
}
