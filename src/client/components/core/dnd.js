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
  //  notAllowed = 'no-drop',
  placeholderClass = 'drag-place',
  s_drop = '[data-drop]',
  s_draggable = '[data-draggable]',
  s_handle = '[data-drag-handle]',
  s_container = '[data-drag-container]',
  drag_handle = 'data-drag-handle',
  thr_x = 0.1,
  thr_y = 0.5;

//item handlers
function setCursor(elem, cursor = 'pointer') {
  const handle = elem.querySelector(s_handle);
  elem.style.setProperty('cursor', cursor);
  if (handle) handle.style.setProperty('cursor', cursor);
}
//either elem contains child with data-drag-handle set or set it to elem itself
function initDraggable(ref) {
  let handle = getOwnItem(ref, s_draggable, s_handle);
  if (!handle && !ref.classList.contains(placeholderClass)) {
    handle = ref;
    handle.setAttribute(drag_handle, true);
  }
}
function clearDraggable(ref) {
  let handle = getOwnItem(ref, s_draggable, s_handle);
  if (!handle) {
    ref.removeAttribute(drag_handle);
  }
}
function isClosestUp(item, root, rootSelector) {
  return item?.closest(rootSelector) === root;
}
function closestUp(item, selector, self) {
  return (self ? item : item.parentElement).closest(selector);
}
function getOwnItems(root, rootSelector, itemSelector) {
  return [...root.querySelectorAll(itemSelector)].filter((e) => {
    const closest = closestUp(e, rootSelector);
    return root === closest;
  });
}
function getOwnItem(root, rootSelector, itemSelector) {
  const item = root.querySelector(itemSelector),
    closest = item.closest(rootSelector);
  return root === closest ? item : undefined;
}

const onmousemove = (ev) => {
    const { clientX: x, clientY: y, ctrlKey: key } = ev,
      item = document.querySelector(s_drag),
      [x0, y0] = item.dataset.dragStart
        .split(',')
        .map((e) => Number(e));
    item.style.setProperty(
      'transform',
      `translate(${x - x0}px, ${y - y0}px)`
    );

    triggerEvent('ce_drag', item, {
      item,
      mouse: { x, y, key },
      copy: key,
    });
  },
  onmousedown = (ev) => {
    const handle = ev.target.closest(s_handle),
      item = handle?.closest(s_draggable);
    if (!item) return;
    document.addEventListener('mousemove', onmousemove);
    ev.stopImmediatePropagation();
    const { clientX: x, clientY: y, ctrlKey: key } = ev;
    triggerEvent('ce_onItem', item, {
      item,
      mouse: { x, y, key },
      //   lid: _.last(item.dataset.dragContainer.split('.')),
      copy: key,
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
function overlap(box, tgt, lx = thr_x, ly = thr_y) {
  if (!tgt) return;
  const tgt_box = tgt.getBoundingClientRect(),
    x = Math.max(0, xOverlap(box, tgt_box)),
    y = Math.max(0, yOverlap(box, tgt_box));
  return x > lx * box.width && y > ly * box.height;
}
function draggables(area) {
  return area
    ? [...area.childNodes].filter((e) => e.dataset?.draggable)
    : [];
}
function getPlaceholder(area) {
  return [...area.childNodes].find((e) =>
    e.classList?.contains(placeholderClass)
  );
}

const toClear = ['root', 'dragEnd', 'dragStart'],
  tempProps = ['source', 'active', 'draggedContainer'];
class DropArea {
  constructor(elem, id) {
    this.area = elem;
    this.id = id;
    if (!getPlaceholder(this.area)) {
      const ph = document.createElement('div');
      ph.classList.add(placeholderClass);
      this.area.append(ph);
    }
  }
  getItemPos(box) {
    const nodes = draggables(this.area),
      ind = nodes.findIndex((e) => overlap(box, e, 0.1, 0.4));
    return ind > -1 ? ind : nodes.length - 1;
  }
  getDraggables() {
    return draggables(this.area);
  }
  setPlaceholderPos(ind, el) {
    if (!el) el = getPlaceholder(this.area);
    el.style.setProperty('order', ind * 10 + 1);
  }
  movePlaceholder(box, y) {
    const el = getPlaceholder(this.area),
      // ind = this.getItemPos(box, this.area),
      { top, bottom } = box,
      points = this.getDraggables().map((e) => {
        const bx = e.getBoundingClientRect();
        return Math.round(bx.top + bx.height / 2);
      }),
      up = this.mouseY > y;
    let ind = up
      ? points.findIndex((e) => e > top)
      : points.findIndex((e) => e > bottom);

    if (ind < 0) ind = points.length;
    this.mouseY = y;
    this.setPlaceholderPos(ind, el);
    return ind;
  }
  overArea(box) {
    return this.area.dataset.drop && overlap(box, this.area);
  }
}

//Dragcontainer may contain drop target (with draggable items in) and a header
//or with no header, being direct drop target
class Container {
  constructor(elem, options) {
    Object.assign(this, options);
    elem.setAttribute('data-drag-container', this.id);
    this.level = this.id?.split('.').length || 0;
    this.root = elem;
    //2 modes: regular (allows add/remove draggables)
    //or toolbar (inserts draggable copy onto drop area)
    this.dragInfo = {};
    this.setDropArea();
  }
  reset() {
    const items = getOwnItems(this.root, s_container, s_draggable);
    items.forEach((e, i) => {
      e.style.order = (i + 1) * 10;
      initDraggable(e);
    });
  }
  setDropArea() {
    const items = getOwnItems(this.root, s_container, s_drop);
    this.droparea =
      items.length === 1
        ? new DropArea(items[0], this.id)
        : undefined;
  }
  clear() {
    const items = getOwnItems(this.root, s_container, s_draggable);
    items.forEach(clearDraggable);
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
  setPlaceholder(y) {
    const el = getPlaceholder(this.droparea.area);
    el.classList.add('on');
    this.droparea.mouseY = y;
    // if (this.dragInfo.ind > -1)
    //   this.droparea.setPlaceholderPos(this.dragInfo.ind);
    return el;
  }
  movePlaceholder(box, y) {
    this.placeholderPos = this.droparea?.movePlaceholder(box, y);
  }
  showPlaceholder(ind) {
    if (ind > -1) this.dragInfo.ind = ind;
    const el = getPlaceholder(this.droparea.area);
    el.classList.add('on');
    this.droparea.setPlaceholderPos(this.dragInfo.ind);
    return el;
  }
  clearPlaceholder() {
    const el = getPlaceholder(this.droparea?.area);
    el.classList.remove('on');
    el?.style.removeProperty('order');
    delete this.droparea.mouseY;
    delete this.placeholderPos;
  }
  onDragStart({ item, mouse, copy }) {
    //, shift    //  this.dragStart?.();
    const container = dragManager.root,
      template =
        [...item.children].find((e) => e.dataset.dragElement) || item,
      elem = template.cloneNode(true),
      t_box = template.getBoundingClientRect(),
      { x, y } = mouse, //key
      c_box = container.getBoundingClientRect();
    setCursor(elem, 'grabbing');

    this.dragInfo.copy = copy || this.toolbar;
    if (copy && !this.toolbar) setCursor(elem, 'copy');
    elem.dataset.dragStart = [x, y].join(',');
    container.appendChild(elem);
    elem.style.setProperty(
      'top',
      `${t_box.top - c_box.top + container.scrollTop}px` //- shift.top
    );
    elem.style.setProperty(
      'left',
      `${t_box.left - c_box.left}px` // - shift.left
    );
    elem.style.setProperty('width', `${t_box.width}px`);
    elem.style.setProperty('height', `${t_box.height}px`);
    elem.classList.toggle(dragClass);
    this.dragInfo.ind = draggables(item.parentNode).indexOf(item);
    const ind = this.droparea.getDraggables().indexOf(item);
    template.setAttribute('data-drag-ghost', '1');
    this.droparea.setPlaceholderPos(ind);
    return t_box;
  }
  onDragEnd() {
    this.dragInfo = {};
    const ghost = this.root.querySelector('[data-drag-ghost]');
    if (ghost) ghost.removeAttribute('data-drag-ghost');
  }
  refresh() {
    //this.setDropArea();
  }
}

export const dragManager = {
  init(shift) {
    this.id = 'dragManager';
    //Since header and aside are positioned fixed, main area
    //where dnd is being used must be shifted
    this.shift = shift;
    this.start = this.dragStart.bind(this);
    this.drag = this.dragging.bind(this);
    this.end = this.dragEnd.bind(this);
    this.root = document.querySelector('.app-content');
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
  update(id) {
    this.containers.get(id)?.reset();
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
  updateRegister() {
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
    //  const overDrop =       ||      !container?.droparea.area.height;
    return { container, overDrop: container?.overDropArea(box) };
  },
  dragStart(ev) {
    const { item, mouse } = ev.detail,
      containers = [...this.containers.values()],
      itemContainer = item.closest(s_container),
      id = itemContainer?.dataset.dragContainer;
    //wrapping container of the dragged item

    //can drop on the source?
    // dragManager.active = dragManager.source.droparea
    //   ? dragManager.source
    //   : undefined;

    //if dragging a container
    if (item.dataset.dragContainer) {
      this.draggedContainer = containers.find((e) => e.root === item);
      this.draggedContainer?.collapse();
      const parent = closestUp(
        this.draggedContainer.root,
        s_container
      );
      this.source = containers.find((e) => e.root === parent);
    } else this.source = containers.find((e) => e.id === id);
    this.active = this.source;
    const box = this.source.onDragStart(ev.detail, this.shift);
    this.root.style.setProperty('--pl-height', `${box.height}px`);

    this.source.setPlaceholder(mouse.y);
  },
  dragging(ev) {
    const { item, mouse } = ev.detail, //, copy
      { active, source } = this,
      box = item.getBoundingClientRect(),
      { container, overDrop } = this.findActiveContainer(item, box);
    // if (
    //   new_active &&
    //   !new_active.allowDeepGroupDrop &&
    //   this.draggedContainer?.level <= new_active.level
    // ) {
    //   new_active = undefined;
    // }

    if (container !== active) {
      //!active && container - set placeholder on container (if overDrop)
      //active && container - clear placeholder on active, set placeholder on container (if overDrop)
      //active && !container - clear placeholder on active, show placeholder on source
      console.log(container?.id);
      active?.clearPlaceholder();
      if (container) {
        // if (container.id === 'gr:lxLZ.group:XBEV') {
        //   console.log(container.id);
        // }
        if (container !== source) {
          container.collapse?.[0]?.(); //expanding
          if (!overDrop) container.showPlaceholder(0);
        }
        if (!active) {
          source.clearPlaceholder();
        }
        this.active = overDrop ? container : undefined;
        this.active?.setPlaceholder(mouse.y);
      } else {
        setCursor(item, 'no-drop');
        source.showPlaceholder();
        this.active = undefined;
      }
    } else active?.movePlaceholder(box, mouse.y);
  },
  dragEnd(ev) {
    const { item } = ev.detail, //, copy
      { active, source } = this,
      from = Object.assign({ id: source.id }, source.dragInfo),
      ind = active?.placeholderPos,
      to = ind > -1 && {
        id: active.id,
        drop_id: active.overDropArea(item.getBoundingClientRect()),
        ind: active?.placeholderPos,
      },
      reportDrag = to && (to.id !== from.id || to.ind !== from.ind);

    //souce container was in copy mode, items was added to DOM
    const onEnd = (self) => () => {
      const { active, root, source } = self;
      item.remove();
      root.style.removeProperty('--pl-height');
      source.clearPlaceholder();
      source.onDragEnd(item);
      _.clearDrop(this, tempProps);
      active?.clearPlaceholder();
    };

    if (reportDrag) {
      onEnd(this)();
      active.dragEnd({ from, to });
    } else {
      item.addEventListener('animationend', onEnd(this), {
        once: true,
      });
      item.classList.add('drag_end');
    }
  },
};

///useDrop
export function useDrag(options = {}, allow) {
  const ref = options.ref || useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const id = allow && dragManager.register(ref.current, options);
    return () => {
      dragManager.unregister(id);
    };
  }, [allow]);
  useEffect(() => {
    allow && dragManager.update(options.id);
  });
  return { ref };
}
