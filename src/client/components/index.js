import {
  Button,
  ButtonGroup,
  Cascade,
  Checkbox,
  // Confirm,
  ConfirmButton,
  Dropdown,
  Info,
  Input,
  InputNumber,
  InputTyped,
  DateInput,
  MaskedInput,
  MultiSelect,
  Radio,
  Select,
  Tag,
  TagGroup,
  TextArea,
} from './core';
import Table from './table';
export { default as Field } from './field';
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
  Dropdown,
  Info,
  Table,
};

//controls with transient label
export const controls = {
  Select,
  MultiSelect,
  Tag,
  DateInput,

  //controls that may be wrapped with Decorator
  decoratable: {
    Input,
    InputNumber,
    MaskedInput,
    TagGroup,
    TextArea,
  },
};
