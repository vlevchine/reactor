export { iconNames, AppIcons } from './svg_icons';

export const icons = {
  //Symbols
  'ballot-x': '\u2718',
  checkmark: '\u2714',
  checked: '\u2611',
  unchecked: '\u2610',
  'checked-no': '\u2612',
  'ellipsis-v-s': '\u22EE',
  'ellipsis-h-s': '\u22EF',
  tricolon: '\u205D',
  'flag-white': '\u2690',
  'flag-black': '\u2691',
  minus: '\u2212',
  times: '\u00D7',
  plus: '\u002B',
  pointing: '\u261B',
  pencil: '\u270F',
  scissors: '\u2702',
  'start-white': '\u269D',
  'warning-sign': '\u26A0',
  //FA icons
  'plus-circle': '\uf055',
  'atom-alt': '\uf5d3',
  'address-card': '\uf2bb',
  adjust: '\uf042',
  anchor: '\uf13d',
  'ballot-check': '\uf733',
  bars: '\uf0c9',
  browser: '\uf37e',
  calendar: '\uf073',
  'caret-down': '\uf0d7',
  'caret-left': '\uf0d9',
  'chevron-down': '\uf078',
  'chevron-up': '\uf077',
  'chevron-left': '\uf053',
  'chevron-double-left': '\uf323',
  'chevron-right': '\uf054',
  'chevron-double-right': '\uf324',
  'calendar-plus': '\uf271',
  check: '\uf00c',
  'check-circle': '\uf058',
  'check-square': '\uf14a',
  cogs: '\uf085',
  cog: '\uf013',
  'compress-alt': '\uf422',
  edit: '\uf044',
  'ellipsis-v': '\uf142',
  'ellipsis-h': '\uf141',
  'engine-warning': '\uf5f2',
  'envelope-open-text': '\uf658', //pro
  'exclamation-circle': '\uf06a',
  'exclamation-triangle': '\uf071',
  'expand-alt': '\uf424',
  filter: '\uf0b0',
  'folder-open': '\uf07c',
  'globe-americas': '\uf57d',
  info: '\uf129',
  'info-circle': '\uf05a',
  'oil-can': '\uf613',
  pager: '\uf815',
  question: '\uf128',
  'question-circle': '\uf059',
  'ruler-triangle': '\uf61c',
  search: '\uf002',
  'sign-out': '\uf08b',
  sort: '\uf0dc',
  'sort-up': '\uf0de',
  'sort-down': '\uf0dd',
  // times: '\uf00d',
  'times-circle': '\uf057',
  'times-octagon': '\uf2f0',
  tint: '\uf043',
  'trash-alt': '\uf2ed',
  tools: '\uf7d9',
  thunderstorm: '\u2608',
  warning: '\u26A0',
  user: '\uf007',
  'user-friends': '\uf500',
};

export const getIcon = (v) => icons[v] || v;
