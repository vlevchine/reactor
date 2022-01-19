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
const fa_icons = {
  'address-card': '\uf2bb',
  'angle-right': '\uf105',
  'angle-down': '\uf107',
  'angle-double-right': '\uf101',
  'ballot-check': '\uf733',
  bars: '\uf0c9',
  browser: '\uf37e',
  calendar: '\uf073',
  check: '\uf00c',
  'caret-right': '\uf0da',
  'chevron-down': '\uf078',
  'chevron-right': '\uf054',
  'chevron-double-right': '\uf324',
  cog: '\uf013',
  cogs: '\uf085',
  'envelope-open-text': '\uf658',
  'ellipsis-v': '\uf142',
  'exclamation-triangle': '\uf071',
  'file-code': '\uf1c9',
  filter: '\uf0b0',
  folders: '\uf660',
  'folder-open': '\uf07c',
  'folder-tree': '\uf802',
  globe: '\uf0ac',
  'globe-americas': '\uf57d',
  home: '\uf015',
  'home-alt': '\uf80a',
  'home-user': '\ue065',
  info: '\uf129',
  'ruler-triangle': '\uf61c',
  save: '\uf0c7',
  'sign-out-alt': '\uf2f5',
  search: '\uf002',
  tasks: '\uf0ae',
  'times-octagon': '\uf2f0',
  tint: '\uf043',
  user: '\uf007',
  'user-friends': '\uf500',
};
export const getIcon = (v) =>
  v ? fa_icons[v] || icons[v] || v : undefined;

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
