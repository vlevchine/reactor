/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useRef, useEffect } from 'react';
import { _ } from '@app/helpers';
import { createSvgIcon } from './icon';
import {
  isCollapsed,
  collapse,
  expand,
  triggerEvent,
} from './helpers';
import './dnd.css';

//all containers and draggable items must have globally unique ids
// Container:
//1. const ref = useDrop(id, withHandle,dragEnded) where dragEnded handles drag result
//2. pass ref to wrapper <div ref={ref} ... >...</div> - it'll have drag-container set
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
  threshold = 0.5;

function createHandle() {
  const handle = document.createElement('span'),
    svg = createSvgIcon('grip-vertical-r');
  handle.append(svg);
  handle.setAttribute('data-drag-handle', true);
  return handle;
}

//item handlers
function decorateDragItem(ref, withHandle) {
  let handle = ref.querySelector(s_handle);
  if (handle) return handle;
  const header = ref.querySelector(s_handle) ?? ref;
  if (withHandle) {
    handle = createHandle();
    header.insertBefore(handle, header.firstChild);
  } else header.setAttribute('data-drag-handle', true);
  return withHandle ? handle : ref;
}
function findDropArea(elem) {
  return elem.dataset.drop ? elem : elem.querySelector(s_drop);
}
function findClosestUp(tgt, prop, itself) {
  if (itself && tgt.dataset[prop]) return tgt;
  let item = tgt;
  do {
    item = item.parentNode;
  } while (item && !item.dataset?.[prop]);
  return item;
}
function findAreaIndex(box, areas = [], self) {
  const ind = areas.reduce((acc, e, i) => {
    if (e === self) return acc;
    if (overlap(box, e) && (acc < 0 || areas[acc].contains(e)))
      acc = i;
    return acc;
  }, -1);
  return ind;
}

const onmousemove = (ev) => {
    const { clientX, clientY } = ev,
      item = document.querySelector(s_drag),
      [x0, y0] = item.dataset.dragStart
        .split(',')
        .map((e) => Number(e));
    Object.assign(item.style, {
      transform: `translate(${clientX - x0}px, ${clientY - y0}px)`,
    });
    triggerEvent('ce_drag', item, item);
  },
  onmousedown = (ev) => {
    const { currentTarget, clientX, clientY } = ev,
      item = findClosestUp(currentTarget, 'draggable', true);
    document.addEventListener('mouseup', onmouseup);
    document.addEventListener('mousemove', onmousemove);
    ev.stopImmediatePropagation();
    const box = item.getBoundingClientRect();
    item &&
      Object.assign(item.style, {
        width: `${box.width}px`,
        height: `${box.height}px`,
      });

    item.dataset.dragStart = [clientX, clientY].join(',');
    triggerEvent('ce_onItem', item, { item, box });
  },
  onmouseup = (ev) => {
    ev.stopImmediatePropagation();
    const item = document.querySelector(s_drag);
    document.removeEventListener('mouseup', onmouseup);
    document.removeEventListener('mousemove', onmousemove);
    Object.assign(item.style, {
      top: null,
      left: null,
      width: null,
      height: null,
      transform: null,
    });
    item.removeAttribute('id');
    item.classList.remove(notAllowed);
    item.dataset.dragStart = undefined;
    triggerEvent('ce_ofItem', item, { item });
  };

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
//Dragcontainer may contain drop target (with draggable items in) and a header
//or with no header, being direct drop target
class Container {
  constructor(elem, id, onDragEnd, allowDeepGroupDrop) {
    this.id = id || elem.dataset.dragContainer;
    this.level = this.id?.split('.').length || 0;
    this.root = elem;
    this.dropArea = findDropArea(this.root);
    this.reportDrag = onDragEnd;
    this.allowDeepGroupDrop = allowDeepGroupDrop;
  }
  clear() {
    this.root = undefined;
    this.dropArea = undefined;
    this.reportDrag = undefined;
  }
  getStaticNodes() {
    return [...this.dropArea.childNodes].filter(
      (e) => !e.classList.contains(dragClass)
    );
  }
  getItemPos(rect) {
    const y = rect.bottom - rect.height / 2,
      items = this.getStaticNodes(),
      ind = items.findIndex((e) => {
        const { bottom } = e.getBoundingClientRect();
        return y < bottom;
      });
    return ind; //this.items.findIndex((e) => overlap(rect, e));
  }
  placeholderIndex() {
    return this.getStaticNodes().findIndex((e) =>
      e.classList.contains(placeholderClass)
    );
  }
  getPlaceholder() {
    return this.getStaticNodes().find((e) =>
      e.classList.contains(placeholderClass)
    );
  }
  getDragItem() {
    return this.root.classList.contains('dragging')
      ? this.root
      : this.root.querySelector(s_drag);
  }
  positionItemInBox(item) {
    const { x, y } = this.relativePos,
      { top, left } = this.dropArea.getBoundingClientRect();
    Object.assign(item.style, {
      top: `${y - top}px`,
      left: `${x - left}px`,
    });
  }
  expand() {
    this.wasCollapsed = isCollapsed(this.root);
    if (this.wasCollapsed) expand(this.root);
    return this.wasCollapsed;
  }
  collapse() {
    if (!isCollapsed(this.root)) collapse(this.root);
  }
  restoreExpand() {
    if (this.wasCollapsed) collapse(this.root);
    return this.wasCollapsed;
  }
  onDragStart(box, item) {
    this.relativePos = { x: box.left, y: box.top };
    this.positionItemInBox(item);
    this.from = [...this.dropArea.childNodes].indexOf(item);
    this.addPlaceholder(this.from, box);
  }
  onDragEnd(item) {
    _.clearDrop(this, ['relativePos', 'from']);
    item.classList.toggle(dragClass);
    this.hidePlaceholder();
  }
  insertAt(ind, el) {
    const nodes = this.getStaticNodes(),
      elPos = nodes.indexOf(el);
    if (ind > -1 && ind === elPos) return;
    const node = nodes[ind < elPos || elPos < 0 ? ind : ind + 1];

    if (node) {
      node.before(el);
    } else this.dropArea.append(el);
    return true;
  }
  addPlaceholder(ind, box, className) {
    let ph = this.getPlaceholder();
    if (!ph) {
      ph = document.createElement('div');
      ph.classList.add(placeholderClass);
      if (className) ph.classList.add(className);
    }

    Object.assign(ph.style, { height: `${box.height}px` });
    return this.insertAt(ind, ph);
  }
  movePlaceholder(box) {
    const el = this.getPlaceholder(),
      ind = this.getItemPos(box);
    return this.insertAt(ind, el);
  }
  fixPlaceholder(box) {
    this.addPlaceholder(this.from, box, 'place-from');
  }
  hidePlaceholder() {
    const el = this.getPlaceholder();
    el && this.dropArea.removeChild(el);
  }
}

const tempProps = ['source', 'active', 'draggedContainer'],
  dragStart = (ev) => {
    const { box, item } = ev.detail,
      { containers } = dragManager,
      areas = containers.map((e) => e.dropArea).filter(Boolean),
      itemContainer = findClosestUp(item, 'dragContainer');

    //wrapping container of the dragged item
    dragManager.source = containers.find(
      (e) => e.root === itemContainer
    );
    dragManager.active = dragManager.source;
    //set, if dragging a container
    if (findClosestUp(item, 'dragContainer', true) === item) {
      dragManager.draggedContainer = containers.find(
        (e) => e.root === item
      );
    }
    item.classList.toggle(dragClass);
    dragManager.source.onDragStart(box, item);
    areas.forEach((e) => dragManager.resizer.observe(e));
  },
  dragging = (ev) => {
    const item = ev.detail,
      { active, containers, source, draggedContainer } = dragManager,
      box = item.getBoundingClientRect(),
      otherContainers = containers.filter(
        (c) => c !== draggedContainer
      ),
      overContainer =
        otherContainers[
          findAreaIndex(
            box,
            otherContainers.map((c) => c.root),
            item
          )
        ],
      overArea = overlap(box, overContainer?.dropArea);
    let new_active = overArea ? overContainer : undefined;
    //  console.log(overContainer.id, overArea);
    if (
      new_active &&
      !new_active.allowDeepGroupDrop &&
      draggedContainer?.level <= new_active.level
    ) {
      new_active = undefined;
    }

    //left drop area or stays on the same
    if (new_active !== active) {
      //left source or other target
      if (active === source) {
        source.fixPlaceholder(box);
      } else if (active) {
        active.hidePlaceholder();
        active.restoreExpand();
      }
      //get to any target ot nothing
      if (new_active) {
        item.classList.remove(notAllowed);
        if (new_active !== source) {
          const onDropArea = overlap(box, new_active?.dropArea);
          if (!onDropArea) new_active.expand();
          const pos = new_active.getItemPos(box);
          new_active.addPlaceholder(pos, box);
        } else source.movePlaceholder(box);
      } else item.classList.add(notAllowed);
    } else {
      new_active?.movePlaceholder(box);
    }
    dragManager.active = new_active;
  },
  dragEnd = (ev) => {
    const { item } = ev.detail,
      { active, source, containers } = dragManager,
      from = { id: source.id, ind: source.from },
      to = active && {
        id: active.id,
        pos: active.placeholderIndex(),
      },
      areas = containers.map((e) => e.dropArea).filter(Boolean),
      dropAreaChanged = active && active !== source;
    source.onDragEnd(item);
    if (dropAreaChanged) active.hidePlaceholder();
    areas.forEach((e) => dragManager.resizer.unobserve(e));
    _.clearDrop(dragManager, tempProps);
    to &&
      (dropAreaChanged || to.pos !== from.ind) &&
      active.reportDrag({ from, to });
  },
  onResize = (mng) => () => {
    const src = mng.source;
    src.positionItemInBox(src.getDragItem());
  };

const dragManager = {
  init() {
    this.resizer = new ResizeObserver(onResize(dragManager));
    document.addEventListener('ce_onItem', dragStart);
    document.addEventListener('ce_ofItem', dragEnd);
    document.addEventListener('ce_drag', dragging);
  },
  clear() {
    this.resizer.disconnect();
    document.removeEventListener('ce_onItem', dragStart);
    document.removeEventListener('ce_ofItem', dragEnd);
    document.removeEventListener('ce_drag', dragging);
  },
  containers: [],
  register(...args) {
    this.containers.push(new Container(...args));
  },
  unregister(id) {
    const item = this.containers.find((e) => e.id === id);
    if (item) {
      item.clear();
      _.remove(this.containers, item);
    }
  },
  unregisterAll() {
    this.containers.forEach((c) => c.clear());
    this.containers.length = 0;
  },
  refresh(id) {
    const cont = this.containers.find((c) => c.id === id);
    if (cont) cont.dropArea = findDropArea(cont.root);
  },
};
const unregister = dragManager.unregister.bind(dragManager);
dragManager.init();

///useDrop
export function useDrag(options = {}) {
  const {
      id,
      withHandle,
      dragEnded,
      update,
      allowDeepGroupDrop,
    } = options,
    ref = useRef(null);

  useEffect(() => {
    if (!dragEnded) return;
    dragManager.register(
      ref.current,
      id,
      dragEnded,
      allowDeepGroupDrop
    );
    ref.current.dataset.dragContainer = true;
    return () => {
      dragManager.unregister(id);
    };
  }, []);

  useEffect(() => {
    if (!dragEnded) return;
    dragManager.refresh(id);
    const items = [
      ...ref.current.querySelectorAll(s_draggable),
    ].filter(
      (e) => findClosestUp(e, 'dragContainer') === ref.current
    );
    items.forEach((c) => {
      const handle = decorateDragItem(c, withHandle);
      handle.addEventListener('mousedown', onmousedown);
    });
    return () => {
      items.forEach((c) => {
        const handle = c.querySelector(s_handle) || c;
        handle.removeEventListener('mousedown', onmousedown);
      });
    };
  }, [update]);

  return [ref, unregister];
}
