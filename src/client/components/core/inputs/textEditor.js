import { useState, useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
//import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';
import { ButtonGroup, Button } from '..';
import { commands } from './textEditor_helpers';

TextEditor.propTypes = {
  dataid: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  prepend: PropTypes.string,
  append: PropTypes.string,
  disabled: PropTypes.bool,
  clear: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
  onChange: PropTypes.func,
  intent: PropTypes.string,
};
export default function TextEditor(props) {
  const { dataid, value, onChange } = props,
    ref = useRef(),
    caretPos = useRef(0),
    [slots, setSlots] = useState(() => toSlots(value)),
    onButton = (ev, type) => {
      const pos = getTextSelection(ref.current),
        n_m = slotsToMarkup(slots),
        markup = updateMarkup(n_m, type, pos);
      caretPos.current = pos.start;
      setSlots(toSlots({ text: value.text, markup }));
    },
    onKey = (ev) => {
      let key = ev.key,
        { start, end } = getTextSelection(ref.current);
      if (ev.code === 'Enter') key = '\n';
      const limits = slotLimits(slots);
      if (key !== 'Delete' && key !== 'Backspace') {
        const [ind, pos] = slotIndex(limits, end),
          slot = slots[ind];
        slot.text =
          slot.text.slice(0, pos) + key + slot.text.slice(pos);
      }
      if (end > start) {
        //selection
        const [startInd, startPos] = slotIndex(limits, start),
          [endInd, endPos] = slotIndex(limits, end - 1);
        if (endInd > startInd) {
          //overlap multiple slotss
          const s_slot = slots[startInd];
          s_slot.text = s_slot.text.slice(0, startPos);
          const e_slot = slots[endInd];
          e_slot.text = e_slot.text.slice(endPos + 1);
          for (var i = startInd + 1; i < endInd; i++) {
            slots[i].text = '';
          }
        } else {
          //just one slot
          const txt = slots[endInd].text;
          slots[endInd].text =
            txt.slice(0, startPos) + txt.slice(endPos + 1);
        }
      } else {
        //noselection - delete or backspace
        if (key === 'Delete' && start < _.last(limits) - 1) {
          cleanChar(slots, limits, start);
        } else if (key === 'Backspace' && start > 0) {
          cleanChar(slots, limits, --start);
        }
      }
      caretPos.current = start;
      setSlots(slots.filter((e) => e.text));
      ev.preventDefault();
    },
    onBlur = () => {
      const markup = slotsToMarkup(slots),
        text = slots.map((e) => e.text).join('');
      if (caretPos.current > -1) onChange({ markup, text }, dataid);
      caretPos.current = -1;
    };

  useLayoutEffect(() => {
    const limits = slotLimits(slots),
      [ind, pos] = slotIndex(limits, caretPos.current),
      node = [...ref.current.querySelectorAll('span')][ind];
    if (node) setCaret(node, pos);
  }, [slots]);

  return (
    <div className="text-editor">
      <div className="text-editor-toolbar">
        <ButtonGroup minimal>
          {Object.values(commands).map((e) => (
            <Button
              key={e.id}
              id={e.id}
              size={e.id === 'c' ? undefined : 'sm'}
              prepend={e.icon}
              onClick={onButton}
            />
          ))}
        </ButtonGroup>
      </div>
      <div
        ref={ref}
        role="textbox"
        tabIndex="-1"
        suppressContentEditableWarning
        className="text-editor-content"
        contentEditable="true"
        onBlur={onBlur}
        onKeyDown={onKey}
        //onMouseUp={() => select(ref.current, 0, 3)}
        //onInput={changing}
      >
        <p>
          {slots.map((e, i) => (
            <span key={i} style={styleItem(e.types)}>
              {e.text}
            </span>
          ))}
        </p>

        {/* dangerouslySetInnerHTML={applyMarkup(val.text, val.markup)} */}
      </div>
    </div>
  );
}

function setCaret(target, pos) {
  const range = document.createRange();
  range.setStart(target.firstChild, pos);
  range.setEnd(target.firstChild, pos);
  const sel = window.getSelection();
  //range.selectNodeContents(target);
  sel.removeAllRanges();
  sel.addRange(range);
  range.collapse(false);
  target.focus();
  range.detach(); // optimization

  // set scroll to the end if multiline
  target.scrollTop = target.scrollHeight;
}

function getTextSelection(editor) {
  const selection = window.getSelection();

  if (selection != null && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    return {
      start: getTextLength(
        editor,
        range.startContainer,
        range.startOffset
      ),
      end: getTextLength(editor, range.endContainer, range.endOffset),
    };
  } else return null;
}

function getTextLength(parent, node, offset) {
  var textLength = 0;

  if (node.nodeName == '#text') textLength += offset;
  else
    for (var i = 0; i < offset; i++)
      textLength += getNodeTextLength(node.childNodes[i]);

  if (node != parent)
    textLength += getTextLength(
      parent,
      node.parentNode,
      getNodeOffset(node)
    );

  return textLength;
}

function getNodeTextLength(node) {
  var textLength = 0;

  if (node.nodeName == 'BR') textLength = 1;
  else if (node.nodeName == '#text')
    textLength = node.nodeValue.length;
  else if (node.childNodes != null)
    for (var i = 0; i < node.childNodes.length; i++)
      textLength += getNodeTextLength(node.childNodes[i]);

  return textLength;
}

function getNodeOffset(node) {
  return node == null ? -1 : 1 + getNodeOffset(node.previousSibling);
}
function sorter(a, b) {
  if (a.pos > b.pos) {
    return 1;
  } else if (a.pos < b.pos) {
    return -1;
  } else return b.start ? 1 : a.start ? -1 : 0;
}
//Markup start/end including, slots end set as +1
function slotsToMarkup(slots) {
  const cache = {};
  let start = 0;
  return slots.reduce((acc, slot) => {
    const types = slot.types.split(''),
      olds = Object.keys(cache),
      news = types.filter((e) => !olds.includes(e));
    //all new - add to cache
    news.forEach((e) => {
      cache[e] = acc.length;
      acc.push({ type: e, start: start });
    });
    //all in work but removed - remove from cache
    olds
      .filter((e) => !types.includes(e))
      .forEach((e) => {
        acc[cache[e]].end = start;
        delete cache[e];
      });
    start += slot.text.length;
    return acc;
  }, []);
}
function toSlots(value) {
  const text = value?.text || value || '',
    markup = value?.markup || [];
  if (!markup.length)
    return { text, start: 0, end: text.length - 1, types: '' };
  var starts = markup.map((e) => ({
      pos: e.start,
      start: true,
      type: e.type,
    })),
    length = text.length,
    ends = markup.map((e) => ({ pos: e.end, type: e.type })),
    sorted = [...starts, ...ends].sort(sorter);
  let loc = 0,
    types = '';
  const slots = sorted.reduce((acc, { pos, start, type }) => {
    if (start) {
      if (pos > loc) acc.push({ types, text: text.slice(loc, pos) });
      loc = pos;
      types = types + type;
    } else {
      if (pos >= loc)
        acc.push({ types, text: text.slice(loc, pos + 1) });
      types = types.replace(type, '');
      loc = pos + 1;
    }
    return acc;
  }, []);
  if (loc < length) slots.push({ types: '', text: text.slice(loc) });
  return slots;
}
function slotLimits(slots) {
  const res = [0];
  slots.forEach((e, i) => res.push(res[i] + e.text.length));
  res[res.length - 1] = res[res.length - 1] + 1;
  return res;
}
function slotIndex(limits, pos) {
  const ind = limits.findIndex((e) => pos < e) - 1;
  return [ind, pos - limits[ind]];
}

function between(pos, start, end) {
  return pos >= start && pos <= end;
}
function updateMarkup(markup, type, pos) {
  if (!pos || pos.end <= pos.start) return;
  const { start, end } = pos,
    //clear all completely covered,
    marks = markup.filter(
      (e) => e.type !== type || !(e.start >= start && e.end <= end)
    ),
    startsOn = marks.findIndex(
      (e) => e.type === type && between(start, e.start, e.end)
    ),
    right = marks.find(
      (e) =>
        e.type === type && between(e.start, start, end) && e.end > end
    );

  if (startsOn < 0) {
    //extend right (or touching) left to cover, else create a new one per cover
    const next =
      right || marks.find((e) => e.type === type && e.start === end);
    if (next) {
      next.start = start;
    } else marks.push({ type, start, end });
  } else {
    if (marks[startsOn].end <= end) {
      if (right) right.start = end + 1;
    } else marks.push({ type, start: end, end: marks[startsOn].end });
    marks[startsOn].end = start - 1;
  }
  return marks;
}

function cleanChar(slots, limits, pos) {
  const [ind, rel] = slotIndex(limits, pos),
    slot = slots[ind];
  slot.text = slot.text.slice(0, rel) + slot.text.slice(rel + 1);
}
function styleItem(types) {
  return types
    ? types.split('').reduce((acc, e) => {
        const cmd = commands[e],
          v = acc[cmd.prop];
        acc[cmd.prop] = v ? [v, cmd.value].join(' ') : cmd.value;
        return acc;
      }, {})
    : undefined;
}
