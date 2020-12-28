import Accordion from './accordion';
import Alert from './alert';
import Button, { ConfirmButton, ButtonGroup } from './button';
import Collapsible from './collapsible';
import Icon, { Info } from './icon';
// import Drawer from './drawer';
// import Dropdown, { Confirm } from './dropdown';
// import Overlay from './overlay';
// import Modal from './modal';
import Input from './input';
import InputNumber from './inputNumber';
import InputObservable from './inputObservable';
import InputWrapper from '../inputWrapper';
// import MaskedInput from './maskedInput';
// import DateInput from './inputDate';
// import Popover from './popover';
import Radio from './radio';
// import MultiSelect from './selectMulti';
// import Select from './select';
// import Cascade from './selectCascade';
// //import Table from './table';
// import TextArea from './textarea';
// import Checkbox from './checkbox';
// import TagGroup, { Tag } from './tag';
// import Toaster from './toaster';
// import InputControl from './inputControl';
// import Portal from './portal';
import { decorate } from './helpers';
import './styles.css';

const Decorated = {
  // Input: (props) => decorate(Input, props, { withIcons: true }),
  // TextArea: (props) => decorate(TextArea, props, { withIcons: true }),
  // MaskedInput: (props) =>
  //   decorate(MaskedInput, props, { withIcons: true }),
  // TagGroup: (props) => decorate(TagGroup, props),
  // Checkbox: (props) =>
  //   decorate(Checkbox, props, { labelFixed: true }),
  Radio: (props) => decorate(Radio, props, { labelFixed: true }),
  // Confirm: (props) => decorate(Confirm, props, { labelFixed: true }),
  // Dropdown: (props) =>
  //   decorate(Dropdown, props, { labelFixed: true }),
  // Select: (props) => decorate(Select, props),
  // MultiSelect: (props) => decorate(MultiSelect, props),
  // DateInput: (props) => decorate(DateInput, props),
  // Cascade,
};

export {
  Accordion,
  Alert,
  Button,
  ButtonGroup,
  // Cascade,
  // Checkbox,
  Collapsible,
  // Confirm,
  ConfirmButton,
  // Drawer,
  // Dropdown,
  Icon,
  Info,
  Input,
  InputNumber,
  InputObservable,
  InputWrapper,
  // DateInput,
  // MaskedInput,
  // Modal,
  // MultiSelect,
  // Overlay,
  // Popover,
  // Portal,
  Radio,
  // Select,
  //Table,
  // Tag,
  // TagGroup,
  // TextArea,
  // Toaster,
  Decorated,
};
