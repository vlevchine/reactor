import PropTypes from 'prop-types';
import Form, {
  Field,
  Section,
  Panel,
  Tabs,
} from '@app/components/formit';
import { Dropdown, Button, TextInput } from '@app/components/core'; //
import '@app/content/styles.css';

const options = [
  {
    icon: 'bars',
    title: 'Edit',
    action: () => {
      console.log('edit');
    },
  },
  {
    icon: 'cog',
    title: 'This is a longer name for option',
    action: () => {
      console.log('add');
    },
  },
  {
    icon: 'cogs',
    title: 'Remove',
    action: () => {
      console.log('remove');
    },
    confirm: 'Are you sure you want to delete this row?',
  },
];
//Display/edit item details - <First11>
const First11 = ({ def, ...rest }) => {
  const query = def.dataQuery[0],
    bound = query?.name || query?.alias,
    onClick = (v, id) => {
      console.log(v, id);
    };

  return (
    <>
      <h4 style={{ marginBottom: '0.5rem' }}>{def.title}</h4>
      <div>
        <TextInput
          value="Out of form"
          dataid="out"
          clear
          onChange={onClick}
          style={{ width: '22rem' }}
        />
        &nbsp;&nbsp;&nbsp;
        <Button text="button" onClick={onClick} />
        &nbsp;&nbsp;&nbsp;
        <Dropdown
          text="Impersonate"
          prepend="user"
          arrow
          //minimal
          place="right"
          options={options}
          // className="lg-1"
        />
      </div>
      <Form
        id="sample"
        layout={{ cols: 2, rows: 5 }}
        title="Sample Form"
        {...rest}
        boundTo={bound}
        context={(v, roles) => ({
          isSteven: v.first === 'Steven',
          isGeologist: roles.includes('geologist'),
        })}>
        <Field
          type="TextInput"
          id="1"
          dataid="first"
          loc={{ col: 1, row: 1 }}
          //style={{ width: '20rem' }}
          // intent="warning"
          //   clear
          prepend="user"
          append="cog"
          label="First name 1"
          hint="Hello, it's me"
        />
        <Section
          title="Section #AAA"
          id="sec1"
          loc={{ col: 1, row: 2, colSpan: 2 }}
          layout={{ cols: 4, rows: 2 }}>
          <Field
            type="TextInput"
            id="1"
            dataid="email"
            loc={{ col: 1, row: 1 }}
            intent="success"
            clear
            prepend="user"
            append="cog"
            label="E-mail"
            message="Success here..."
          />
          <Field
            id="2"
            type="RawHtml"
            loc={{ col: 3, row: 2 }}
            style="color: red">
            <h4 style={{ color: 'blue' }}>HTML cell</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore
              magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea
              commodo consequat.
            </p>
          </Field>
          <Field
            type="TextInput"
            id="3"
            dataid="email"
            loc={{ col: 1, row: 1 }}
            intent="success"
            clear
            prepend="user"
            append="cog"
            label="E-mail"
            message="Success here..."
          />
          <Field
            type="TextInput"
            id="4"
            dataid="first"
            loc={{ col: 2, row: 1 }}
            clear
            prepend="cogs"
            appendType="text"
            append="m"
            label="First name"
            message="Testing it"
          />
          <Field
            type="NumberInput"
            dataid="height"
            loc={{ col: 1, row: 2 }}
            clear
            prepend="user"
            label="Person height"
          />
          <Field
            type="Select"
            id="5"
            dataid="film"
            loc={{ col: 2, row: 2 }}
            label="Select Movie"
            prepend="user"
            clear
            search
            //disabled
            intent="danger"
            //style={{ width: '22rem' }}
            filterBy="title"
            message="Not nice error"
            display={(t) => `${t.title}, ${t.year}`}
          />
          <Field
            type="TagGroup"
            id="6"
            dataid="films"
            loc={{ col: 3, row: 1 }}
            clear
            prepend="user"
            display="title"
            intent="warning"
            tagIntent="success"
            initials
            editable
            //style={{ width: '26rem' }}
            //disabled
            label="Label here"
          />
          <Field
            type="DateInput"
            id="7"
            dataid="release"
            loc={{ col: 4, row: 2 }}
            // style={{ color: 'blue' }}
            // width="30rem"
            clear
            intent="success"
            prepend="user"
            label="Date input"
            error="Warning..."
          />
        </Section>
        <Panel
          id="panel1"
          title="Section #AAA"
          loc={{ col: 1, colSpan: 2, row: 3 }}
          layout={{ cols: 4, rows: 2 }}>
          <Field
            type="TextInput"
            dataid="last"
            loc={{ col: 1, row: 1 }}
            clear
            prepend="user"
            //append="tint"
            label="Last name"
            message="Testing it"
          />
          <Field
            type="Checkbox"
            dataid="active"
            loc={{ col: 2, row: 1 }}
            //toggle
            intent="success"
            label="Hello"
            text="A Boolean attribute indicating whether or not this checkbox is checked by default (when the page loads). It does not indicate whether this checkbox is currently checked:"
          />
          <Field
            type="MultiSelect"
            dataid="films"
            loc={{ col: 3, row: 1 }}
            label="Select Movie"
            prepend="user"
            //minimal
            initials
            intent="warning"
            clear
            search
            //filterBy="title"
            error="Not nice error"
            display={(item) => `${item.title}, ${item.year}`}
          />
          <Field
            type="Cascade"
            loc={{ col: 1, row: 2, colSpan: 3 }}
            dataid="costCenter"
            label="Operation"
            labels={['Cost center', 'Account', 'Sub-Account']}
            display="name"
            //minimal
            horizontal
            prepend="user"
            clear
            search
            filterBy="title"
          />
          {/* <Field
            component="Info"
            loc={{ col: 4, row: 1 }}
            text="Select Movies"
          /> */}
          <Field
            type="TextArea"
            dataid="comment"
            loc={{ col: 4, row: 2 }}
            intent="success"
            label="Comment"
            clear
            rows="5"
          />
        </Panel>
        <Tabs
          id="tabList"
          title="Tabs"
          loc={{ col: 1, row: 4, colSpan: 2 }}>
          <Tabs.Tab
            id="1"
            //   hide={(s) => s.isGeologist}
            title="First"
            layout={{ cols: 2, rows: 2 }}>
            <Field
              type="Radio"
              id="film1"
              dataid="film"
              loc={{ col: 1, row: 1 }}
              //horizontal
              label="Select Movie"
              display="title"
            />
          </Tabs.Tab>
          <Tabs.Tab
            id="2"
            title="Second"
            scope="address"
            layout={{ cols: 1, rows: 2 }}>
            <Field
              type="TextInput"
              dataid="first"
              //style={{ width: '42rem' }}
              prepend="times"
              intent="warning"
              label="Label two"
            />
          </Tabs.Tab>
          <Tabs.Tab
            id="3"
            title="Third one"
            layout={{ cols: 1, rows: 4 }}>
            <Field
              type="TextArea"
              dataid="comment"
              loc={{ col: 1, row: 1, colSpan: 2 }}
              intent="success"
              label="Comment"
              debounce={600}
              clear
              rows="5"
            />
          </Tabs.Tab>
        </Tabs>
      </Form>
      <h3>hello</h3>
    </>
  );
};

First11.propTypes = {
  def: PropTypes.object,
  rest: PropTypes.object,
};

export default First11;
