import Accordion from './collapsible/accordion';
import Alert from './alert/alert';
import AddItem from './list/addItem';
import Button, {
  ButtonGroup,
  AddButton,
  DeleteButton,
  CancelButton,
  SaveButton,
} from './button/button';
import ClearButton from './button/clearButton';
import ConfirmButton, {
  ConfirmDeleteBtn,
  EditorButtonGroup,
} from './button/confirmButton';
import Collapsible from './collapsible/collapsible';
import Card, { CardStack } from './collapsible/card';
import CollapsiblePanel from './collapsible/collapsiblePanel';
import Checkbox from './boxed/checkbox';
import Decorator, { Decorate } from './decorator';
import Dropdown from './popover/dropdown';
import Duration from './inputs/duration';
import Echo from './echo';
import IconSymbol from './icon/icon_symbol';
import Info from './icon/info';
import Icon, { I } from './icon/icon_svg';
import InputGroup from './inputGroup';
import TextInput, { SearchInput } from './inputs/input';
import NumberInput, { InputPercent } from './inputs/inputNumber';
import InputTyped from './inputTyped';
import EditableText from './inputs/editableText';
import List, { ListItem, ItemList } from './list/list';
import { Menu, MenuItem, SplitButton } from './popover/menu';
import Popover from './popover/popover';
import Radio from './boxed/radio';
import { Select, Count } from './popover/select';
import Switch from './boxed/switch';
import MultiSelect from './popover/selectMulti';
import Cascade from './popover/selectCascade';
import TagSelect from './boxed/tagSelect';
import TextArea from './inputs/textarea';
import TextEditor from './inputs/textEditor';
import Tabs, { TabStrip, Tab } from './tabs';
import TriState from './boxed/triState';
import MaskedInput from './inputs/maskedInput';
import DateInput from './popover/inputDate';
import Portal from './portal';
import Drawer from './drawer'; //, { Confirm }
import TagGroup, { Tag } from './tag';
import Toast from './toast';
import Tree from './list/tree';
import { renderer, editor } from './renderers';
import './styles.css';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import Panel from './framerMotion/panel';
import TagInput from './tagInput';
export { getIcon } from './icon';

const framer = { Panel };
Label.propTypes = {
  id: PropTypes.string,
  text: PropTypes.string,
  className: PropTypes.string,
};
export function Label({ id, text, className }) {
  return (
    <label
      htmlFor={id}
      className={classNames(['lbl lbl-static', className])}>
      {text}
    </label>
  );
}
Readonly.propTypes = {
  txt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
};
export function Readonly({ txt, style }) {
  return (
    <span className="readonly text-dots" style={style}>
      {_.isNil(txt) ? 'N / A' : txt}
    </span>
  );
}

Title.propTypes = {
  text: PropTypes.string,
  _default: PropTypes.string,
  Comp: PropTypes.string,
};
export function Title({ text, Comp = 'span', _default }) {
  const txt = text || _default || '';
  return <Comp> {txt} </Comp>;
}

WithPrompt.propTypes = {
  condition: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  text: PropTypes.string,
  children: PropTypes.any,
};
export function WithPrompt({ condition, text, children }) {
  return condition ? (
    children
  ) : (
    <h3 className="prompt">{text} ...</h3>
  );
}

const baseInputs = {
  Checkbox,
  Switch,
  Select,
  NumberInput,
  DateInput,
  TextInput,
};
export {
  baseInputs,
  Accordion,
  AddItem,
  Alert,
  Button,
  AddButton,
  DeleteButton,
  CancelButton,
  SaveButton,
  ButtonGroup,
  Card,
  CardStack,
  ClearButton,
  ConfirmButton,
  ConfirmDeleteBtn,
  Cascade,
  Checkbox,
  Collapsible,
  CollapsiblePanel,
  Count,
  // Confirm,
  DateInput,
  Decorator,
  Decorate,
  Drawer,
  Dropdown,
  Duration,
  Echo,
  EditorButtonGroup,
  EditableText,
  I,
  Icon,
  IconSymbol,
  Info,
  InputTyped,
  InputGroup,
  ItemList,
  List,
  ListItem,
  Menu,
  MenuItem,
  MaskedInput,
  MultiSelect,
  NumberInput,
  InputPercent,
  Popover,
  Portal,
  Radio,
  SearchInput,
  Select,
  SplitButton,
  Switch,
  Tabs,
  Tab,
  TabStrip,
  Tag,
  TagGroup,
  TagInput,
  TagSelect,
  TextArea,
  TextEditor,
  TextInput,
  Toast,
  TriState,
  Tree,
  renderer,
  editor,
  framer,
};
