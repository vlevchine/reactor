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
  MaskInput,
  MultiSelect,
  ItemList,
  Radio,
  Select,
  Tag,
  TagGroup,
  TagSelect,
  TextInput,
  TextArea,
  TextEditor,
  TriState,
  Tree,
} from '@app/components/core';
import { directControls } from '@app/components';

const { Table, BasicTable, RawHtml } = directControls;
Markup.propTypes = {
  children: PropTypes.any,
  style: PropTypes.object,
};
export default function Markup({ style, children }) {
  return <div style={style}>{children}</div>;
}

//Controls with fixed label
const direct = {
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
  ItemList,
  RawHtml,
  Table,
  TagSelect,
  TagGroup,
  TextEditor,
  TriState,
  Tree,
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
    MaskInput,
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
    controls.decoratable[type] || controls[type] || direct[type];

  return Ctrl || DefaultControl;
};

export const isDirect = (type) => !!direct[type];
