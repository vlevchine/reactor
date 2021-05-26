import {
  Button,
  ButtonGroup,
  Cascade,
  Checkbox,
  // Confirm,
  ConfirmButton,
  Dropdown,
  Duration,
  Info,
  TextInput,
  NumberInput,
  InputTyped,
  DateInput,
  MaskedInput,
  MultiSelect,
  Radio,
  Select,
  Tag,
  TagGroup,
  TagSelect,
  TextArea,
  TextEditor,
} from './core';
import Table from './table';
import RawHtml from './rawHtml';
export { default as InputGroup } from './formGroup';
export { default as Portal } from './core/portal';

//Controls with fixed label
export const directControls = {
  Button,
  ButtonGroup,
  Cascade,
  Checkbox,
  ConfirmButton,
  InputTyped,
  Radio,
  RawHtml,
  Dropdown,
  Info,
  Table,
  TagSelect,
  TagGroup,
  TextEditor,
};

//controls with transient label
export const controls = {
  Select,
  MultiSelect,
  Tag,
  DateInput,

  //controls that may be wrapped with Decorator
  decoratable: {
    TextInput,
    NumberInput,
    MaskedInput,
    TextArea,
    Duration,
  },
};

import Section from './formSection';
export { default as Field } from './formField';
import { Panel, Tabs, Group } from './formContainers';
export const containers = { Section, Panel, Tabs, Group };
