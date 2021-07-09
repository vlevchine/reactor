import { svg_icons } from './svg_icons';
export const icons = {
  //Symbols
  ballot: '\u2610',
  'ballot-x': '\u2612',
  'ballot-y': '\u2611',
  'bar-v': '\u275A',
  checkmark: '\u2714',
  checked: '\u2611',
  unchecked: '\u2610',
  'checked-no': '\u2612',
  'drop-shadowed-square': '\u274F',
  edit: '\u270E',
  'ellipsis-v-s': '\u22EE',
  'ellipsis-h-s': '\u22EF',
  magnifier: '\u2315', //26B2 -
  neuter: '\u26B2',
  tricolon: '\u205D',
  trigram: '\u2630',
  'flag-white': '\u2690',
  'flag-black': '\u2691',
  minus: '\u268A',
  'times-s': '\u2716',
  times: '\u2718',
  plus: '\u271A',
  pointing: '\u261B',
  pencil: '\u270F',
  scissors: '\u2702',
  'start-white': '\u269D',
  'warning-sign': '\u26A0',
};

export const getIcon = (v) => icons[v] || v;

export function createSvgIcon(name) {
  const svg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    ),
    use = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'use'
    ),
    viewBox = svg_icons[name]?.viewBox;
  use.setAttribute('href', `#${name}`); //'#grip-vertical-r'
  svg.appendChild(use);
  svg.setAttribute('viewBox', viewBox); //'0 0 320 512'
  svg.classList.add('icon');
  return svg;
}
