import PropTypes from 'prop-types';
import {
  Button,
  ButtonGroup,
  Cascade,
  Checkbox,
  Count,
  ConfirmButton,
  DateInput,
  Dropdown,
  Duration,
  Echo,
  Info,
  InputTyped,
  List,
  NumberInput,
  MaskedInput,
  MultiSelect,
  PlainList,
  Radio,
  Select,
  Tag,
  TagGroup,
  TagSelect,
  TextInput,
  TextArea,
  TextEditor,
  TriState,
} from '@app/components/core';
import Table from '@app/components/table';
import BasicTable from '@app/components/table/basicTable';

Markup.propTypes = {
  children: PropTypes.any,
  style: PropTypes.object,
};
export default function Markup({ style, children }) {
  return <div style={style}>{children}</div>;
}

//Controls with fixed label
const directControls = {
  Button,
  ButtonGroup,
  Cascade,
  Checkbox,
  ConfirmButton,
  Echo,
  InputTyped,
  Radio,
  Markup,
  Dropdown,
  Info,
  BasicTable,
  List,
  PlainList,
  Table,
  TagSelect,
  TagGroup,
  TextEditor,
  TriState,
};

//controls with transient label
const controls = {
  Select,
  MultiSelect,
  Tag,
  DateInput,
  Count,
  //controls that may be wrapped with Decorator
  decoratable: {
    TextInput,
    NumberInput,
    MaskedInput,
    TextArea,
    Duration,
  },
};

DefaultControl.propTypes = {
  type: PropTypes.string,
};
function DefaultControl({ type }) {
  return <h6>No control defined for type: {type}</h6>;
}

export const renderer = (type) => {
  const Ctrl =
    controls.decoratable[type] ||
    controls[type] ||
    directControls[type];

  return Ctrl || DefaultControl;
};

export const isDirect = (type) => !!directControls[type];
