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
  DateInput,
  MaskedInput,
  MultiSelect,
  Radio,
  Select,
  //Table,
  Tag,
  TagGroup,
  TextArea,
} from './core';

export { default as Field } from './field';
export { default as InputGroup } from './formGroup';
export { default as Portal } from './portal';

//Controls with fixed label
export const directControls = {
  Button,
  ButtonGroup,
  Cascade,
  Checkbox,
  ConfirmButton,
  Radio,
  Dropdown,
  Info,
};

//controls with transient label
export const controls = {
  Select,
  MultiSelect,
  Tag,
  DateInput,
  //Table
  //controls that may be wrapped with Decorator
  decoratable: {
    Input,
    InputNumber,
    MaskedInput,
    TagGroup,
    TextArea,
  },
};
