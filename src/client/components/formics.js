import { _ } from '@app/helpers';
import { calc } from './helpers';
//import Formit from '@app/components/formit';
//import FormGrid from '@app/components/formGrid';
// import Field from '@app/components/formField';
// import Section from '@app/components/formSection';
// import Tabs from '@app/components/formTabs';
// import FormBrowser from '@app/components/formBrowser';
// import Button from '@app/components/base/button';
// import ButtonGroup from '@app/components/base/buttonGroup';
// import Card from '@app/components/base/card';
// import Checkbox from '@app/components/base/checkbox';
// import Callout from '@app/components/base/callout';
// import ControlBar from '@app/components/base/controlBar';
// import Cascader from '@app/components/base/cascader';
// import DateInput from '@app/components/base/dateInput';
// import Dropdown from '@app/components/base/dropdown';
// import Drawer from '@app/components/base/drawer';
// import EditBar from '@app/components/base/editBar';
// import HTML from '@app/components/base/html';
// import Hierarchy from '@app/components/base/hierarchy';
// import InfoTree from '@app/components/base/infoTree';
// import Input from '@app/components/base/input';
// import InputMask from '@app/components/base/inputMask';
// import Icon from '@app/components/base/icon';
// import InputGroup from '@app/components/base/inputGroup';
// import NumericInputSimple from '@app/components/base/numericInput';
// import NumericInput from '@app/components/base/numericInputWithUnit';
// import DatePager from '@app/components/base/pagerDate';
// import Radio from '@app/components/base/radio';
// import Select from '@app/components/base/select';
// import Switch from '@app/components/base/switch';
// import SimpleTable from '@app/components/base/table/tableSimple.js';
// import RefTable from '@app/components/base/table/tableRef.js';
// import HierTable from '@app/components/base/table/tableHier.js';
// import Text from '@app/components/base/text';
// import TextArea from '@app/components/base/textArea';
// import Tree from '@app/components/base/tree';
// import Table from '@app/components/base/table/table.js';

const formics = {
  Formit: () => <div>FormBrowser</div>,
  // FormGrid: () => <div>FormBrowser</div>,
  // FormBox: () => <div>FormBrowser</div>,
  // FormGroup: () => <div>FormBrowser</div>,
  // FormSection: () => <div>FormBrowser</div>,
  // FormTabs: () => <div>FormBrowser</div>,
  // Field: () => <div>FormBrowser</div>,
  // Section: () => <div>FormBrowser</div>,
  FormBrowser: () => <div>FormBrowser</div>,
  Button: () => <div>FormBrowser</div>,
  ButtonGroup: () => <div>FormBrowser</div>,
  Card: () => <div>FormBrowser</div>,
  Cascader: () => <div>FormBrowser</div>,
  Checkbox: () => <div>FormBrowser</div>,
  Callout: () => <div>FormBrowser</div>,
  ControlBar: () => <div>FormBrowser</div>,
  DateInput: () => <div>FormBrowser</div>,
  DatePager: () => <div>FormBrowser</div>,
  Dropdown: () => <div>FormBrowser</div>,
  Drawer: () => <div>FormBrowser</div>,
  EditBar: () => <div>FormBrowser</div>,
  Hierarchy: () => <div>FormBrowser</div>,
  HTML: () => <div>FormBrowser</div>,
  Icon: () => <div>FormBrowser</div>,
  InfoTree: () => <div>FormBrowser</div>,
  Input: () => <div>FormBrowser</div>,
  InputGroup: () => <div>FormBrowser</div>,
  InputMask: () => <div>FormBrowser</div>,
  NumericInput: () => <div>FormBrowser</div>,
  NumericInputSimple: () => <div>FormBrowser</div>,
  Select: () => <div>FormBrowser</div>,
  SimpleTable: () => <div>FormBrowser</div>,
  RefTable: () => <div>FormBrowser</div>,
  HierTable: () => <div>FormBrowser</div>,
  Switch: () => <div>FormBrowser</div>,
  Table: () => <div>FormBrowser</div>,
  Text: () => <div>FormBrowser</div>,
  TextArea: () => <div>FormBrowser</div>,
  Tabs: () => <div>FormBrowser</div>,
  Tree: () => <div>FormBrowser</div>,
  Radio: () => <div>FormBrowser</div>,
  calc,
};
export default formics;

const getFormic = (name) => formics[name];
const renderItem = (item, i) => {
  const { name, props, children = [] } = item,
    Comp = getFormic(name);

  return (
    // eslint-disable-next-line react/prop-types
    <Comp key={props.dataid || i} {...props}>
      {children.map(renderItem)}
    </Comp>
  );
};

const withFormit = (def = {}, ctx, { formId, ...args }) => {
  const itemSchema = def.schema
      ? `type Some { ${def.schema} }`
      : ctx.schema[def.schemaType],
    context = _.pick(ctx, ['lookups', 'refData', 'store']);
  return (
    <formics.Formit
      {...args}
      {...context}
      id={formId}
      schemaType={def.schema && 'Some'}
      schema={itemSchema}>
      {def.form.map((e, i) => renderItem(e, i))}
    </formics.Formit>
  );
};

export { getFormic, withFormit };
